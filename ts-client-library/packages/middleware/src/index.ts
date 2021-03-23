export interface CryptoMiddleware {
	getRandomValues(size: number): Promise<Uint8Array>

	getPublicKey(k: Uint8Array | undefined): Promise<Uint8Array>
	derive(k: Uint8Array | undefined, p: string): Promise<Uint8Array>
	sign(k: Uint8Array | undefined, b: Uint8Array): Promise<Uint8Array>

	generateSymmetricKey(): Promise<Uint8Array>
	encrypt(k: Uint8Array | undefined, b: Uint8Array): Promise<Uint8Array>
	decrypt(k: Uint8Array | undefined, ct: Uint8Array): Promise<Uint8Array>
}

export interface NetworkMiddlewareResponse<T> {
	readonly headers: Headers
	readonly ok: boolean
	readonly redirected: boolean
	readonly status: number
	readonly statusText: string
	readonly url: string

	readonly data: T
}

export type NetworkMiddlewareMapReturn<T> = (body: ReadableStream<Uint8Array> | undefined) => Promise<T>

export type NetworkMiddlewareFunction<T> = {
	(address: string, headers?: HeadersInit | undefined, body?: T, mapReturn?: undefined): Promise<
		NetworkMiddlewareResponse<Uint8Array>
	>

	<U>(address: string, headers?: HeadersInit | undefined, body?: T, mapReturn?: NetworkMiddlewareMapReturn<U>): Promise<
		NetworkMiddlewareResponse<U>
	>
}

export interface NetworkMiddleware {
	GET: NetworkMiddlewareFunction<undefined>
	POST: NetworkMiddlewareFunction<string | FormData | undefined>
}
