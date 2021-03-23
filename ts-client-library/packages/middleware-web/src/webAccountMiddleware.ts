import HDKey from "hdkey/lib/hdkey"

import { CryptoMiddleware } from "@opacity/middleware"
import { hashToPath, pathHash } from "@opacity/util/src/derive"

export type WebAccountMiddlewareArgs = {
	asymmetricKey?: Uint8Array
	symmetricKey?: Uint8Array
}

export class WebAccountMiddleware implements CryptoMiddleware {
	asymmetricKey?: Uint8Array
	symmetricKey?: Uint8Array

	constructor ({ symmetricKey, asymmetricKey }: WebAccountMiddlewareArgs = {}) {
		this.asymmetricKey = asymmetricKey
		this.symmetricKey = symmetricKey
	}

	async getRandomValues (size: number): Promise<Uint8Array> {
		return crypto.getRandomValues(new Uint8Array(size))
	}

	async getPublicKey (k: Uint8Array | undefined = this.asymmetricKey): Promise<Uint8Array> {
		if (k == undefined) {
			throw new ReferenceError("WebAccountMiddleware: key must not be undefined")
		}

		const hd = new HDKey()
		hd.privateKey = Buffer.from(k.slice(0, 32))
		hd.chainCode = Buffer.from(k.slice(32))

		return hd.publicKey
	}

	async derive (k: Uint8Array | undefined = this.asymmetricKey, p: string): Promise<Uint8Array> {
		if (k == undefined) {
			throw new ReferenceError("WebAccountMiddleware: key must not be undefined")
		}

		const hd = new HDKey()
		hd.privateKey = Buffer.from(k.slice(0, 32))
		hd.chainCode = Buffer.from(k.slice(32))

		const child = hd.derive("m/" + hashToPath(pathHash(p)))

		return new Uint8Array(Array.from(child.privateKey).concat(Array.from(child.chainCode)))
	}

	async sign (k: Uint8Array | undefined = this.asymmetricKey, d: Uint8Array): Promise<Uint8Array> {
		if (k == undefined) {
			throw new ReferenceError("WebAccountMiddleware: key must not be undefined")
		}

		const hd = new HDKey()
		hd.privateKey = Buffer.from(k.slice(0, 32))
		hd.chainCode = Buffer.from(k.slice(32))

		const sig = hd.sign(Buffer.from(d))

		return sig
	}

	async generateSymmetricKey (): Promise<Uint8Array> {
		const key = await crypto.subtle.exportKey(
			"raw",
			await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]),
		)
		return new Uint8Array(key)
	}

	async encrypt (k: Uint8Array | undefined = this.symmetricKey, d: Uint8Array): Promise<Uint8Array> {
		if (k == undefined) {
			throw new ReferenceError("WebAccountMiddleware: key must not be undefined")
		}

		const key = await crypto.subtle.importKey("raw", k, "AES-GCM", false, ["encrypt"])
		const iv = crypto.getRandomValues(new Uint8Array(16))
		const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv, tagLength: 128 }, key, d))
		return new Uint8Array([...encrypted, ...iv])
	}

	async decrypt (k: Uint8Array | undefined = this.symmetricKey, ct: Uint8Array): Promise<Uint8Array> {
		if (k == undefined) {
			throw new ReferenceError("WebAccountMiddleware: key must not be undefined")
		}

		const key = await crypto.subtle.importKey("raw", k, "AES-GCM", false, ["decrypt"])
		return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: ct.slice(-16) }, key, ct.slice(0, -16)))
	}
}
