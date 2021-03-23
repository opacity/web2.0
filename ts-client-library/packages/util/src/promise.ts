export const extractPromise = <T = void>(): [Promise<T>, (v: T | PromiseLike<T>) => void, (reason: any) => void] => {
	let rs: (v: T | PromiseLike<T>) => void, rj: (reason?: any) => void

	const promise = new Promise<T>((resole, reject) => {
		rs = resole
		rj = reject
	})

	return [promise, rs!, rj!]
}
