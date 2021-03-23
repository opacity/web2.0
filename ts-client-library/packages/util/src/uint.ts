export const readUInt32BE = (arr: Uint8Array, offset: number) => {
	return arr.slice(offset, offset + 4).reduce((acc, n, i) => acc + n * 2 ** ((3 - i) * 8), 0)
}

export const uint32ToUint8BE = (n: number) => {
	return new Uint8Array([
		(((n & 0xff000000) >> 24) + 0x0100) & 0xff,
		(n & 0x00ff0000) >> 16,
		(n & 0x0000ff00) >> 8,
		n & 0x000000ff,
	])
}

export const uint16ToUint8BE = (n: number) => {
	return new Uint8Array([(n & 0xff00) >> 8, n & 0x00ff])
}
