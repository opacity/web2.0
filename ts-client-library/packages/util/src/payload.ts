import { keccak256 } from "js-sha3"

import { CryptoMiddleware } from "@opacity/middleware"
import { bytesToHex } from "./hex"

export type PayloadArgs<P extends { [key: string]: any } = { [key: string]: any }> = {
	crypto: CryptoMiddleware
	payload: P
	key?: Uint8Array
	payloadKey?: string
}

export type PayloadData = {
	[payloadKey: string]: string
	signature: string
	publicKey: string
	hash: string
}

export const getPayload = async <P extends { [key: string]: any }>({
	crypto,
	payload: rawPayload,
	key,
	payloadKey = "requestBody",
}: PayloadArgs<P>) => {
	Object.assign(rawPayload, { timestamp: Math.floor(Date.now() / 1000) })

	const payload = JSON.stringify(rawPayload)
	const hash = new Uint8Array(keccak256.arrayBuffer(payload))
	const signature = await crypto.sign(key, hash)
	const pubKey = await crypto.getPublicKey(key)

	const data: PayloadData = {
		[payloadKey]: payload,
		signature: bytesToHex(signature),
		publicKey: bytesToHex(pubKey),
		hash: bytesToHex(hash),
	}

	return data
}

export type PayloadFDArgs<
	P extends { [key: string]: any } = { [key: string]: any },
	EP extends { [key: string]: any } = { [key: string]: Uint8Array }
> = {
	crypto: CryptoMiddleware
	payload: P
	extraPayload: EP
	key?: Uint8Array
	payloadKey?: string
}

export const getPayloadFD = async <P extends { [key: string]: any }, EP extends { [key: string]: any }>({
	crypto,
	payload: rawPayload,
	extraPayload,
	key,
	payloadKey = "requestBody",
}: PayloadFDArgs<P, EP>) => {
	Object.assign(rawPayload, { timestamp: Math.floor(Date.now() / 1000) })

	const payload = JSON.stringify(rawPayload)
	const hash = new Uint8Array(keccak256.arrayBuffer(payload))
	const signature = await crypto.sign(key, hash)
	const pubKey = await crypto.getPublicKey(key)

	const data = new FormData()

	data.append(payloadKey, payload)
	data.append("signature", bytesToHex(signature))
	data.append("publicKey", bytesToHex(pubKey))
	data.append("hash", bytesToHex(hash))

	if (extraPayload) {
		Object.keys(extraPayload).forEach((key) => {
			data.append(key, new Blob([extraPayload[key].buffer]), key)
		})
	}

	return data
}
