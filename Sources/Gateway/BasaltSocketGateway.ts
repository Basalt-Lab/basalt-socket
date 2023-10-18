import { Socket } from 'socket.io-client';

import {
    IBasaltConnectionManager,
    IBasaltEventListenerManager,
    IBasaltSocketGateway,
    IBasaltSocketGatewayOptions
} from '@/Interfaces';
import { BasaltConnectionManager } from '@/Gateway/BasaltConnectionManager';
import { BasaltEventListenerManager } from '@/Gateway/BasaltEventListenerManager';

/**
 * The BasaltSocketGateway class provides a unified interface for managing socket connections
 * and event listeners.
 */
export class BasaltSocketGateway implements IBasaltSocketGateway {
    private readonly connectionManager: IBasaltConnectionManager;
    private eventListenerManager: IBasaltEventListenerManager | undefined;

    /**
     * Creates a new BasaltSocketGateway instance.
     * @param options - Configuration options for the socket connection.
     */
    constructor(options: IBasaltSocketGatewayOptions) {
        this.connectionManager = new BasaltConnectionManager(options);
    }

    /**
     * Connects to the socket server.
     * @returns Promise<void>
     */
    public async connect(): Promise<void> {
        await this.connectionManager.connect();
        this.eventListenerManager = new BasaltEventListenerManager(this.connectionManager.socket!);
    }

    /**
     * Disconnects from the socket server.
     * @returns Promise<void>
     */
    public async disconnect(): Promise<void> {
        await this.connectionManager.disconnect();
        this.eventListenerManager = undefined;
    }

    /**
     * Reconnects to the socket server.
     * @returns Promise<void>
     */
    public async reconnect(): Promise<void> {
        await this.connectionManager.reconnect();
    }

    /**
     * Checks if the socket is connected.
     * @returns boolean indicating the connection status.
     */
    public isConnected(): boolean {
        return this.connectionManager.isConnected();
    }

    /**
     * Emits an event through the socket.
     * @param event - The event name.
     * @param data - The data to send with the event.
     */
    public emit<T>(event: string, data: T): void {
        this.connectionManager.emit(event, data);
    }

    /**
     * Adds a new event listener.
     * @param name - The event name.
     * @param fn - The callback function for the event.
     */
    public addListener(name: string, fn: (data: unknown) => void): void {
        if(!this.eventListenerManager)
            throw new Error('EventListenerManager is not initialized.');
        this.eventListenerManager.addListener(name, fn);
    }

    /**
     * Adds multiple new event listeners.
     * @param listeners - A map of event names to their callback functions.
     */
    public addListeners(listeners: Map<string, (data: unknown) => void>): void {
        if(!this.eventListenerManager)
            throw new Error('EventListenerManager is not initialized.');
        this.eventListenerManager.addListeners(listeners);
    }

    /**
     * Removes an event listener.
     * @param name - The event name.
     */
    public removeListener(name: string): void {
        if(!this.eventListenerManager)
            throw new Error('EventListenerManager is not initialized.');
        this.eventListenerManager.removeListener(name);
    }

    /**
     * Removes multiple event listeners.
     * @param names - An array of event names to remove.
     */
    public removeListeners(names: string[]): void {
        if(!this.eventListenerManager)
            throw new Error('EventListenerManager is not initialized.');
        this.eventListenerManager.removeListeners(names);
    }

    /**
     * Removes all event listeners.
     */
    public removeAllListeners(): void {
        if(!this.eventListenerManager)
            throw new Error('EventListenerManager is not initialized.');
        this.eventListenerManager.removeAllListeners();
    }

    /**
     * Checks if a specific event listener exists.
     * @param name - The event name.
     * @returns boolean indicating if the listener exists.
     */
    public hasListener(name: string): boolean {
        if(!this.eventListenerManager)
            throw new Error('EventListenerManager is not initialized.');
        return this.eventListenerManager.hasListener(name);
    }

    /**
     * Gets the active socket instance.
     */
    get socket(): Socket | undefined {
        return undefined;
    }
}
