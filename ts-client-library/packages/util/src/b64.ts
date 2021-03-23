// TODO: these functions are not ideal

export const bytesToB64 = (b: Uint8Array) => {
	return btoa(String.fromCharCode.apply(null, Array.from(b)))
}

export const b64ToBytes = (b64: string) => {
	return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}
