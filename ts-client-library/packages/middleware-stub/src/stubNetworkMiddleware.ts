import {
	NetworkMiddleware,
	NetworkMiddlewareResponse,
	NetworkMiddlewareMapReturn,
	NetworkMiddlewareFunction,
} from "@opacity/middleware"

const fetchAdapter = async <T>(
	method: string,
	address: string,
	headers: HeadersInit | undefined,
	body: BodyInit | undefined,
	mapReturn: NetworkMiddlewareMapReturn<T>,
): Promise<NetworkMiddlewareResponse<T>> => {
	await new Promise<void>((resolve) => {
		setTimeout(() => {
			resolve()
		}, 500 * Math.random() + 250)
	})

	return {
		headers: new Headers(),
		data: await mapReturn(new Response(new Uint8Array([])).body || undefined),
		ok: true,
		redirected: false,
		status: 200,
		statusText: "OK",
		url: address,
	}
}

export class StubNetworkMiddleware implements NetworkMiddleware {
	GET: NetworkMiddlewareFunction<undefined> = async (
		address: string,
		headers?: HeadersInit,
		body?: undefined,
		mapReturn = async (b: ReadableStream<Uint8Array> | undefined) =>
			new Uint8Array(await new Response(b).arrayBuffer()),
	) => {
		return await fetchAdapter("GET", address, headers, body, mapReturn)
	}

	async POST<T> (
		address: string,
		headers?: HeadersInit,
		body?: BodyInit,
		mapReturn = async (b: ReadableStream<Uint8Array> | undefined) =>
			new Uint8Array(await new Response(b).arrayBuffer()),
	) {
		return await fetchAdapter("POST", address, headers, body, mapReturn)
	}
}
