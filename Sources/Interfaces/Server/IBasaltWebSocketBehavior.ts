
import { IBasaltWebSocket } from '@/Interfaces';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

export interface IBasaltWebSocketBehavior {

    /**
     * Max payload length
     */
    maxPayloadLength?: number;

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
     * @param isBinary Is the message binary
     */
    onReceivedHook?: (ws: IBasaltWebSocket, message: ArrayBuffer, isBinary: boolean) => void;

    /**
     * Handler: Called when a client send a message
     * @param ws WebSocket
     * @param message Message received
     * @param isBinary Is the message binary
     */
    handler?: (ws: IBasaltWebSocket, message: ArrayBuffer, isBinary: boolean) => void;

    /**
     * PreHandler: Called before the handler
     * @param ws WebSocket
     * @param message Message received
     * @param isBinary Is the message binary
     */
    preHandler?: Array<(ws: IBasaltWebSocket, message: ArrayBuffer, isBinary: boolean) => void>;

    /**
     * Upgrade: Called when a client try to upgrade
     * @param res
     * @param req
     */
    upgrade?: (res: HttpResponse, req: HttpRequest) => void;
}
