import { ReadableStream, WritableStream, TransformStream } from "web-streams-polyfill/ponyfill"

import { blockSizeOnFS, numberOfBlocks, numberOfBlocksOnFS, sizeOnFS } from "@opacity/util/src/blocks"
import { blocksPerPart, numberOfPartsOnFS, partSizeOnFS } from "@opacity/util/src/parts"
import { bytesToHex } from "@opacity/util/src/hex"
import { CryptoMiddleware, NetworkMiddleware } from "@opacity/middleware"
import {
	DownloadBlockStartedEvent,
	DownloadBlockFinishedEvent,
	DownloadFinishedEvent,
	DownloadMetadataEvent,
	DownloadPartStartedEvent,
	DownloadPartFinishedEvent,
	DownloadProgressEvent,
	DownloadStartedEvent,
	IDownloadEvents,
} from "./events"
import { extractPromise } from "@opacity/util/src/promise"
import { FileMeta } from "./filemeta"
import { OQ } from "@opacity/util/src/oqueue"
import { polyfillReadableStream } from "@opacity/util/src/streams"
import { serializeEncrypted } from "@opacity/util/src/serializeEncrypted"
import { Uint8ArrayChunkStream } from "@opacity/util/src/streams"

export type DownloadConfig = {
	storageNode: string

	crypto: CryptoMiddleware
	net: NetworkMiddleware

	queueSize?: {
		net?: number
		decrypt?: number
	}
}

export type DownloadArgs = {
	config: DownloadConfig
	handle: Uint8Array
}

export class Download extends EventTarget implements IDownloadEvents {
	config: DownloadConfig

	_location: Uint8Array
	_key: Uint8Array

	_cancelled = false
	_errored = false
	_started = false
	_done = false
	_paused = false

	get cancelled () {
		return this._cancelled
	}
	get errored () {
		return this._errored
	}
	get started () {
		return this._started
	}
	get done () {
		return this._done
	}

	_unpaused = Promise.resolve()
	_unpause?: (value: void) => void

	_finished: Promise<void>
	_resolve: (value?: void) => void
	_reject: (reason?: any) => void

	_size?: number
	_sizeOnFS?: number
	_numberOfBlocks?: number
	_numberOfParts?: number

	get size () {
		return this._size
	}
	get sizeOnFS () {
		return this._sizeOnFS
	}

	_downloadUrl?: string
	_metadata?: FileMeta

	_netQueue?: OQ<void>
	_decryptQueue?: OQ<Uint8Array>

	_output?: ReadableStream<Uint8Array>

	_timestamps: { start?: number; end?: number; pauseDuration: number } = {
		start: undefined,
		end: undefined,
		pauseDuration: 0,
	}

	pause () {
		const t = Date.now()

		const [unpaused, unpause] = extractPromise()
		this._unpaused = unpaused
		this._unpause = () => {
			this._timestamps.pauseDuration += Date.now() - t
			unpause()
		}
	}

	unpause () {
		if (this._unpause) {
			this._unpause()
			this._unpause = undefined
		}
	}

	constructor ({ config, handle }: DownloadArgs) {
		super()

		this.config = config
		this.config.queueSize = this.config.queueSize || {}
		this.config.queueSize.net = this.config.queueSize.net || 3
		this.config.queueSize.decrypt = this.config.queueSize.decrypt || blocksPerPart

		this._location = handle.slice(0, 32)
		this._key = handle.slice(32)

		const d = this

		const [finished, resolveFinished, rejectFinished] = extractPromise()
		this._finished = finished
		this._resolve = (val) => {
			d._done = true
			resolveFinished(val)

			this._timestamps.end = Date.now()
			this.dispatchEvent(
				new DownloadFinishedEvent({
					start: this._timestamps.start!,
					end: this._timestamps.end,
					duration: this._timestamps.end - this._timestamps.start! - this._timestamps.pauseDuration,
					realDuration: this._timestamps.end - this._timestamps.start!,
				}),
			)
		}
		this._reject = (err) => {
			d._errored = true

			rejectFinished(err)
		}
	}

	async downloadUrl (): Promise<string | undefined> {
		if (this._downloadUrl) {
			return this._downloadUrl
		}

		const d = this

		const downloadUrlRes = await d.config.net
			.POST(
				d.config.storageNode + "/api/v1/download",
				undefined,
				JSON.stringify({ fileID: bytesToHex(d._location) }),
				async (b) => JSON.parse(new TextDecoder("utf8").decode(await new Response(b).arrayBuffer())).fileDownloadUrl,
			)
			.catch(d._reject)

		if (!downloadUrlRes) {
			return
		}

		const downloadUrl = downloadUrlRes.data

		this._downloadUrl = downloadUrl

		return downloadUrl
	}

	async metadata (): Promise<FileMeta | undefined> {
		if (this._metadata) {
			return this._metadata
		}

		const d = this

		if (!this._downloadUrl) {
			await this.downloadUrl()
		}

		const metadataRes = await d.config.net
			.GET(
				this._downloadUrl + "/metadata",
				undefined,
				undefined,
				async (b) =>
					await serializeEncrypted<FileMeta>(
						d.config.crypto,
						new Uint8Array(await new Response(b).arrayBuffer()),
						d._key,
					),
			)
			.catch(d._reject)

		if (!metadataRes) {
			return
		}

		const metadata = metadataRes.data
		// old uploads will not have this defined
		metadata.lastModified = metadata.lastModified || Date.now()
		d._metadata = metadata
		this.dispatchEvent(new DownloadMetadataEvent({ metadata }))

		return metadata
	}

	async start (): Promise<ReadableStream<Uint8Array> | undefined> {
		if (this._cancelled || this._errored) {
			return
		}

		if (this._started) {
			return this._output
		}

		this._started = true
		this._timestamps.start = Date.now()

		const ping = await this.config.net
			.GET(this.config.storageNode + "", undefined, undefined, async (d) =>
				new TextDecoder("utf8").decode(await new Response(d).arrayBuffer()),
			)
			.catch(this._reject)

		// server didn't respond
		if (!ping) {
			return
		}

		const d = this

		const downloadUrl = await d.downloadUrl().catch(d._reject)
		if (!downloadUrl) {
			return
		}

		const metadata = await d.metadata().catch(d._reject)
		if (!metadata) {
			return
		}

		d._size = metadata.size
		d._sizeOnFS = sizeOnFS(metadata.size)
		d._numberOfBlocks = numberOfBlocks(d._size)
		d._numberOfParts = numberOfPartsOnFS(d._sizeOnFS)

		d.dispatchEvent(
			new DownloadStartedEvent({
				time: this._timestamps.start,
				numberOfBlocks: this._numberOfBlocks!,
				numberOfParts: this._numberOfParts!,
			}),
		)

		const netQueue = new OQ<void>(this.config.queueSize!.net)
		const decryptQueue = new OQ<Uint8Array | undefined>(this.config.queueSize!.decrypt)

		d._netQueue = netQueue
		d._decryptQueue = decryptQueue

		let partIndex = 0

		d._output = new ReadableStream<Uint8Array>({
			async pull (controller) {
				if (d._cancelled || d._errored) {
					return
				}

				if (partIndex >= d._numberOfParts!) {
					return
				}

				netQueue.add(
					partIndex++,
					async (partIndex) => {
						if (d._cancelled || d._errored) {
							return
						}

						await d._unpaused

						d.dispatchEvent(new DownloadPartStartedEvent({ index: partIndex }))

						const res = await d.config.net
							.GET(
								downloadUrl + "/file",
								{
									range: `bytes=${partIndex * partSizeOnFS}-${
										Math.min(d._sizeOnFS!, (partIndex + 1) * partSizeOnFS) - 1
									}`,
								},
								undefined,
								async (rs) => (rs ? polyfillReadableStream(rs) : undefined),
							)
							.catch(d._reject)

						if (!res || !res.data) {
							return
						}

						let l = 0
						res.data
							.pipeThrough(
								new TransformStream<Uint8Array, Uint8Array>({
									// log progress
									transform (chunk, controller) {
										for (
											let i = Math.floor(l / blockSizeOnFS);
											i < Math.floor((l + chunk.length) / blockSizeOnFS);
											i++
										) {
											d.dispatchEvent(new DownloadBlockStartedEvent({ index: partIndex * blocksPerPart + i }))
										}

										l += chunk.length

										controller.enqueue(chunk)
									},
								}),
							)
							.pipeThrough(new Uint8ArrayChunkStream(partSizeOnFS))
							.pipeTo(
								new WritableStream<Uint8Array>({
									async write (part) {
										for (let i = 0; i < numberOfBlocksOnFS(part.length); i++) {
											decryptQueue.add(
												partIndex * blocksPerPart + i,
												async (blockIndex) => {
													if (d._cancelled || d._errored) {
														return
													}

													let bi = blockIndex % blocksPerPart

													await d._unpaused

													const block = part.slice(bi * blockSizeOnFS, (bi + 1) * blockSizeOnFS)
													const decrypted = await d.config.crypto.decrypt(d._key, block).catch(d._reject)

													if (!decrypted) {
														return
													}

													return decrypted
												},
												async (decrypted, blockIndex) => {
													if (!decrypted) {
														return
													}

													controller.enqueue(decrypted)

													d.dispatchEvent(new DownloadBlockFinishedEvent({ index: blockIndex }))
													d.dispatchEvent(new DownloadProgressEvent({ progress: blockIndex / d._numberOfBlocks! }))
												},
											)
										}
									},
								}),
							)

						await decryptQueue.waitForCommit(Math.min((partIndex + 1) * blocksPerPart, d._numberOfBlocks!) - 1)

						d.dispatchEvent(new DownloadPartFinishedEvent({ index: partIndex }))
					},
					() => {},
				)
			},
			async start (controller) {
				netQueue.add(
					d._numberOfParts!,
					() => {},
					async () => {
						netQueue.close()
					},
				)

				decryptQueue.add(
					numberOfBlocks(d._size!),
					() => {},
					async () => {
						decryptQueue.close()
					},
				)

				Promise.all([netQueue.waitForClose(), decryptQueue.waitForClose()]).then(() => {
					d._resolve()
					controller.close()
				})
			},
			cancel () {
				d._cancelled = true
			},
		})

		return d._output
	}

	async finish () {
		return this._finished
	}

	async cancel () {
		this._cancelled = true

		if (this._output) {
			this._output.cancel()
		}

		this._reject()
	}
}
