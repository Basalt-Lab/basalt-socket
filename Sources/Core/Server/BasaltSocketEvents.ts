import { IBasaltSocketEvents, IBasaltWebSocketEvent } from '@/Interfaces';

export class BasaltSocketEvents implements IBasaltSocketEvents {
    private readonly _events: Map<string, IBasaltWebSocketEvent> = new Map();

    /**
     * Add an event to the list
     * @param name Name of the event
     * @param event Event to add
     * @example add('login', { open: (ws: IBasaltWebSocket) => { ... } })
     * @throws {Error} If an event listener for the event already exists.
     */
    public add(name: string, event: IBasaltWebSocketEvent): void {
        if (this._events.has(name))
            throw new Error(`Event ${name} already exists`);
        this._events.set(name, event);
    }

    /**
     * Getter for events
     * @returns {Map<string, IBasaltWebSocketEvent>} events
     */
    public get events(): Map<string, IBasaltWebSocketEvent> {
        return this._events;
    }
}
