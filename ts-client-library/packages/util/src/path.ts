import { posix } from "path-browserify"

export const cleanPath = (path: string) => {
	if (path[0] != posix.sep) {
		throw new Error("Path must be absolute")
	}

	return (
		"/" +
		posix
			.normalize(path)
			.split(posix.sep)
			.filter((d) => d != "")
			.join(posix.sep)
	)
}

export const isPathChild = (parent: string, other: string) => {
	const rel = posix.relative(parent, other)

	if (rel != "" && rel[0] != "." && rel.split(posix.sep).length == 1) {
		return true
	}

	return false
}
