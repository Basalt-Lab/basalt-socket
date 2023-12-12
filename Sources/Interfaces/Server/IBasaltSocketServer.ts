import { RecognizedString } from 'uWebSockets.js';

import {
    IBasaltHttpRequest,
    IBasaltHttpResponse,
    IBasaltSocketEvents,
    IBasaltSocketServerListenOptions,
    IBasaltWebSocket
} from '@/Interfaces';

export interface IBasaltSocketServer {

    /**
     * Sets a hook that is called when a client initiates an upgrade request.
     * @param hooks The function to call on an upgrade event.
     */
    set onUpgradeHook(hooks: ((res: IBasaltHttpResponse, req: IBasaltHttpRequest) => unknown | void))

    /**
     * Sets a hook that is called when a client establishes a connection.
     * @param hooks The function to call on a connection event.
     */
    set onConnectHook(hooks: ((ws: IBasaltWebSocket) => void))

    /**
     * Sets a hook that is called when a client disconnects.
     * @param hooks The function to call on a disconnection event.
     */
    set onDisconnectHook(hooks: ((ws: IBasaltWebSocket, code: number, message: ArrayBuffer) => void))

    /**
     * Sets a hook that is called when a message is received from a client.
     * @param hooks The function to call on a message event.
     */
    set onReceivedHook(hooks: ((ws: IBasaltWebSocket, message: ArrayBuffer, isBinary: boolean) => void))

    /**
     * Gets the registered routes of the WebSocket server.
     * @returns An array of registered route strings.
     */
    get routes(): string[]

    /**
     * Starts listening on the specified port.
     * @throws {Error} If the server fails to start listening on the port.
     * @param options The options to use for listening. (port, host, verbose)
     */
    listen(options: Partial<IBasaltSocketServerListenOptions>): void

    /**
     * Stops the server from listening.
     * @throws {Error} If the server is not currently listening.
     */
    stop(): void

    /**
     * Publishes a message to a specific topic.
     * @param topic The topic to which the message should be published.
     * @param message The message to publish.
     */
    publish(topic: RecognizedString, message: RecognizedString): void

    /**
     * Use a prefix for all events
     * @param prefix prefix to use
     * @param events events to use
     * @example use('user/', new Map([['login', { open: (ws: IBasaltWebSocket) => { ... } }]]))
     * @throws {Error} If an event listener for any of the events already exists.
     * @throws {Error} If the prefix is invalid (only alphanumeric characters, - and _ are allowed)
     */
    use(prefix: string, events: IBasaltSocketEvents | IBasaltSocketEvents[]): void
}
