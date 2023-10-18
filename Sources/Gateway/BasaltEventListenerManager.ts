import { Socket } from 'socket.io-client';

import { IBasaltEventListenerManager } from '@/Interfaces';

/** Type defining the callback for an event listener. */
export type EventListenerCallback = (data: unknown) => void;

/**
 * Class to manage socket event listeners.
 */
export class BasaltEventListenerManager implements IBasaltEventListenerManager {
    private readonly _socket: Socket;
    private _eventListeners: Map<string, EventListenerCallback> = new Map<string, EventListenerCallback>();

    /**
     * Constructs a new event listener manager.
     * @param socket - The socket to manage.
     */
    constructor(socket: Socket) {
        this._socket = socket;
    }

    /**
     * Adds an event listener.
     * @param name - Name of the event.
     * @param fn - Callback function for the listener.
     * @throws {Error} - If an event listener for this event already exists.
     */
    public addListener(name: string, fn: EventListenerCallback): void {
        if (this._eventListeners.has(name))
            throw new Error(`Event listener for ${name} already exists`);
        this._eventListeners.set(name, fn);
        this._socket.on(name, fn);
    }

    /**
     * Adds multiple event listeners.
     * @param listeners - A map of listeners.
     * @throws {Error} - If an event listener for any of the events already exists.
     */
    public addListeners(listeners: Map<string, EventListenerCallback>): void {
        for (const [name] of listeners.entries())
            if (this._eventListeners.has(name))
                throw new Error(`Event listener for ${name} already exists`);

        for (const [name, fn] of listeners.entries()) {
            this._eventListeners.set(name, fn);
            this._socket.on(name, fn);
        }
    }

    /**
     * Removes an event listener.
     * @param name - Name of the event.
     * @throws {Error} - If no event listener exists for this event.
     */
    public removeListener(name: string): void {
        if (!this._eventListeners.has(name))
            throw new Error(`Event listener for ${name} does not exist`);
        this._socket.off(name);
        this._eventListeners.delete(name);
    }

    /**
     * Removes multiple event listeners.
     * @param names - List of event names.
     * @throws {Error} - If no event listener exists for any of the events.
     */
    public removeListeners(names: string[]): void {
        for (const name of names) {
            if (!this._eventListeners.has(name))
                throw new Error(`Event listener for ${name} does not exist`);
            this._socket.off(name);
            this._eventListeners.delete(name);
        }
    }

    /**
     * Removes all event listeners.
     */
    public removeAllListeners(): void {
        for (const name of this._eventListeners.keys()) {
            this._socket.off(name);
            this._eventListeners.delete(name);
        }
    }

    /**
     * Checks if an event listener exists.
     * @param name - Name of the event.
     * @return {boolean} - Returns true if the listener exists, false otherwise.
     */
    public hasListener(name: string): boolean {
        return this._socket.hasListeners(name);
    }
}
