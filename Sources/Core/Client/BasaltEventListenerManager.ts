import { WebSocket } from 'ws';

import { IBasaltEventListenerManager } from '@/Interfaces';

export type EventListenerCallback = (data: unknown) => void;

export class BasaltEventListenerManager implements IBasaltEventListenerManager {
    private _socket: WebSocket;
    private _eventListeners: Map<string, EventListenerCallback> = new Map<string, EventListenerCallback>();

    /**
     * Creates a new BasaltEventListenerManager instance.
     * @param {WebSocket} socket - The WebSocket instance used for the event listeners.
     */
    constructor(socket: WebSocket) {
        this._socket = socket;
    }

    /**
     * Adds a new event listener.
     * @param {string} name - The name of the event.
     * @param {EventListenerCallback} fn - The callback function to run when the event occurs.
     * @throws {Error} Throws an error if an event listener for the specified event already exists.
     * @returns {void}
     */
    public addListener(name: string, fn: EventListenerCallback): void {
        if (this._eventListeners.has(name))
            throw new Error(`Event listener for ${name} already exists`);
        this._eventListeners.set(name, fn);
        this._socket.addListener(name, fn);
    }

    /**
     * Adds multiple event listeners.
     * @param {Map<string, EventListenerCallback>} listeners - A map of event names to listener functions.
     * @throws {Error} Throws an error if an event listener for the specified event already exists.
     * @returns {void}
     */
    public addListeners(listeners: Map<string, EventListenerCallback>): void {
        for (const [name] of listeners.entries())
            if (this._eventListeners.has(name))
                throw new Error(`Event listener for ${name} already exists`);

        for (const [name, fn] of listeners.entries()) {
            this._eventListeners.set(name, fn);
            this._socket.addListener(name, fn);
        }
    }

    /**
     * Removes a specific event listener.
     * @param {string} name - The name of the event.
     * @throws {Error} Throws an error if an event listener for the specified event does not exist.
     * @returns {void}
     */
    public removeListener(name: string): void {
        if (!this._eventListeners.has(name))
            throw new Error(`Event listener for ${name} does not exist`);
        this._socket.removeListener(name, this._eventListeners.get(name)!);
        this._eventListeners.delete(name);
    }

    /**
     * Removes multiple event listeners.
     * @param {string[]} names - An array of event names.
     * @throws {Error} Throws an error if an event listener for the specified event does not exist.
     * @returns {void}
     */
    public removeListeners(names: string[]): void {
        for (const name of names) {
            if (!this._eventListeners.has(name))
                throw new Error(`Event listener for ${name} does not exist`);
            this._socket.removeListener(name, this._eventListeners.get(name)!);
            this._eventListeners.delete(name);
        }
    }

    /**
     * Removes all event listeners.
     * @returns {void}
     */
    public removeAllListeners(): void {
        this._socket.removeAllListeners();
        this._eventListeners.clear();
    }

    /**
     * Checks if a listener is registered for a specific event.
     * @param {string} name - The name of the event.
     * @returns {boolean} Returns true if a listener is registered for the event, false otherwise.
     */
    public hasListener(name: string): boolean {
        return this._socket.listenerCount(name) > 0;
    }
}
