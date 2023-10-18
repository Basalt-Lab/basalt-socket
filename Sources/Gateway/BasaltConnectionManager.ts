import { io, Socket } from 'socket.io-client';
import { IBasaltConnectionManager, IBasaltSocketGatewayOptions } from '@/Interfaces';

/**
 * Manages the connection to a server using socket.io.
 */
export class BasaltConnectionManager implements IBasaltConnectionManager {
    private _socket?: Socket;
    private readonly _options: IBasaltSocketGatewayOptions;

    /**
     * Initializes a new instance of the BasaltConnectionManager class.
     * @param options Connection options.
     */
    constructor(options: IBasaltSocketGatewayOptions) {
        this._options = {
            forceNew: true,
            withCredentials: true,
            ...options
        };
    }

    /**
     * Gets the active socket instance.
     * @returns The active socket instance, if any.
     */
    public get socket(): Socket | undefined {
        return this._socket;
    }

    /**
     * Connects to the server.
     * @throws Error if the socket is already connected.
     * @returns A promise that resolves when connected.
     */
    public connect(): Promise<void> {
        return new Promise((resolve, reject): void => {
            if (this._socket && this._socket.connected) {
                reject(new Error('Socket is already connected'));
                return;
            }
            this._socket = io(`${this._options.url}${this._options.prefix}${this._options.namespace}`, {
                ...this._options
            });

            this._socket.on('connect', (): void => {
                resolve();
                return;
            });

            this._socket.on('connect_error', (error: unknown): void => {
                reject(error);
            });
        });
    }

    /**
     * Disconnects from the server.
     * @throws Error if the socket is not connected.
     * @returns A promise that resolves when disconnected.
     */
    public async disconnect(): Promise<void> {
        return new Promise((resolve, reject): void => {
            if (!this.isConnected()) {
                reject(new Error('Socket is not connected'));
                return;
            }

            this._socket!.on('disconnect', (): void => {
                this._socket = undefined;
                resolve();
            });

            this._socket!.disconnect();
        });
    }

    /**
     * Reconnects to the server.
     * @returns A promise that resolves when reconnected.
     */
    public async reconnect(): Promise<void> {
        await this.disconnect();
        await this.connect();
    }

    /**
     * Checks if the socket is connected.
     * @returns True if the socket is connected, false otherwise.
     */
    public isConnected(): boolean {
        return this._socket?.connected || false;
    }

    /**
     * Emits an event to the server.
     * @param event The event name.
     * @param data The data to send.
     * @throws Error if the socket is not defined or not connected.
     */
    public emit<T>(event: string, data: T): void {
        if (!this.isConnected())
            throw new Error('Cannot emit event when not connected to the gateway.');
        this._socket!.emit(event, data);
    }
}
