import { App, TemplatedApp, us_listen_socket, WebSocketBehavior } from 'uWebSockets.js';

import {
    IBasaltHttpRequest,
    IBasaltHttpResponse,
    IBasaltSocketServer,
    IBasaltSocketServerOptions,
    IBasaltWebSocket,
    IBasaltWebSocketBehavior
} from '@/Interfaces';

export class BasaltSocketServer implements IBasaltSocketServer {
    private readonly _app: TemplatedApp;
    private readonly _protocol: string | undefined;
    private readonly _maxPayloadLength: number | undefined;
    private readonly _handshakeTimeout: number | undefined;
    private _onUpgradeHook: ((res: IBasaltHttpResponse, req: IBasaltHttpRequest) => unknown | void) | undefined;
    private _onConnectedHook: ((ws: IBasaltWebSocket) => void) | undefined;
    private _onDisconnectHook: ((ws: IBasaltWebSocket, code: number, message: ArrayBuffer) => void) | undefined;
    private _onReceivedHook: ((ws: IBasaltWebSocket, message: ArrayBuffer) => void) | undefined;
    private _routes: string[] = [];

    /**
     * Constructor BasaltSocketServer
     * @param option uWebSockets.js AppOptions
     * @see https://unetworking.github.io/uWebSockets.js/generated/interfaces/AppOptions.html
     */
    public constructor(option: IBasaltSocketServerOptions = {}) {
        this._app = App(option);
        this._protocol = option.protocol;
        this._maxPayloadLength = option.maxPayloadLength;
        this._handshakeTimeout = option.handshakeTimeout;
    }

    /**
     * Lifecycle onUpgradeHook : Called when a client upgrade
     * @param hooks
     */
    public set onUpgradeHook(hooks: ((res: IBasaltHttpResponse, req: IBasaltHttpRequest) => unknown | void)) {
        this._onUpgradeHook = hooks;
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
     * Lifecycle onReceivedHook : Called when a client send a message
     * @param hooks callback to call when a client send a message
     */
    public set onReceivedHook(hooks: ((ws: IBasaltWebSocket, message: ArrayBuffer) => void)) {
        this._onReceivedHook = hooks;
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
        if (!prefix.match(/^[a-zA-Z0-9-_]*$/))
            throw new Error(`Invalid prefix ${prefix} (only alphanumeric characters, - and _ are allowed)`);

        for (const [eventName] of events)
            if (this._routes.includes(`/${prefix}${eventName}`))
                throw new Error(`An event listener for ${prefix}${eventName} already exists.`);

        for (const [eventName, event] of events) {
            const e: WebSocketBehavior<unknown> = {
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
                message: (ws: IBasaltWebSocket, message: ArrayBuffer): void => {
                    this._onReceivedHook?.(ws, message);
                    if (event.onReceivedHook)
                        event.onReceivedHook(ws, message);

                    if (event.preHandler)
                        for (const preHandler of event.preHandler)
                            preHandler(ws, message);

                    if (event.handler)
                        event.handler(ws, message);

                },
                upgrade: (res: IBasaltHttpResponse, req: IBasaltHttpRequest, context: us_listen_socket): void => {
                    const handshakeTimeout: number = event.handshakeTimeout ?? this._handshakeTimeout ?? 10000;

                    const handshakeTimeoutId = setTimeout((): void => {
                        res.close();
                    }, handshakeTimeout);

                    const upgradeAborted: { aborted: boolean } = { aborted: false };
                    const secWebSocketKey: string = req.getHeader('sec-websocket-key');
                    const secWebSocketProtocol: string = req.getHeader('sec-websocket-protocol');
                    const secWebSocketExtensions: string = req.getHeader('sec-websocket-extensions');

                    res.onAborted((): void => {
                        upgradeAborted.aborted = true;
                        clearTimeout(handshakeTimeoutId);
                    });

                    res.cork((): void => {
                        if (upgradeAborted.aborted) return;
                        let userData = {};
                        if (this._onUpgradeHook)
                            userData = this._onUpgradeHook?.(res, req) ?? {};

                        if (event.onUpgradeHook)
                            userData = { ...userData, ...(event.onUpgradeHook(res, req) ?? {}) };

                        res.upgrade(
                            userData,
                            secWebSocketKey,
                            event.protocol ?? this._protocol ?? secWebSocketProtocol,
                            secWebSocketExtensions,
                            context
                        );

                        clearTimeout(handshakeTimeoutId);
                    });
                },

                maxPayloadLength: event.maxPayloadLength ?? this._maxPayloadLength ?? 16 * 1024
            };

            this._app.ws(`/${prefix}${eventName}`, e);
            this._routes.push(`/${prefix}${eventName}`);
        }
    }
}
