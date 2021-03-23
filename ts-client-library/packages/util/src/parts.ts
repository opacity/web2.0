import { blockSizeOnFS, sizeOnFS, blockSize } from "./blocks"

export const blocksPerPart = 80
export const partSize = blocksPerPart * blockSize
export const partSizeOnFS = blocksPerPart * blockSizeOnFS

export const numberOfPartsOnFS = (size: number) => {
	return Math.floor((sizeOnFS(size) - 1) / partSizeOnFS) + 1
}
