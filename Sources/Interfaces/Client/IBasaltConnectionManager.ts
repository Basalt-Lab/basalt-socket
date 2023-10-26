import { WebSocket } from 'ws';

export interface IBasaltConnectionManager {

    /**
     * Establishes a connection to the WebSocket server.
     * @returns {Promise<void>} A promise that resolves when the connection is established.
     * @throws {Error} Throws an error if the socket is already defined.
     */
    connect(): Promise<void>;

    /**
     * Disconnects from the WebSocket server.
     * @returns {Promise<void>} A promise that resolves when the disconnection is complete.
     * @throws {Error} Throws an error if the socket is not defined or already closed.
     */
    disconnect(): Promise<void>;

    /**
     * Attempts to reconnect to the WebSocket server.
     * @returns {Promise<void>} A promise that resolves when the reconnection is successful.
     * @throws {Error} Throws an error if there's a reconnect issue.
     */
    reconnect(): Promise<void>;

    /**
     * Checks whether the client is connected to the WebSocket server.
     * @returns {boolean} True if connected, false otherwise.
     */
    isConnected(): boolean;

    /**
     * Sends a message to the server via WebSocket.
     * @param {unknown} message - The message to send.
     * @throws {Error} Throws an error if the socket is not defined or not connected.
     * @throws {Error} Throws an error if there's an issue sending the message.
     * @returns {void}
     */
    send(message: unknown): void;

    /**
     * Gets the current instance of the WebSocket socket.
     * @returns {WebSocket | undefined} The current instance of the WebSocket.
     */
    get socket(): WebSocket | undefined;
}
