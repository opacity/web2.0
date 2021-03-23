import { bytesToHex } from "@opacity/util/src/hex"
import { CryptoMiddleware, NetworkMiddleware } from "@opacity/middleware"
import { getPayload } from "@opacity/util/src/payload"
import { extractPromise } from "@opacity/util/src/promise"
import { FileSystemObjectDeleteEvent, FileSystemObjectEvents } from "./events"

export class DeletionError extends Error {
	constructor (location: string, err: string) {
		super(`DeletionError: Failed to delete "${location}". Error: "${err}"`)
	}
}

export type FileSystemObjectConfig = {
	crypto: CryptoMiddleware
	net: NetworkMiddleware

	storageNode: string
}

export class FileSystemObject extends EventTarget {
	_handle?: Uint8Array

	config: FileSystemObjectConfig

	_deleter = extractPromise()

	constructor (handle: Uint8Array, config: FileSystemObjectConfig) {
		super()

		this._handle = handle

		this.config = config
	}

	async delete () {
		if (!this._handle) {
			console.warn("filesystem object already deleted")

			return
		}

		this.dispatchEvent(new FileSystemObjectDeleteEvent({}))

		const location = this._handle.slice(0, 32)

		const payload = await getPayload({
			crypto: this.config.crypto,
			payload: { fileID: bytesToHex(location) },
		})

		const res = await this.config.net.POST(
			this.config.storageNode + "/api/v1/delete",
			undefined,
			JSON.stringify(payload),
			(b) => new Response(b).text(),
		)

		if (res.status != 200) {
			throw new DeletionError(bytesToHex(location), res.data)
		}

		// resolve
		this._deleter[1]()

		// promise
		await this._deleter[0]

		// clear sensitive data
		delete this._handle
	}
}
