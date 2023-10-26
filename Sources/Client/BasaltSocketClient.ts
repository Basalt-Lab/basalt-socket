import { WebSocket } from 'ws';

import { IBasaltConnectionManager, IBasaltSocketClient, IBasaltSocketClientOptions, IBasaltEventListenerManager } from '@/Interfaces';
import { BasaltConnectionManager, BasaltEventListenerManager } from '@/Client';
import { EventListenerCallback } from '@/Client/BasaltEventListenerManager';


export class BasaltSocketClient implements IBasaltSocketClient {
    private _connectionManager: IBasaltConnectionManager;
    private _eventListenerManager: IBasaltEventListenerManager | undefined;

    /**
     * Creates a new instance of the BasaltSocketClient class.
     * @param url - The URL of the WebSocket server.
     * @param options - The options for the WebSocket connection.
     */
    constructor(url: string, options?: IBasaltSocketClientOptions) {
        this._connectionManager = new BasaltConnectionManager(url, options);
    }

    /**
     * Establishes a connection to the WebSocket server.
     * @returns {Promise<void>} A promise that resolves when the connection is established.
     * @throws {Error} Throws an error if the socket is already defined.
     */
    public async connect(): Promise<void> {
        await this._connectionManager.connect();
        this._eventListenerManager = new BasaltEventListenerManager(this._connectionManager.socket as WebSocket);
    }

    /**
     * Disconnects from the WebSocket server.
     * @returns {Promise<void>} A promise that resolves when the disconnection is complete.
     * @throws {Error} Throws an error if the socket is not defined or already closed.
     */
    public async disconnect(): Promise<void> {
        await this._connectionManager.disconnect();
    }

    /**
     * Attempts to reconnect to the WebSocket server.
     * @returns {Promise<void>} A promise that resolves when the reconnection is successful.
     * @throws {Error} Throws an error if there's a reconnect issue.
     */
    public async reconnect(): Promise<void> {
        await this._connectionManager.reconnect();
    }

    /**
     * Checks whether the client is connected to the WebSocket server.
     * @returns {boolean} True if connected, false otherwise.
     */
    public isConnected(): boolean {
        return this._connectionManager.isConnected();
    }

    /**
     * Sends a message to the server via WebSocket.
     * @param {unknown} message - The message to send.
     * @throws {Error} Throws an error if the socket is not defined or not connected.
     * @throws {Error} Throws an error if there's an issue sending the message.
     * @returns {void}
     */
    public send(message: unknown): void {
        this._connectionManager.send(message);
    }

    /**
     * Adds a new event listener.
     * @param {string} name - The name of the event.
     * @param {EventListenerCallback} fn - The callback function to run when the event occurs.
     * @throws {Error} Throws an error if an event listener for the specified event already exists.
     * @returns {void}
     */
    public addListener(name: string, fn: EventListenerCallback): void {
        this._eventListenerManager?.addListener(name, fn);
    }

    /**
     * Adds multiple event listeners.
     * @param {Map<string, EventListenerCallback>} listeners - A map of event names to listener functions.
     * @throws {Error} Throws an error if an event listener for the specified event already exists.
     * @returns {void}
     */
    public addListeners(listeners: Map<string, EventListenerCallback>): void {
        this._eventListenerManager?.addListeners(listeners);
    }

    /**
     * Checks if a listener is registered for a specific event.
     * @param {string} name - The name of the event.
     * @returns {boolean} Returns true if a listener is registered for the event, false otherwise.
     */
    public hasListener(name: string): boolean {
        return this._eventListenerManager?.hasListener(name) ?? false;
    }

    /**
     * Removes all event listeners.
     * @returns {void}
     */
    public removeAllListeners(): void {
        this._eventListenerManager?.removeAllListeners();
    }

    /**
     * Removes a specific event listener.
     * @param {string} name - The name of the event.
     * @throws {Error} Throws an error if an event listener for the specified event does not exist.
     * @returns {void}
     */
    public removeListener(name: string): void {
        this._eventListenerManager?.removeListener(name);
    }

    /**
     * Removes multiple event listeners.
     * @param {string[]} names - An array of event names.
     * @throws {Error} Throws an error if an event listener for the specified event does not exist.
     * @returns {void}
     */
    public removeListeners(names: string[]): void {
        this._eventListenerManager?.removeListeners(names);
    }

    /**
     * Gets the current instance of the WebSocket socket.
     * @returns {WebSocket | undefined} The current instance of the WebSocket.
     */
    get socket(): WebSocket | undefined {
        return this._connectionManager.socket;
    }
}
