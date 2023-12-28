import { WebSocket } from 'uWebSockets.js';

/**
 * Basalt WebSocket interface extends uWebSockets.js WebSocket interface
 * @see https://unetworking.github.io/uWebSockets.js/generated/interfaces/WebSocket.html
 */
export interface IBasaltWebSocket extends WebSocket<unknown> {}
