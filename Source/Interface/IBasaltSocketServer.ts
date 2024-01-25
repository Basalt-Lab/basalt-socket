import { RecognizedString } from 'uWebSockets.js';

import {
    IBasaltHttpRequest,
    IBasaltHttpResponse,
    IBasaltSocketRouter,
    IBasaltSocketServerListenOptions,
    IBasaltWebSocket
} from '@/Interface';

export interface IBasaltSocketServer {
    /**
     * Return true if the server is listening.
     * @returns True if the server is listening.
     */
    get isListening(): boolean;

    /**
     * Sets a hook that is called when a client initiates an upgrade request.
     * @param hooks - The function to call on an upgrade event.
     */
    set onUpgradeHook(hooks: ((res: IBasaltHttpResponse, req: IBasaltHttpRequest) => unknown | void));

    /**
     * Sets a hook that is called when a client establishes a connection.
     * @param hooks - The function to call on a connection event.
     */
    set onConnectHook(hooks: ((ws: IBasaltWebSocket) => void));

    /**
     * Sets a hook that is called when a client disconnects.
     * @param hooks - The function to call on a disconnection event.
     */
    set onDisconnectHook(hooks: ((ws: IBasaltWebSocket, code: number, message: ArrayBuffer) => void));

    /**
     * Sets a hook that is called when a message is received from a client.
     * @param hooks - The function to call on a message event.
     */
    set onReceivedHook(hooks: ((ws: IBasaltWebSocket, message: ArrayBuffer, isBinary: boolean) => void));

    /**
     * Sets a hook that is called when a client subscribes to a topic.
     * @param hooks - The function to call on a subscription event.
     */
    set onSubscriptionHook(hooks: ((ws: IBasaltWebSocket, topic: ArrayBuffer, newCount: number, oldCount: number) => void));

    /**
     * Gets the registered routes of the WebSocket server.
     * @returns An array of registered route strings.
     */
    get routes(): string[];

    /**
     * Starts listening on the specified port.
     * @throws {Error} If the server fails to start listening on the port.
     * @param options - The options to use for listening. (port, host)
     * @returns The port that the server is listening on.
     */
    listen(options: Partial<IBasaltSocketServerListenOptions>): Promise<number>;

    /**
     * Stops the server from listening.
     * @throws {Error} If the server is not currently listening.
     */
    stop(): void

    /**
     * Publishes a message to a specific topic.
     * @param topic - The topic to which the message should be published.
     * @param message - The message to publish.
     */
    publish(topic: RecognizedString, message: RecognizedString): void;

    /**
     * Gets the number of subscribers to a specific topic.
     * @param topic - The topic to check.
     */
    getNumberOfSubscribers(topic: RecognizedString): number;

    /**
     * Configures event handling for specific routes with an optional prefix.
     * Throws an error if a route is already registered or if the prefix is invalid.
     * @param prefix - The prefix to be used for all event routes.
     * @param events - A map of event names to their configurations.
     * @throws {Error} If an event listener for any of the events already exists.
     * @throws {Error} If the prefix is invalid (only alphanumeric characters, - and _ are allowed).
     * @public
     */
    use(prefix: string, events: IBasaltSocketRouter | IBasaltSocketRouter[]): void;
}
