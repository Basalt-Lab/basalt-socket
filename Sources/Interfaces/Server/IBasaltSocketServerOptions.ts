import { AppOptions } from 'uWebSockets.js';

export interface IBasaltSocketServerOptions extends AppOptions {
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
}
