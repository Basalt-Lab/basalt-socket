import { AppOptions } from 'uWebSockets.js';

/**
 * Options for a BasaltSocketServer.
 * BasaltSocketServerOptions extends uWebSockets.js AppOptions interface
 * @see https://unetworking.github.io/uWebSockets.js/generated/interfaces/AppOptions.html
 */
export interface IBasaltSocketServerOptions extends AppOptions {
    /**
     * Protocol
     */
    protocol?: string;

    /**
     * Max payload length (default: 16 * 1024 corresponding to 16kb)
     */
    maxPayloadLength?: number;

    /**
     * Idle timeout in seconds (default: 120)
     */
    idleTimeout?: number;

    /**
     * Whether or not we should automatically send pings to uphold a stable connection given whatever idleTimeout (Source: uWebSockets.js)
     * Defaults to true
     * @see https://unetworking.github.io/uWebSockets.js/generated/interfaces/WebSocketBehavior.html#sendPingsAutomatically
     */
    sendPongAutomatically?: boolean;


    /**
     * Origins is an array of strings that will be matched against the Origin header. If none of the strings match, the upgrade is rejected.
     */
    origins?: string[];
}
