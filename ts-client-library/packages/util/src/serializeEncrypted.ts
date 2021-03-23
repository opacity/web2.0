import { CryptoMiddleware } from "@opacity/middleware"

export const serializeEncrypted = async <T>(
	crypto: CryptoMiddleware,
	bytes: Uint8Array,
	key: Uint8Array,
): Promise<T> => {
	const v = await crypto.decrypt(key, bytes)
	const s = new TextDecoder("utf-8").decode(v)

	return JSON.parse(s) as T
}
