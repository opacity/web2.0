import { extractPromise } from "./promise"

type RetryFunction<T> = () => T | Promise<T>
type RetryNextTimer = (last: number) => number | PromiseLike<number>
type RetryHandler = (err: Error) => boolean | PromiseLike<boolean>

export type RetryOpts = {
	firstTimer?: number
	nextTimer?: RetryNextTimer
	maxRetries?: number

	handler?: RetryHandler
}

export class Retry<T> {
	_fn: RetryFunction<T>
	_handler: RetryHandler = () => false

	_timer = 5000
	_nextTimer: RetryNextTimer = (last: number) => 2 * last

	_retries = 0
	_maxRetries = 2

	constructor (fn: RetryFunction<T>, { firstTimer, nextTimer, maxRetries, handler }: RetryOpts) {
		this._fn = fn
		this._handler = handler || this._handler

		this._timer = firstTimer || this._timer
		this._nextTimer = nextTimer || this._nextTimer
		this._maxRetries = maxRetries || this._maxRetries
	}

	start () {
		return this._retry()
	}

	async _retry (): Promise<T> {
		try {
			return await this._fn()
		} catch (err) {
			console.info(err)

			const closed = await this._handler(err)

			if (closed || this._retries++ > this._maxRetries) {
				throw err
			}
			else {
				console.log("retry")
				const [promise, resolve] = extractPromise()
				setTimeout(resolve, await this._nextTimer(this._timer))
				await promise
				console.log("ready")

				return this._retry()
			}
		}
	}
}
