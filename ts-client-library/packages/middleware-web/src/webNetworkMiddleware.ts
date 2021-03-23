import {
	NetworkMiddleware,
	NetworkMiddlewareFunction,
	NetworkMiddlewareMapReturn,
	NetworkMiddlewareResponse,
} from "@opacity/middleware"

const fetchAdapter = async <T>(
	method: string,
	address: string,
	headers: HeadersInit | undefined,
	body: BodyInit | undefined,
	mapReturn: NetworkMiddlewareMapReturn<T>,
): Promise<NetworkMiddlewareResponse<T>> => {
	const res = await fetch(address, { method, body, headers })

	return {
		headers: res.headers,
		data: await mapReturn(res.body || undefined),
		ok: res.ok,
		redirected: res.redirected,
		status: res.status,
		statusText: res.statusText,
		url: address,
	}
}

export class WebNetworkMiddleware implements NetworkMiddleware {
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
