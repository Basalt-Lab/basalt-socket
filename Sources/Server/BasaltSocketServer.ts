import { App, TemplatedApp, us_listen_socket, WebSocketBehavior } from 'uWebSockets.js';

import {
    IBasaltSocketServer,
    IBasaltSocketServerOptions,
    IBasaltUserData,
    IBasaltWebSocket,
    IBasaltWebSocketBehavior
} from '@/Interfaces';

export class BasaltSocketServer implements IBasaltSocketServer {
    private readonly _app: TemplatedApp;
    private _onReceivedHook: ((ws: IBasaltWebSocket, message: ArrayBuffer, isBinary: boolean) => void) | undefined;
    private _onConnectedHook: ((ws: IBasaltWebSocket) => void) | undefined;
    private _onDisconnectHook: ((ws: IBasaltWebSocket, code: number, message: ArrayBuffer) => void) | undefined;
    private _routes: string[] = [];

    /**
     * Constructor BasaltSocketServer
     * @param option uWebSockets.js AppOptions
     * @see https://unetworking.github.io/uWebSockets.js/generated/interfaces/AppOptions.html
     */
    public constructor(option: IBasaltSocketServerOptions = {}) {
        this._app = App(option);
    }

    /**
     * Lifecycle onReceivedHook : Called when a client send a message
     * @param hooks callback to call when a client send a message
     */
    public set onReceivedHook(hooks: ((ws: IBasaltWebSocket, message: ArrayBuffer, isBinary: boolean) => void)) {
        this._onReceivedHook = hooks;
    }

    /**
     * Lifecycle onConnectHook : Called when a client connect
     * @param hooks callback to call when a client connect
     */
    public set onConnectHook(hooks: ((ws: IBasaltWebSocket) => void)) {
        this._onConnectedHook = hooks;
    }

    /**
     * Lifecycle onDisconnectHook : Called when a client disconnect
     * @param hooks callback to call when a client disconnect
     */
    public set onDisconnectHook(hooks: ((ws: IBasaltWebSocket, code: number, message: ArrayBuffer) => void)) {
        this._onDisconnectHook = hooks;
    }

    /**
     * Getter for routes
     * @returns {string[]} routes
     */
    public get routes(): string[] {
        return this._routes;
    }

    /**
     * Server listen to port
     * @param port Port to listen to
     * @param verbose Log to console if the server is listening (default: true)
     * @throws {Error} If the server failed to listen to the port
     */
    public listen(port: number, verbose: boolean = true): void {
        this._app.listen(port, (token: us_listen_socket | false): void => {
            if (!token)
                throw new Error(`Failed to listen to port ${port}`);
            if (verbose)
                console.log(`Listening to port ${port}`);
        });
    }

    /**
     * Use a prefix for all events
     * @param prefix prefix to use
     * @param events events to use
     * @example use('user/', new Map([['login', { open: (ws: IBasaltWebSocket) => { ... } }]]))
     * @throws {Error} If an event listener for any of the events already exists.
     * @throws {Error} If the prefix is invalid (only alphanumeric characters, - and _ are allowed)
     */
    public use(prefix: string, events: Map<string, IBasaltWebSocketBehavior>): void {
        if (!prefix.match(/^[a-zA-Z0-9_\-/]+$/))
            throw new Error(`Invalid prefix ${prefix} (only alphanumeric characters, - and _ are allowed)`);
        for (const [eventName] of events)
            if (this._routes.includes(`/${prefix}${eventName}`))
                throw new Error(`An event listener for ${prefix}${eventName} already exists.`);

        for (const [eventName, event] of events) {
            const e: WebSocketBehavior<IBasaltUserData> = {
                open: (ws: IBasaltWebSocket): void => {
                    this._onConnectedHook?.(ws);
                    if (event.onConnectHook)
                        event.onConnectHook(ws);

                },
                close: (ws: IBasaltWebSocket, code: number, message: ArrayBuffer): void => {
                    this._onDisconnectHook?.(ws, code, message);
                    if (event.onDisconnectHook)
                        event.onDisconnectHook(ws, code, message);

                },
                message: (ws: IBasaltWebSocket, message: ArrayBuffer, isBinary: boolean): void => {
                    this._onReceivedHook?.(ws, message, isBinary);
                    if (event.preHandler)
                        for (const preHandler of event.preHandler)
                            preHandler(ws, message, isBinary);
                    if (event.handler)
                        event.handler(ws, message, isBinary);
                }
            };

            this._app.ws(`/${prefix}${eventName}`, e);
            this._routes.push(`/${prefix}${eventName}`);
        }
    }
}
