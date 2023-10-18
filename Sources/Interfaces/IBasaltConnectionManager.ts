import { Socket } from 'socket.io-client';

export interface IBasaltConnectionManager {
    /**
     * Gets the active socket instance.
     * @returns The active socket instance, if any.
     */
    get socket(): Socket | undefined;

    /**
     * Connects to the server.
     * @throws Error if the socket is already connected.
     * @returns A promise that resolves when connected.
     */
    connect(): Promise<void>;

    /**
     * Disconnects from the server.
     * @throws Error if the socket is not connected.
     * @returns A promise that resolves when disconnected.
     */
    disconnect(): Promise<void>;

    /**
     * Reconnects to the server.
     * @returns A promise that resolves when reconnected.
     */
    reconnect(): Promise<void>;

    /**
     * Checks if the socket is connected.
     * @returns True if the socket is connected, false otherwise.
     */
    isConnected(): boolean;

    /**
     * Emits an event to the server.
     * @param event The event name.
     * @param data The data to send.
     * @throws Error if the socket is not defined or not connected.
     */
    emit<T>(event: string, data: T): void;
}
