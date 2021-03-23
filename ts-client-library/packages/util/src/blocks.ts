export const blockSize = 64 * 1024
export const blockOverhead = 32
export const blockSizeOnFS = blockSize + blockOverhead

export const numberOfBlocks = (size: number) => {
	return Math.floor((size - 1) / blockSize) + 1
}

export const numberOfBlocksOnFS = (sizeOnFS: number) => {
	return Math.floor((sizeOnFS - 1) / blockSizeOnFS) + 1
}

export const sizeOnFS = (size: number) => {
	return size + blockOverhead * numberOfBlocks(size)
}
