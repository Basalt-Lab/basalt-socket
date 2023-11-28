import {
    App,
    TemplatedApp,
    us_listen_socket,
    WebSocketBehavior,
    us_listen_socket_close,
    RecognizedString
} from 'uWebSockets.js';

import {
    IBasaltHttpRequest,
    IBasaltHttpResponse,
    IBasaltSocketServer,
    IBasaltSocketServerOptions,
    IBasaltWebSocket,
    IBasaltWebSocketEvent,
    IBasaltSocketServerListenOptions,
    IBasaltSocketEvents
} from '@/Interfaces';

/**
 * Represents a WebSocket server using µWebSockets.js.
 * This server supports various lifecycle hooks and can publish messages to topics.
 */
export class BasaltSocketServer implements IBasaltSocketServer {
    private readonly _app: TemplatedApp;
    private readonly _options: IBasaltSocketServerOptions;
    private _onConnectedHook: ((ws: IBasaltWebSocket) => void) | undefined;
    private _onDisconnectHook: ((ws: IBasaltWebSocket, code: number, message: ArrayBuffer) => void) | undefined;
    private _onReceivedHook: ((ws: IBasaltWebSocket, message: ArrayBuffer) => void) | undefined;
    private _onUpgradeHook: ((res: IBasaltHttpResponse, req: IBasaltHttpRequest) => unknown | void) | undefined;
    private _listenToken: us_listen_socket | undefined;
    private _routes: Set<string> = new Set();

    /**
     * Constructs a new BasaltSocketServer instance with specified options.
     * @param option Configuration options for the µWebSockets.js App.
     */
    public constructor(option: IBasaltSocketServerOptions = {
        maxPayloadLength: 16 * 1024,
        handshakeTimeout: 10000,
        origins: []
    }) {
        this._app = App(option);
        this._options = option;
    }

    /**
     * Sets a hook that is called when a client initiates an upgrade request.
     * @param hooks The function to call on an upgrade event.
     */
    public set onUpgradeHook(hooks: ((res: IBasaltHttpResponse, req: IBasaltHttpRequest) => unknown | void)) {
        this._onUpgradeHook = hooks;
    }

    /**
     * Sets a hook that is called when a client establishes a connection.
     * @param hooks The function to call on a connection event.
     */
    public set onConnectHook(hooks: ((ws: IBasaltWebSocket) => void)) {
        this._onConnectedHook = hooks;
    }

    /**
     * Sets a hook that is called when a client disconnects.
     * @param hooks The function to call on a disconnection event.
     */
    public set onDisconnectHook(hooks: ((ws: IBasaltWebSocket, code: number, message: ArrayBuffer) => void)) {
        this._onDisconnectHook = hooks;
    }

    /**
     * Sets a hook that is called when a message is received from a client.
     * @param hooks The function to call on a message event.
     */
    public set onReceivedHook(hooks: ((ws: IBasaltWebSocket, message: ArrayBuffer) => void)) {
        this._onReceivedHook = hooks;
    }

    /**
     * Gets the registered routes of the WebSocket server.
     * @returns An array of registered route strings.
     */
    public get routes(): string[] {
        return [...this._routes];
    }

    /**
     * Starts listening on the specified port.
     * @throws {Error} If the server fails to start listening on the port.
     * @param options The options to use for listening. (port, host, verbose)
     */
    public listen(options: Partial<IBasaltSocketServerListenOptions>): void {
        this._app.listen(options?.host ?? 'localhost', options?.port ?? 3000, (token: us_listen_socket | false): void => {
            if (!token)
                throw new Error(`BasaltSocketServer : failed to listen to port ${options?.port ?? 3000}`);
            this._listenToken = token;
            if (options.verbose ?? true)
                console.log(`BasaltSocketServer : listening to port ${options?.port ?? 3000}`);
        });
    }

    /**
     * Stops the server from listening.
     * @throws {Error} If the server is not currently listening.
     */
    public stop(): void {
        if (this._listenToken) {
            us_listen_socket_close(this._listenToken);
            this._listenToken = undefined;
        } else {
            throw new Error('BasaltSocketServer : server is not listening');
        }
    }

    /**
     * Publishes a message to a specific topic.
     * @param topic The topic to which the message should be published.
     * @param message The message to publish.
     */
    public publish(topic: RecognizedString, message: RecognizedString): void {
        this._app.publish(topic, message, undefined, undefined);
    }

    /**
     * Checks if the given origin is allowed by the server's configuration.
     * @param origin The origin to check.
     * @returns {boolean} True if the origin is allowed; false otherwise.
     * @private
     */
    private isOriginAllowed(origin: string): boolean {
        return this._options.origins !== undefined &&
            this._options.origins.includes(origin);
    }

    /**
     * Creates WebSocket behavior configurations for a given event.
     * @param event The event configuration to be used for creating WebSocket behavior.
     * @returns A WebSocketBehavior object with configured callbacks.
     * @private
     */
    private createBehavior(event: IBasaltWebSocketEvent): WebSocketBehavior<unknown> {
        return {
            open: (ws: IBasaltWebSocket) => this.handleOpen(ws, event),
            close: (ws: IBasaltWebSocket, code: number, message: ArrayBuffer) => this.handleClose(ws, code, message, event),
            message: (ws: IBasaltWebSocket, message: ArrayBuffer) => this.handleMessage(ws, message, event),
            upgrade: (res: IBasaltHttpResponse, req: IBasaltHttpRequest, context: us_listen_socket) => this.handleUpgrade(res, req, context, event),
            maxPayloadLength: event.maxPayloadLength ?? this._options.maxPayloadLength
        };
    }

    /**
     * Handles the opening of a WebSocket connection.
     * @param ws The WebSocket instance.
     * @param event The event configuration associated with this WebSocket.
     * @private
     */
    private handleOpen(ws: IBasaltWebSocket, event: IBasaltWebSocketEvent): void {
        this._onConnectedHook?.(ws);
        if (event.onConnectHook)
            event.onConnectHook(ws);
    }

    /**
     * Handles the closing of a WebSocket connection.
     * @param ws The WebSocket instance.
     * @param code The status code representing why the connection is being closed.
     * @param message The message or reason for the connection closure.
     * @param event The event configuration associated with this WebSocket.
     * @private
     */
    private handleClose(ws: IBasaltWebSocket, code: number, message: ArrayBuffer, event: IBasaltWebSocketEvent): void {
        this._onDisconnectHook?.(ws, code, message);
        if (event.onDisconnectHook)
            event.onDisconnectHook(ws, code, message);
    }

    /**
     * Handles the reception of a message from a WebSocket connection.
     * @param ws The WebSocket instance.
     * @param message The message received from the WebSocket.
     * @param event The event configuration associated with this WebSocket.
     * @private
     */
    private handleMessage(ws: IBasaltWebSocket, message: ArrayBuffer, event: IBasaltWebSocketEvent): void {
        this._onReceivedHook?.(ws, message);
        if (event.onReceivedHook)
            event.onReceivedHook(ws, message);
        if (event.preHandler)
            for (const preHandler of event.preHandler)
                preHandler(ws, message);
        if (event.handler)
            event.handler(ws, message);
    }

    /**
     * Handles the upgrade of a connection to WebSocket.
     * @param res The HTTP response object for handling the upgrade.
     * @param req The HTTP request object initiating the upgrade.
     * @param context The listening socket context.
     * @param event The event configuration associated with this upgrade.
     * @private
     */
    private handleUpgrade(res: IBasaltHttpResponse, req: IBasaltHttpRequest, context: us_listen_socket, event: IBasaltWebSocketEvent): void {
        const handshakeTimeout: number = event.handshakeTimeout ?? this._options.handshakeTimeout as number;
        let isUpgradedOrAborted: boolean = false;

        const secWebSocketKey: string = req.getHeader('sec-websocket-key');
        const secWebSocketProtocol: string = req.getHeader('sec-websocket-protocol');
        const secWebSocketExtensions: string = req.getHeader('sec-websocket-extensions');
        const origin: string = req.getHeader('origin') || req.getHeader('sec-websocket-origin');

        const handshakeTimeoutId = setTimeout((): void => {
            if (!isUpgradedOrAborted) {
                res.close();
                isUpgradedOrAborted = true;
            }
        }, handshakeTimeout);

        res.onAborted((): void => {
            isUpgradedOrAborted = true;
            clearTimeout(handshakeTimeoutId);
        });

        if (!this.isOriginAllowed(origin) && this._options.origins != undefined && this._options.origins.length > 0) {
            res.writeStatus('401 Unauthorized').writeHeader('Basalt-Socket-Error', 'Origin not allowed').end();
            isUpgradedOrAborted = true;
            return;
        }

        res.cork((): void => {
            if (isUpgradedOrAborted) return;

            let userData = this._onUpgradeHook ? this._onUpgradeHook(res, req) ?? {} : {};
            if (event.onUpgradeHook)
                userData = { ...userData, ...(event.onUpgradeHook(res, req) ?? {}) };

            res.upgrade(userData, secWebSocketKey, event.protocol ?? this._options.protocol ?? secWebSocketProtocol, secWebSocketExtensions, context);
            isUpgradedOrAborted = true;
            clearTimeout(handshakeTimeoutId);
        });
    }

    /**
     * Configures event handling for specific routes with an optional prefix.
     * Throws an error if a route is already registered or if the prefix is invalid.
     * @param prefix The prefix to be used for all event routes.
     * @param events A map of event names to their configurations.
     * @throws {Error} If an event listener for any of the events already exists.
     * @throws {Error} If the prefix is invalid (only alphanumeric characters, - and _ are allowed).
     * @public
     */
    public use(prefix: string, events: IBasaltSocketEvents): void {
        const eventMap: Map<string, IBasaltWebSocketEvent> = events.events;
        if (!/^[a-zA-Z0-9-_/]*$/.test(prefix)) throw new Error(`Invalid prefix ${prefix}`);
        for (const eventName of eventMap.keys())
            if (this._routes.has(`/${prefix}${eventName}`))
                throw new Error(`An event listener for ${prefix}${eventName} already exists.`);
        for (const [eventName, event] of eventMap) {
            const e: WebSocketBehavior<unknown> = this.createBehavior(event);
            if (prefix === '') {
                this._app.ws(`/${eventName}`, e);
                this._routes.add(`/${eventName}`);
            } else {
                prefix = prefix.replace(/\/{2,}/g, '/');
                if (prefix.startsWith('/'))
                    prefix = prefix.substring(1);
                console.log(prefix);
                this._app.ws(`/${prefix}${eventName}`, e);
                this._routes.add(`/${prefix}${eventName}`);
            }
        }
    }
}
