import { SocketOptions, ManagerOptions } from 'socket.io-client/';

export interface IBasaltSocketGatewayOptions extends Partial<ManagerOptions & SocketOptions> {
    prefix: string;
    url: string;
    path: string;
    namespace: string;
}
