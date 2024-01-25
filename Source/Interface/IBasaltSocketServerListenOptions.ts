export interface IBasaltSocketServerListenOptions {
    /**
     * Port to listen on. (default: auto select a port)
     */
    port: number;

    /**
     * Hostname to listen on. (default: '0.0.0.0')
     */
    host: string;
}
