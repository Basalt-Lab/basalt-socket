import { describe, test, expect } from '@jest/globals';
import WebSocket from 'ws';

import { BasaltSocketRouter, BasaltSocketServer, IBasaltWebSocket } from '@/App';

afterEach((): void => {
    jest.restoreAllMocks();
    jest.resetModules();
});

describe('BasaltSocketServer', (): void => {
    describe('getter isListening', (): void => {
        test('should return false when not listening', (): void => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            expect(server.isListening).toBe(false);
        });

        test('should return true when listening', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            await server.listen();
            expect(server.isListening).toBe(true);
            server.stop();
        });
    });

    describe('setter onUpgradeHook', (): void => {
        test('should call the onUpgrade hook', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            router.add('', {});
            server.use('/', router);

            const onUpgrade: jest.Mock = jest.fn();
            server.onUpgradeHook = onUpgrade;

            const port: number = await server.listen();

            await new Promise<void>((resolve, reject): void => {
                const ws: WebSocket = new WebSocket(`ws://localhost:${port}`);

                ws.on('open', (): void => {
                    expect(onUpgrade).toHaveBeenCalled();
                    ws.close();
                    resolve();
                });

                ws.on('error', (error: Error): void => {
                    ws.close();
                    reject(error);
                });
            });
            server.stop();
        });
    });

    describe('setter onConnectHook', (): void => {
        test('should call the onConnectHook hook', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            router.add('', {});
            server.use('/', router);

            const onConnectHook: jest.Mock = jest.fn();
            server.onConnectHook = onConnectHook;

            const port: number = await server.listen();

            await new Promise<void>((resolve, reject): void => {
                const ws: WebSocket = new WebSocket(`ws://localhost:${port}`);
                ws.on('open', (): void => {
                    expect(onConnectHook).toHaveBeenCalled();
                    ws.close();
                    resolve();
                });
                ws.on('error', (error: Error): void => {
                    ws.close();
                    reject(error);
                });
            });
            server.stop();
        });
    });

    describe('setter onDisconnectHook', (): void => {
        test('should call the onDisconnectHook hook', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            router.add('', {});
            server.use('/', router);

            const onDisconnectHook: jest.Mock = jest.fn();
            server.onDisconnectHook = onDisconnectHook;

            const port: number = await server.listen();

            await new Promise<void>((resolve, reject): void => {
                const ws: WebSocket = new WebSocket(`ws://localhost:${port}`);
                ws.on('open', (): void => {
                    ws.close();
                });
                ws.on('close', (): void => {
                    expect(onDisconnectHook).toHaveBeenCalled();
                    resolve();
                });
                ws.on('error', (error: Error): void => {
                    ws.close();
                    reject(error);
                });
            });
            server.stop();
        });
    });

    describe('setter onReceivedHook', (): void => {
        test('should call the onReceiveHook hook', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            router.add('',
                {
                    handler: (ws: IBasaltWebSocket, message: ArrayBuffer): void => {
                        ws.send(message);
                    }
                });
            server.use('/', router);

            const onReceivedHook = jest.fn();
            server.onReceivedHook = onReceivedHook;

            const port: number = await server.listen();

            await new Promise<void>((resolve, reject): void => {
                const ws: WebSocket = new WebSocket(`ws://localhost:${port}`);
                ws.on('open', (): void => {
                    ws.send('test');
                });
                ws.on('message', (message: ArrayBuffer): void => {
                    expect(onReceivedHook).toHaveBeenCalled();
                    expect(Buffer.from(message).toString()).toBe('test');
                    ws.close();
                    resolve();
                });
                ws.on('error', (error: Error): void => {
                    ws.close();
                    reject(error);
                });
            });
            server.stop();
        });
    });

    describe('setter onSubscriptionHook', (): void => {
        test('should call the onSubscriptionHook hook', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            router.add('',
                {
                    onConnectHook: (ws: IBasaltWebSocket): void => {
                        ws.subscribe('test');
                    }
                });
            server.use('/', router);

            const onSubscriptionHook = jest.fn();
            server.onSubscriptionHook = onSubscriptionHook;

            const port: number = await server.listen();

            await new Promise<void>((resolve, reject): void => {
                const ws: WebSocket = new WebSocket(`ws://localhost:${port}`);
                ws.on('open', (): void => {
                    expect(onSubscriptionHook).toHaveBeenCalled();
                    ws.close();
                    resolve();
                });

                ws.on('error', (error: Error): void => {
                    ws.close();
                    reject(error);
                });
            });
            server.stop();
        });
    });

    describe('getter routes', (): void => {
        test('should return the routes', (): void => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            const router1: BasaltSocketRouter = new BasaltSocketRouter();
            const router2: BasaltSocketRouter = new BasaltSocketRouter();
            router1.add('', {});
            router1.add('root', {});
            router2.add('btc', {});
            router2.add('eth', {});
            server.use('/', router1);
            server.use('crypto/', router2);
            expect(server.routes).toEqual(['/', '/root', '/crypto/btc', '/crypto/eth']);
        });
    });

    describe('listen', (): void => {
        test('should listen on the port', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            await server.listen();
            expect(server.isListening).toBe(true);
            server.stop();
        });

        test('should throw an error when already listening', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            await server.listen({ port: 9000 });
            const server2: BasaltSocketServer = new BasaltSocketServer();
            await expect(async (): Promise<void> => {
                await server2.listen({ port: 9000 });
            }).rejects.toThrow('BasaltSocketServer : failed to listen to port 9000');
            server.stop();
        });

        test('should respond with 401 Unauthorized and Basalt-Socket-Error header for disallowed origins', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer({
                origins: ['http://localhost:8080'],
            });
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            router.add('', {});
            server.use('/', router);
            const port: number = await server.listen();

            await new Promise<void>((resolve): void => {
                const ws: WebSocket = new WebSocket(`ws://localhost:${port}`);
                ws.on('error', (error: Error): void => {
                    expect(error.message).toBe('Unexpected server response: 401');
                    resolve();
                });
            });
            server.stop();
        });
    });

    describe('stop', (): void => {
        test('should stop listening', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            await server.listen();
            server.stop();
            expect(server.isListening).toBe(false);
        });

        test('should throw an error when not listening', (): void => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            expect((): void => {
                server.stop();
            }).toThrow('BasaltSocketServer : server is not listening');
        });
    });

    describe('publish', (): void => {
        test('should publish a message to all clients subscribed to the topic', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            router.add('alert', {
                onConnectHook: (ws: IBasaltWebSocket): void => {
                    ws.subscribe('alert');
                },
            });
            server.use('/', router);

            const port: number = await server.listen();

            const interval = setInterval((): void => {
                server.publish('alert', 'alert');
            }, 100);

            await new Promise<void>((resolve, reject): void => {
                const ws: WebSocket = new WebSocket(`ws://localhost:${port}/alert`);
                ws.on('open', (): void => {
                    ws.send('alert');
                });
                ws.on('message', (message: ArrayBuffer): void => {
                    expect(Buffer.from(message).toString()).toBe('alert');
                    ws.close();
                    interval.unref();
                    resolve();
                });
                ws.on('error', (error: Error): void => {
                    ws.close();
                    reject(error);
                });
            });
            server.stop();
        });
    });

    describe('getNumberOfSubscribers', (): void => {
        test('should return the number of subscribers to the given topic', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            router.add('alert', {
                onConnectHook: (ws: IBasaltWebSocket): void => {
                    ws.subscribe('alert');
                },
            });
            server.use('/', router);

            const port: number = await server.listen();

            await new Promise<void>((resolve, reject): void => {
                const ws: WebSocket = new WebSocket(`ws://localhost:${port}/alert`);

                ws.on('open', (): void => {
                    expect(server.getNumberOfSubscribers('alert')).toBe(1);
                    ws.close();
                    resolve();
                });

                ws.on('error', (error: Error): void => {
                    ws.close();
                    reject(error);
                });
            });
            server.stop();
        });
    });

    describe('use', (): void => {
        test('should add a new router', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            router.add('', {});
            server.use('/', router);
            await server.listen({ port: 9000 });
            expect(server.routes).toEqual(['/']);
            server.stop();
        });

        test('should trigger onUpgradeHook of the given event when a WebSocket upgrades',  async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            const onUpgradeHook: jest.Mock = jest.fn();
            router.add('', {
                onUpgradeHook
            });
            server.use('/', router);

            const port: number = await server.listen();

            await new Promise<void>((resolve, reject): void => {
                const ws: WebSocket = new WebSocket(`ws://localhost:${port}`);
                ws.on('open', (): void => {
                    ws.close();
                });
                ws.on('close', (): void => {
                    expect(onUpgradeHook).toHaveBeenCalled();
                    resolve();
                });
                ws.on('error', (error: Error): void => {
                    ws.close();
                    reject(error);
                });
            });
            server.stop();
        });

        test('should trigger onReceivedHook of the given event when a WebSocket receives a message', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            const onReceivedHook: jest.Mock = jest.fn();
            router.add('',
                {
                    handler: (ws: IBasaltWebSocket, message: ArrayBuffer): void => {
                        ws.send(message);
                    },
                    onReceivedHook
                });
            server.use('/', router);

            const port: number = await server.listen();

            await new Promise<void>((resolve, reject): void => {
                const ws: WebSocket = new WebSocket(`ws://localhost:${port}`);
                ws.on('open', (): void => {
                    ws.send('test');
                    ws.close();
                });
                ws.on('message', (message: ArrayBuffer): void => {
                    expect(onReceivedHook).toHaveBeenCalled();
                    expect(Buffer.from(message).toString()).toBe('test');
                    ws.close();
                    resolve();
                });
                ws.on('error', (error: Error): void => {
                    ws.close();
                    reject(error);
                });
            });
            server.stop();
        });

        test('should trigger preHandler of the given event when a WebSocket receives a message', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            const preHandler: jest.Mock = jest.fn();
            router.add('',
                {
                    preHandler: [preHandler],
                    handler: (ws: IBasaltWebSocket, message: ArrayBuffer): void => {
                        ws.send(message);
                    },
                });
            server.use('/', router);

            const port: number = await server.listen();

            await new Promise<void>((resolve, reject): void => {
                const ws: WebSocket = new WebSocket(`ws://localhost:${port}`);
                ws.on('open', (): void => {
                    ws.send('test');
                    ws.close();
                });
                ws.on('message', (): void => {
                    expect(preHandler).toHaveBeenCalled();
                    ws.close();
                    resolve();
                });
                ws.on('error', (error: Error): void => {
                    ws.close();
                    reject(error);
                });
            });
            server.stop();
        });

        test('should trigger onConnectHook of the given event when a WebSocket connects', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            const onConnectHook: jest.Mock = jest.fn();
            router.add('', {
                onConnectHook
            });
            server.use('/', router);

            const port: number = await server.listen();

            await new Promise<void>((resolve, reject): void => {
                const ws: WebSocket = new WebSocket(`ws://localhost:${port}`);
                ws.on('open', (): void => {
                    ws.close();
                });
                ws.on('close', (): void => {
                    expect(onConnectHook).toHaveBeenCalled();
                    resolve();
                });
                ws.on('error', (error: Error): void => {
                    ws.close();
                    reject(error);
                });
            });
            server.stop();
        });

        test('should trigger onDisconnectHook of the given event when a WebSocket disconnects', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            const onDisconnectHook: jest.Mock = jest.fn();
            router.add('', {
                onDisconnectHook
            });
            server.use('/', router);

            const port: number = await server.listen();

            await new Promise<void>((resolve, reject): void => {
                const ws: WebSocket = new WebSocket(`ws://localhost:${port}`);
                ws.on('open', (): void => {
                    ws.close();
                });
                ws.on('close', (): void => {
                    expect(onDisconnectHook).toHaveBeenCalled();
                    resolve();
                });
                ws.on('error', (error: Error): void => {
                    ws.close();
                    reject(error);
                });
            });
            server.stop();
        });

        test('should trigger onSubscriptionHook of the given event when a WebSocket subscribes to a topic', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            const onSubscriptionHook: jest.Mock = jest.fn();
            router.add('', {
                onConnectHook: (ws: IBasaltWebSocket): void => {
                    ws.subscribe('test');
                },
                onSubscriptionHook
            });
            server.use('/', router);

            const port: number = await server.listen();

            await new Promise<void>((resolve, reject): void => {
                const ws: WebSocket = new WebSocket(`ws://localhost:${port}`);
                ws.on('open', (): void => {
                    ws.close();
                });
                ws.on('close', (): void => {
                    expect(onSubscriptionHook).toHaveBeenCalled();
                    resolve();
                });
                ws.on('error', (error: Error): void => {
                    ws.close();
                    reject(error);
                });
            });
            server.stop();
        });

        test('should return root path when prefix is empty', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            const router: BasaltSocketRouter = new BasaltSocketRouter();

            router.add('', {});
            server.use('', router);
            await server.listen();
            expect(server.routes).toEqual(['/']);
            server.stop();
        });

        test('should throw error for invalid prefix with special characters', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            const router: BasaltSocketRouter = new BasaltSocketRouter();

            router.add('', {});
            expect((): void => {
                server.use('$**$', router);
            }).toThrow('Invalid prefix $**$');
        });

        test('should throw an error when the route is already registered', async (): Promise<void> => {
            const server: BasaltSocketServer = new BasaltSocketServer();
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            router.add('', {});
            expect((): void => {
                server.use('/', router);
                server.use('/', router);
            }).toThrow('An event listener for / already exists.');
        });
    });
});
