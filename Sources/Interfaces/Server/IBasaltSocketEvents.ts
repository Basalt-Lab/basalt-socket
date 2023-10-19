import { IBasaltWebSocketBehavior } from '@/Interfaces';

export interface IBasaltSocketEvents {
    /**
     * Add an event to the list
     * @param name Name of the event
     * @param event Event to add
     * @example add('login', { open: (ws: IBasaltWebSocket) => { ... } })
     * @throws {Error} If an event listener for the event already exists.
     */
    add(name: string, event: IBasaltWebSocketBehavior): void

    /**
     * Getter for events
     * @returns {Map<string, IBasaltWebSocketBehavior>} events
     */
    get events(): Map<string, IBasaltWebSocketBehavior>
}
