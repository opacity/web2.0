export const arraysEqual = <T>(a: ArrayLike<T>, b: ArrayLike<T>) => {
	for (let i = a.length; -1 < i; i -= 1) {
		if (a[i] !== b[i]) return false
	}
	return true
}
