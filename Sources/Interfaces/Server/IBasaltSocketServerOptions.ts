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
     * Handshake timeout (default: 10000 ms)
     */
    handshakeTimeout?: number;

    /**
     * Origins is an array of strings that will be matched against the Origin header. If none of the strings match, the upgrade is rejected.
     */
    origins?: string[];
}
