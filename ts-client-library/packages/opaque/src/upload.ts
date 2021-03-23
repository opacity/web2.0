import { TransformStream, WritableStream } from "web-streams-polyfill/ponyfill"

import { blockSize, blockSizeOnFS, numberOfBlocks, sizeOnFS } from "@opacity/util/src/blocks"
import { bytesToHex } from "@opacity/util/src/hex"
import { CryptoMiddleware, NetworkMiddleware } from "@opacity/middleware"
import { extractPromise } from "@opacity/util/src/promise"
import { FileMeta } from "./filemeta"
import { getPayload, getPayloadFD } from "@opacity/util/src/payload"
import {
	IUploadEvents,
	UploadBlockStartedEvent,
	UploadBlockFinishedEvent,
	UploadFinishedEvent,
	UploadMetadataEvent,
	UploadPartStartedEvent,
	UploadPartFinishedEvent,
	UploadProgressEvent,
	UploadStartedEvent,
} from "./events"
import { numberOfPartsOnFS, partSize } from "@opacity/util/src/parts"
import { OQ } from "@opacity/util/src/oqueue"
import { Retry } from "@opacity/util/src/retry"
import { Uint8ArrayChunkStream } from "@opacity/util/src/streams"

export type UploadConfig = {
	storageNode: string

	crypto: CryptoMiddleware
	net: NetworkMiddleware

	queueSize?: {
		encrypt?: number
		net?: number
	}
}

export type UploadArgs = {
	config: UploadConfig
	path: string
	name: string
	meta: FileMeta
}

type UploadInitPayload = {
	fileHandle: string
	fileSizeInByte: number
	endIndex: number
}

type UploadInitExtraPayload = {
	metadata: Uint8Array
}

type UploadPayload = {
	fileHandle: string
	partIndex: number
	endIndex: number
}

type UploadExtraPayload = {
	chunkData: Uint8Array
}

type UploadStatusPayload = {
	fileHandle: string
}

export class Upload extends EventTarget implements IUploadEvents {
	config: UploadConfig

	_location?: Uint8Array
	_key?: Uint8Array

	_cancelled = false
	_errored = false
	_started = false
	_done = false

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

	_size: number
	_sizeOnFS: number
	_numberOfBlocks: number
	_numberOfParts: number

	get size () {
		return this._size
	}
	get sizeOnFS () {
		return this._sizeOnFS
	}

	_name: string
	_path: string
	_metadata: FileMeta

	_netQueue?: OQ<Uint8Array>
	_encryptQueue?: OQ<Uint8Array>

	_buffer: number[] = []
	_dataOffset: number = 0
	_encryped: number[] = []
	_partOffset: number = 0

	_output?: TransformStream<Uint8Array, Uint8Array>

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

	constructor ({ config, name, path, meta }: UploadArgs) {
		super()

		this.config = config
		this.config.queueSize = this.config.queueSize || {}
		this.config.queueSize.encrypt = this.config.queueSize.encrypt || 3
		this.config.queueSize.net = this.config.queueSize.net || 1

		this._name = name
		this._path = path
		this._metadata = meta

		this._size = this._metadata.size
		this._sizeOnFS = sizeOnFS(this._size)
		this._numberOfBlocks = numberOfBlocks(this._size)
		this._numberOfParts = numberOfPartsOnFS(this._sizeOnFS)

		const u = this

		const [finished, resolveFinished, rejectFinished] = extractPromise()
		this._finished = finished
		this._resolve = (val) => {
			u._done = true
			resolveFinished(val)

			this._timestamps.end = Date.now()
			this.dispatchEvent(
				new UploadFinishedEvent({
					start: this._timestamps.start!,
					end: this._timestamps.end,
					duration: this._timestamps.end - this._timestamps.start! - this._timestamps.pauseDuration,
					realDuration: this._timestamps.end - this._timestamps.start!,
				}),
			)
		}
		this._reject = (err) => {
			u._errored = true

			u.pause()

			rejectFinished(err)
		}
	}

	async generateHandle () {
		if (!this._key) {
			// generate key
			this._key = await this.config.crypto.generateSymmetricKey()
		}

		if (!this._location) {
			this._location = await this.config.crypto.getRandomValues(32)
		}
	}

	async start (): Promise<TransformStream<Uint8Array, Uint8Array> | undefined> {
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

		await this.generateHandle()

		this.dispatchEvent(new UploadMetadataEvent({ metadata: this._metadata }))

		const u = this

		const encryptedMeta = await u.config.crypto.encrypt(u._key!, new TextEncoder().encode(JSON.stringify(u._metadata)))

		const fd = await getPayloadFD<UploadInitPayload, UploadInitExtraPayload>({
			crypto: u.config.crypto,
			payload: {
				fileHandle: bytesToHex(u._location!),
				fileSizeInByte: u._sizeOnFS,
				endIndex: numberOfPartsOnFS(u._sizeOnFS),
			},
			extraPayload: {
				metadata: encryptedMeta,
			},
		})

		await u.config.net.POST(u.config.storageNode + "/api/v1/init-upload", {}, fd).catch(u._reject)

		u.dispatchEvent(
			new UploadStartedEvent({
				time: this._timestamps.start,
				numberOfBlocks: this._numberOfBlocks,
				numberOfParts: this._numberOfParts,
			}),
		)

		const encryptQueue = new OQ<Uint8Array | undefined>(this.config.queueSize!.net, Number.MAX_SAFE_INTEGER)
		const netQueue = new OQ<Uint8Array | undefined>(this.config.queueSize!.encrypt)

		u._encryptQueue = encryptQueue
		u._netQueue = netQueue

		let blockIndex = 0
		let partIndex = 0

		const partCollector = new Uint8ArrayChunkStream(
			partSize,
			new ByteLengthQueuingStrategy({ highWaterMark: this.config.queueSize!.encrypt! * partSize + 1 }),
			new ByteLengthQueuingStrategy({ highWaterMark: this.config.queueSize!.encrypt! * partSize + 1 }),
		)

		u._output = new TransformStream<Uint8Array, Uint8Array>(
			{
				transform (chunk, controller) {
					controller.enqueue(chunk)
				},
			},
			new ByteLengthQueuingStrategy({ highWaterMark: this.config.queueSize!.encrypt! * partSize + 1 }),
		)

		u._output.readable.pipeThrough(partCollector).pipeTo(
			new WritableStream<Uint8Array>({
				async write (part) {
					// console.log("write part")

					u.dispatchEvent(new UploadPartStartedEvent({ index: partIndex }))

					const p = new Uint8Array(sizeOnFS(part.length))

					netQueue.add(
						partIndex++,
						async (partIndex) => {
							if (u._cancelled || u._errored) {
								return
							}

							for (let i = 0; i < numberOfBlocks(part.length); i++) {
								const block = part.slice(i * blockSize, (i + 1) * blockSize)

								encryptQueue.add(
									blockIndex++,
									async (blockIndex) => {
										if (u._cancelled || u._errored) {
											return
										}

										u.dispatchEvent(new UploadBlockStartedEvent({ index: blockIndex }))

										return await u.config.crypto.encrypt(u._key!, block)
									},
									async (encrypted, blockIndex) => {
										// console.log("write encrypted")

										if (!encrypted) {
											return
										}

										let byteIndex = 0
										for (let byte of encrypted) {
											p[i * blockSizeOnFS + byteIndex] = byte
											byteIndex++
										}

										u.dispatchEvent(new UploadBlockFinishedEvent({ index: blockIndex }))
										u.dispatchEvent(new UploadProgressEvent({ progress: blockIndex / u._numberOfBlocks }))
									},
								)
							}

							await encryptQueue.waitForCommit(blockIndex - 1)

							const res = await new Retry(
								async () => {
									const fd = await getPayloadFD<UploadPayload, UploadExtraPayload>({
										crypto: u.config.crypto,
										payload: {
											fileHandle: bytesToHex(u._location!),
											partIndex: partIndex + 1,
											endIndex: u._numberOfParts,
										},
										extraPayload: {
											chunkData: p,
										},
									})

									return await u.config.net.POST(u.config.storageNode + "/api/v1/upload", {}, fd)
								},
								{
									firstTimer: 500,
									handler: (err) => {
										console.warn(err)

										return false
									},
								},
							)
								.start()
								.catch(u._reject)

							if (!res) {
								return
							}

							// console.log(res)

							u.dispatchEvent(new UploadPartFinishedEvent({ index: partIndex }))

							return p
						},
						async (part, partIndex) => {
							if (!part) {
								return
							}
						},
					)
				},
				async close () {
					await encryptQueue.waitForClose()
				},
			}),
		)
		;(async () => {
			encryptQueue.add(
				numberOfBlocks(u._size),
				() => {},
				async () => {
					encryptQueue.close()
				},
			)

			netQueue.add(
				u._numberOfParts,
				() => {},
				async () => {
					const data = await getPayload<UploadStatusPayload>({
						crypto: u.config.crypto,
						payload: {
							fileHandle: bytesToHex(u._location!),
						},
					})

					const res = (await u.config.net
						.POST(u.config.storageNode + "/api/v1/upload-status", {}, JSON.stringify(data))
						.catch(u._reject)) as void

					// console.log(res)

					netQueue.close()
				},
			)

			await encryptQueue.waitForClose()
			await netQueue.waitForClose()

			u._resolve()
		})()

		return u._output
	}

	async finish () {
		return this._finished
	}

	async cancel () {
		this._cancelled = true
		this._reject()
	}
}
