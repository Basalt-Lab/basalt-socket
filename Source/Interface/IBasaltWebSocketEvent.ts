import { IBasaltHttpRequest, IBasaltHttpResponse, IBasaltWebSocket } from '@/Interface';

export interface IBasaltWebSocketEvent {
    /**
     * Protocol
     */
    protocol?: string;

    /**
     * Max payload length (default: 16 * 1024 corresponds to 16kb)
     */
    maxPayloadLength?: number;

    /**
     * Idle timeout in seconds (default: 120)
     */
    idleTimeout?: number;

    /**
     * Maximum number of minutes a WebSocket may be connected before being closed by the server. 0 disables the feature. (Source: uWebSockets.js)
     * @see https://unetworking.github.io/uWebSockets.js/generated/interfaces/WebSocketBehavior.html#maxLifetime
     */
    maxLifeTime?: number;

    /**
     * Whether or not we should automatically send pings to uphold a stable connection given whatever idleTimeout (Source: uWebSockets.js)
     * Defaults to true
     * @see https://unetworking.github.io/uWebSockets.js/generated/interfaces/WebSocketBehavior.html#sendPingsAutomatically
     */
    sendPongAutomatically?: boolean;

    /**
     * Lifecycle onUpgradeHook: Called when a client connect
     * @param res Response object
     * @param req Request object
     */
    onUpgradeHook?: (res: IBasaltHttpResponse, req: IBasaltHttpRequest) => object | boolean | void;

    /**
     * Lifecycle onConnectHook: Called when a client connect
     * @param ws WebSocket object
     */
    onConnectHook?: (ws: IBasaltWebSocket) => void;

    /**
     * Lifecycle onDisconnectHook: Called when a client disconnect
     * @param ws WebSocket
     * @param code Code received
     * @param message Message received
     */
    onDisconnectHook?: (ws: IBasaltWebSocket, code: number, message: ArrayBuffer) => void;

    /**
     * Lifecycle onReceivedHook: Called when a client send a message
     * @param ws WebSocket
     * @param message Message received
     */
    onReceivedHook?: (ws: IBasaltWebSocket, message: ArrayBuffer) => void;

    /**
     * Lifecycle onSubscriptionHook: Called when a client subscribe to a topic
     * @param ws WebSocket
     * @param topic Topic subscribed
     * @param newCount New count of subscription in topic
     * @param oldCount Old count of subscription in topic
     */
    onSubscriptionHook?: (ws: IBasaltWebSocket, topic: ArrayBuffer, newCount: number, oldCount: number) => void;

    /**
     * Handler: Called when a client send a message
     * @param ws WebSocket
     * @param message Message received
     */
    handler?: (ws: IBasaltWebSocket, message: ArrayBuffer) => void;

    /**
     * PreHandler: Called before the handler
     * @param ws WebSocket
     * @param message Message received
     */
    preHandler?: Array<(ws: IBasaltWebSocket, message: ArrayBuffer) => void>;
}
