import { BasaltSocketRouter, IBasaltWebSocketEvent } from '@/App';

describe('BasaltSocketRouter', (): void => {
    describe('add', (): void => {
        test('should add an event to the list', (): void => {
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            const event: IBasaltWebSocketEvent = { handler: jest.fn() };
            router.add('login', event);
            expect(router.events.has('login')).toBeTruthy();
        });

        test('should throw an error when adding a duplicate event', (): void => {
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            const event: IBasaltWebSocketEvent = { handler: jest.fn() };
            router.add('login', event);
            expect((): void => {
                router.add('login', event);
            }).toThrow('Event login already exists');
        });
    });

    describe('get events', (): void => {
        test('should return the events', (): void => {
            const router: BasaltSocketRouter = new BasaltSocketRouter();
            const event: IBasaltWebSocketEvent = { handler: jest.fn() };
            router.add('login', event);
            expect(router.events).toEqual(new Map([['login', event]]));
        });
    });
});
