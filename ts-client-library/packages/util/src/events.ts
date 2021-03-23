export interface EventListener<T = Event> {
	(evt: T): void
}

export interface EventListenerObject<T = Event> {
	handleEvent(evt: T): void
}

export type EventListenerOrEventListenerObject<T = Event> = EventListener<T> | EventListenerObject<T>
