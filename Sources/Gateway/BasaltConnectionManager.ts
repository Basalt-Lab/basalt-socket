import { WebSocket } from 'ws';
import { TextEncoder } from 'util';

import { IBasaltSocketGatewayOptions, IBasaltConnectionManager } from '@/Interfaces';

export class BasaltConnectionManager implements IBasaltConnectionManager {
    private _socket: WebSocket | undefined;
    private readonly _options: IBasaltSocketGatewayOptions | undefined;
    private readonly _url: string;

    /**
     * Creates an instance of BasaltConnectionManager.
     * @param {string} url - The URL of the WebSocket server.
     * @param {IBasaltSocketGatewayOptions} [options] - Configurable options for the connection manager.
     */
    constructor(url: string, options?: IBasaltSocketGatewayOptions) {
        this._options = options;
        this._url = url;
    }

    /**
     * Establishes a connection to the WebSocket server.
     * @returns {Promise<void>} A promise that resolves when the connection is established.
     * @throws {Error} Throws an error if the socket is already defined.
     */
    public connect(): Promise<void> {
        if (this._socket !== undefined)
            throw new Error('Socket is already defined');

        this._socket = new WebSocket(this._url, this._options);
        return new Promise((resolve, reject): void => {
            this._socket!.once('open', resolve);
            this._socket!.once('error', (error: Error) => reject(new Error(`Socket connection error: ${error.message}`)));
        });
    }

    /**
     * Disconnects from the WebSocket server.
     * @returns {Promise<void>} A promise that resolves when the disconnection is complete.
     * @throws {Error} Throws an error if the socket is not defined or already closed.
     */
    public disconnect(): Promise<void> {
        return new Promise((resolve, reject): void => {
            if (this._socket === undefined || this._socket.readyState === WebSocket.CLOSED) {
                reject(new Error('Socket is not defined or already closed'));
                return;
            }
            this._socket.once('close', resolve);
            this._socket.once('error', (error) => reject(new Error(`Socket disconnection error: ${error.message}`)));
            this._socket.close();
        });
    }

    /**
     * Attempts to reconnect to the WebSocket server.
     * @returns {Promise<void>} A promise that resolves when the reconnection is successful.
     * @throws {Error} Throws an error if there's a reconnect issue.
     */
    public async reconnect(): Promise<void> {
        try {
            await this.disconnect();
            return this.connect();
        } catch (error) {
            if (error instanceof Error)
                throw new Error(`Socket reconnect error: ${error.message}`);
            else
                throw new Error(`Socket reconnect error: ${error}`);

        }
    }

    /**
     * Checks whether the client is connected to the WebSocket server.
     * @returns {boolean} True if connected, false otherwise.
     */
    public isConnected(): boolean {
        return this._socket !== undefined && this._socket.readyState === WebSocket.OPEN;
    }

    /**
     * Transforms the message into an appropriate format for sending via WebSocket.
     * @param {unknown} message - The message to transform.
     * @returns {ArrayBuffer} The message transformed as an ArrayBuffer.
     * @throws {Error} Throws an error if the message is not a string, ArrayBuffer, or object.
     * @private
     */
    private transformMessage(message: unknown): ArrayBuffer {
        if (message instanceof Object && !(message instanceof ArrayBuffer))
            message = JSON.stringify(message);

        if (typeof message === 'string') {
            const textEncoder: TextEncoder = new TextEncoder();
            return textEncoder.encode(message).buffer;
        } else if (message instanceof ArrayBuffer) {
            return message;
        }

        throw new Error('Message is not a string, ArrayBuffer, or object');
    }


    /**
     * Sends a message to the server via WebSocket.
     * @param {unknown} message - The message to send.
     * @throws {Error} Throws an error if the socket is not defined or not connected.
     * @throws {Error} Throws an error if there's an issue sending the message.
     * @returns {void}
     */
    public send(message: unknown): void {
        if (this._socket === undefined)
            throw new Error('Socket is not defined');

        if (!this.isConnected())
            throw new Error('Socket is not connected');

        try {
            this._socket.send(this.transformMessage(message));
        } catch (error) {
            if (error instanceof Error)
                throw new Error(`Socket send error: ${error.message}`);
            else
                throw new Error(`Socket send error: ${error}`);
        }
    }

    /**
     * Gets the current instance of the WebSocket socket.
     * @returns {WebSocket | undefined} The current instance of the WebSocket.
     */
    public get socket(): WebSocket | undefined {
        return this._socket;
    }
}
