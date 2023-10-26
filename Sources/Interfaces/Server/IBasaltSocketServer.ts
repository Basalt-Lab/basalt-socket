import { IBasaltWebSocket, IBasaltWebSocketBehavior } from '@/Interfaces';

export interface IBasaltSocketServer {

    /**
     * Lifecycle onReceivedHook : Called when a client send a message
     * @param hooks callback to call when a client send a message
     */
    set onReceivedHook(hooks: ((ws: IBasaltWebSocket, message: ArrayBuffer, isBinary: boolean) => void))

    /**
     * Lifecycle onConnectHook : Called when a client connect
     * @param hooks callback to call when a client connect
     */
    set onConnectHook(hooks: ((ws: IBasaltWebSocket) => void))

    /**
     * Lifecycle onDisconnectHook : Called when a client disconnect
     * @param hooks callback to call when a client disconnect
     */
    set onDisconnectHook(hooks: ((ws: IBasaltWebSocket, code: number, message: ArrayBuffer) => void))

    /**
     * Getter for routes
     * @returns {string[]} routes
     */
    get routes(): string[]

    /**
     * Server listen to port
     * @param port Port to listen to
     * @param verbose Log to console if the server is listening (default: true)
     * @throws {Error} If the server failed to listen to the port
     */
    listen(port: number, verbose: boolean): void

    /**
     * Use a prefix for all events
     * @param prefix prefix to use
     * @param events events to use
     * @example use('user/', new Map([['login', { open: (ws: IBasaltWebSocket) => { ... } }]]))
     * @throws {Error} If an event listener for any of the events already exists.
     * @throws {Error} If the prefix is invalid (only alphanumeric characters, - and _ are allowed)
     */
    use(prefix: string, events: Map<string, IBasaltWebSocketBehavior>): void
}
