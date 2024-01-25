import {
    App,
    TemplatedApp,
    us_listen_socket,
    WebSocketBehavior,
    us_listen_socket_close,
    RecognizedString,
    us_socket_local_port
} from 'uWebSockets.js';

import { createServer, Server } from 'net';

import {
    IBasaltHttpRequest,
    IBasaltHttpResponse,
    IBasaltSocketServer,
    IBasaltSocketServerOptions,
    IBasaltWebSocket,
    IBasaltWebSocketEvent,
    IBasaltSocketServerListenOptions,
    IBasaltSocketRouter
} from '@/Interface';

/**
 * Represents a WebSocket server using µWebSockets.js.
 * It is a wrapper around the TemplatedApp class.
 * @see https://unetworking.github.io/uWebSockets.js/generated/index.html
 * This server supports various lifecycle hooks and can publish messages to topics.
 */
export class BasaltSocketServer implements IBasaltSocketServer {
    private readonly _app: TemplatedApp;
    private readonly _options: IBasaltSocketServerOptions;
    private _onConnectedHook: ((ws: IBasaltWebSocket) => void) | undefined;
    private _onDisconnectHook: ((ws: IBasaltWebSocket, code: number, message: ArrayBuffer) => void) | undefined;
    private _onReceivedHook: ((ws: IBasaltWebSocket, message: ArrayBuffer) => void) | undefined;
    private _onUpgradeHook: ((res: IBasaltHttpResponse, req: IBasaltHttpRequest) => unknown | void) | undefined;
    private _onSubscriptionHook: ((ws: IBasaltWebSocket, topic: ArrayBuffer, newCount: number, oldCount: number) => void) | undefined;
    private _listenToken: us_listen_socket | undefined;
    private _isListening: boolean = false;
    private _routes: Set<string> = new Set();

    /**
     * Constructs a new BasaltSocketServer instance with specified options.
     * @param options - Configuration options for the µWebSockets.js App.
     */
    public constructor(options: IBasaltSocketServerOptions = {
        maxPayloadLength: 16 * 1024,
        idleTimeout: 120,
        sendPongAutomatically: true,
        origins: []
    }) {
        this._app = App(options);
        this._options = options;
    }

    /**
     * Return true if the server is listening.
     * @returns True if the server is listening.
     */
    public get isListening(): boolean {
        return this._isListening;
    }

    /**
     * Sets a hook that is called when a client initiates an upgrade request.
     * @param hooks - The function to call on an upgrade event.
     */
    public set onUpgradeHook(hooks: ((res: IBasaltHttpResponse, req: IBasaltHttpRequest) => unknown | void)) {
        this._onUpgradeHook = hooks;
    }

    /**
     * Sets a hook that is called when a client establishes a connection.
     * @param hooks - The function to call on a connection event.
     */
    public set onConnectHook(hooks: ((ws: IBasaltWebSocket) => void)) {
        this._onConnectedHook = hooks;
    }

    /**
     * Sets a hook that is called when a client disconnects.
     * @param hooks - The function to call on a disconnection event.
     */
    public set onDisconnectHook(hooks: ((ws: IBasaltWebSocket, code: number, message: ArrayBuffer) => void)) {
        this._onDisconnectHook = hooks;
    }

    /**
     * Sets a hook that is called when a message is received from a client.
     * @param hooks - The function to call on a message event.
     */
    public set onReceivedHook(hooks: ((ws: IBasaltWebSocket, message: ArrayBuffer) => void)) {
        this._onReceivedHook = hooks;
    }

    /**
     * Sets a hook that is called when a client subscribes to a topic.
     * @param hooks - The function to call on a subscription event.
     */
    public set onSubscriptionHook(hooks: ((ws: IBasaltWebSocket, topic: ArrayBuffer, newCount: number, oldCount: number) => void)) {
        this._onSubscriptionHook = hooks;
    }

    /**
     * Gets the registered routes of the WebSocket server.
     * @returns An array of registered route strings.
     */
    public get routes(): string[] {
        return [...this._routes];
    }

    /**
     * Checks if the given port is available.
     * @param port - The port to check.
     * @private
     */
    private checkPort(port: number): Promise<boolean> {
        const server: Server = createServer();
        return new Promise<boolean>((resolve): void => {
            server.listen(port, (): void => {
                server.once('close', (): void => {
                    resolve(true);
                });
                server.close();
            });
            server.on('error', (err: {code?: string}): void => {
                if (err.code === 'EADDRINUSE')
                    resolve(false);
            });
        });
    }

    /**
     * Starts listening on the specified port.
     * @throws {Error} If the server fails to start listening on the port.
     * @param options - The options to use for listening. (port, host)
     * @returns The port that the server is listening on.
     */
    public async listen(options?: Partial<IBasaltSocketServerListenOptions>): Promise<number> {
        let port: number = options?.port ?? 0;
        const isAvailable: boolean = await this.checkPort(port);
        if (!isAvailable)
            throw new Error(`BasaltSocketServer : failed to listen to port ${port}`);
        const host: string = options?.host ?? '0.0.0.0';

        this._app.listen(host, port, (token: us_listen_socket | false): void => {
            if (token) {
                port = us_socket_local_port(token);
                this._listenToken = token;
                this._isListening = true;
            }
        });
        return port;
    }

    /**
     * Stops the server from listening.
     * @throws {Error} If the server is not currently listening.
     */
    public stop(): void {
        if (this._isListening && this._listenToken) {
            us_listen_socket_close(this._listenToken);
            this._listenToken = undefined;
            this._isListening = false;
        } else {
            throw new Error('BasaltSocketServer : server is not listening');
        }
    }

    /**
     * Publishes a message to a specific topic.
     * @param topic - The topic to which the message should be published.
     * @param message - The message to publish.
     */
    public publish(topic: RecognizedString, message: RecognizedString): void {
        this._app.publish(topic, message, undefined, undefined);
    }

    /**
     * Gets the number of subscribers to a specific topic.
     * @param topic - The topic to check.
     */
    public getNumberOfSubscribers(topic: RecognizedString): number {
        return this._app.numSubscribers(topic);
    }

    /**
     * Checks if the given origin is allowed by the server's configuration.
     * @param origin - The origin to check.
     * @returns {boolean} True if the origin is allowed; false otherwise.
     * @private
     */
    private isOriginAllowed(origin: string): boolean {
        return this._options.origins !== undefined &&
            this._options.origins.includes(origin);
    }

    /**
     * Creates WebSocket behavior configurations for a given event.
     * @param event - The event configuration to be used for creating WebSocket behavior.
     * @returns A WebSocketBehavior object with configured callbacks.
     * @private
     */
    private createBehavior(event: IBasaltWebSocketEvent): WebSocketBehavior<unknown> {
        return {
            open: (ws: IBasaltWebSocket) => this.handleOpen(ws, event),
            close: (ws: IBasaltWebSocket, code: number, message: ArrayBuffer) => this.handleClose(ws, code, message, event),
            message: (ws: IBasaltWebSocket, message: ArrayBuffer) => this.handleMessage(ws, message, event),
            upgrade: (res: IBasaltHttpResponse, req: IBasaltHttpRequest, context: us_listen_socket) => this.handleUpgrade(res, req, context, event),
            subscription: (ws: IBasaltWebSocket, topic: ArrayBuffer, newCount: number, oldCount: number) => this.handleSubscription(ws, topic, newCount, oldCount, event),
            maxPayloadLength: event.maxPayloadLength ?? this._options.maxPayloadLength,
            maxLifetime: event.maxLifeTime ?? 0,
            idleTimeout: event.idleTimeout ?? this._options.idleTimeout,
            sendPingsAutomatically: event.sendPongAutomatically ?? this._options.sendPongAutomatically
        };
    }

    /**
     * Handles the upgrade of a connection to WebSocket.
     * @param res - The HTTP response object for handling the upgrade.
     * @param req - The HTTP request object initiating the upgrade.
     * @param context - The listening socket context.
     * @param event - The event configuration associated with this upgrade.
     * @private
     */
    private handleUpgrade(res: IBasaltHttpResponse, req: IBasaltHttpRequest, context: us_listen_socket, event: IBasaltWebSocketEvent): void {
        const secWebSocketKey: string = req.getHeader('sec-websocket-key');
        const secWebSocketProtocol: string = req.getHeader('sec-websocket-protocol');
        const secWebSocketExtensions: string = req.getHeader('sec-websocket-extensions');
        const origin: string = req.getHeader('origin') || req.getHeader('sec-websocket-origin');

        if (!this.isOriginAllowed(origin) && this._options.origins != undefined && this._options.origins.length > 0) {
            res
                .writeStatus('401 Unauthorized')
                .writeHeader('Basalt-Socket-Error', 'Origin not allowed').end();
            return;
        }

        res.cork((): void => {
            let userData = this._onUpgradeHook ? this._onUpgradeHook(res, req) ?? {} : {};
            if (event.onUpgradeHook)
                userData = { ...userData, ...(event.onUpgradeHook(res, req) ?? {}) };

            res.upgrade(
                userData,
                secWebSocketKey,
                event.protocol ?? this._options.protocol ?? secWebSocketProtocol,
                secWebSocketExtensions,
                context);
        });
    }

    /**
     * Handles the opening of a WebSocket connection.
     * @param ws - The WebSocket instance.
     * @param event - The event configuration associated with this WebSocket.
     * @private
     */
    private handleOpen(ws: IBasaltWebSocket, event: IBasaltWebSocketEvent): void {
        this._onConnectedHook?.(ws);
        if (event.onConnectHook)
            event.onConnectHook(ws);
    }

    /**
     * Handles the reception of a message from a WebSocket connection.
     * @param ws - The WebSocket instance.
     * @param message - The message received from the WebSocket.
     * @param event - The event configuration associated with this WebSocket.
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
     * Handles the closing of a WebSocket connection.
     * @param ws - The WebSocket instance.
     * @param code - The status code representing why the connection is being closed.
     * @param message - The message or reason for the connection closure.
     * @param event - The event configuration associated with this WebSocket.
     * @private
     */
    private handleClose(ws: IBasaltWebSocket, code: number, message: ArrayBuffer, event: IBasaltWebSocketEvent): void {
        this._onDisconnectHook?.(ws, code, message);
        if (event.onDisconnectHook)
            event.onDisconnectHook(ws, code, message);
    }

    /**
     * Handles the subscription of a WebSocket to a topic.
     * @param ws - The WebSocket instance.
     * @param topic - The topic to which the WebSocket is subscribing.
     * @param newCount - The new count of subscriptions to the topic.
     * @param oldCount - The old count of subscriptions to the topic.
     * @param event - The event configuration associated with this WebSocket.
     * @private
     */
    private handleSubscription(ws: IBasaltWebSocket, topic: ArrayBuffer, newCount: number, oldCount: number, event: IBasaltWebSocketEvent): void {
        this._onSubscriptionHook?.(ws, topic, newCount, oldCount);
        if (event.onSubscriptionHook)
            event.onSubscriptionHook(ws, topic, newCount, oldCount);
    }

    /**
     * Sanitizes the prefix by removing duplicate slashes.
     * @param prefix - The prefix to sanitize.
     * @private
     */
    private sanitizePrefix(prefix: string): string {
        if (prefix === '') {
            return '/';
        }
        else {
            if (prefix[0] !== '/')
                prefix = `/${prefix}`;
            return prefix.replace(/\/{2,}/g, '/');
        }
    }

    /**
     * Checks if the prefix is valid.
     * @param prefix - The prefix to check.
     * @private
     */
    private checkPrefix(prefix: string): void {
        if (!/^[a-zA-Z0-9-_/]*$/.test(prefix))
            throw new Error(`Invalid prefix ${prefix}`);
    }

    /**
     * Checks if an event listener for any of the events already exists.
     * @param eventMap - The map of event names to their configurations.
     * @param sanitizedPrefix - The sanitized prefix to use for all event routes.
     * @private
     */
    private checkEventName(eventMap: Map<string, IBasaltWebSocketEvent>, sanitizedPrefix: string): void {
        for (const eventName of eventMap.keys())
            if (this._routes.has(`${sanitizedPrefix}${eventName}`))
                throw new Error(`An event listener for ${sanitizedPrefix}${eventName} already exists.`);
    }

    /**
     * Adds an event to the server.
     * @param eventMap - The map of event names to their configurations.
     * @param prefix - The prefix to use for all event routes.
     * @private
     */
    private addEvent(eventMap: Map<string, IBasaltWebSocketEvent>, prefix: string): void {
        for (const [eventName, event] of eventMap) {
            const e: WebSocketBehavior<unknown> = this.createBehavior(event);
            this._app.ws(`${prefix}${eventName}`, e);
            this._routes.add(`${prefix}${eventName}`);
        }
    }

    /**
     * Configures event handling for specific routes with an optional prefix.
     * Throws an error if a route is already registered or if the prefix is invalid.
     * @param prefix - The prefix to be used for all event routes.
     * @param events - A map of event names to their configurations.
     * @throws {Error} If an event listener for any of the events already exists.
     * @throws {Error} If the prefix is invalid (only alphanumeric characters, - and _ are allowed).
     * @public
     */
    public use(prefix: string, events: IBasaltSocketRouter | IBasaltSocketRouter[]): void {
        if (!Array.isArray(events))
            events = [events];
        let eventMap: Map<string, IBasaltWebSocketEvent> = new Map();
        for (const event of events)
            eventMap = new Map([...eventMap, ...event.events]);
        this.checkPrefix(prefix);
        const sanitizedPrefix: string = this.sanitizePrefix(prefix);
        this.checkEventName(eventMap, sanitizedPrefix);
        this.addEvent(eventMap, sanitizedPrefix);
    }
}
