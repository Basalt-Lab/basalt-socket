
import { IBasaltWebSocket } from '@/Interfaces';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

export interface IBasaltWebSocketEvent {

    /**
     * Protocol
     */
    protocol?: string;

    /**
     * Max payload length (default: 16 * 1024)
     */
    maxPayloadLength?: number;

    /**
     * Handshake timeout (default: 10000)
     */
    handshakeTimeout?: number;

    /**
     * Lifecycle onUpgradeHook: Called when a client connect
     * @param res
     * @param req
     */
    onUpgradeHook?: (res: HttpResponse, req: HttpRequest) => unknown | void;

    /**
     * Lifecycle onConnectHook: Called when a client connect
     * @param ws WebSocket
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
