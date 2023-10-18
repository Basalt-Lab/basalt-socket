export interface IBasaltEventListenerManager {
    /**
     * Adds an event listener.
     * @param name - Name of the event.
     * @param fn - Callback function for the listener.
     * @throws {Error} - If an event listener for this event already exists.
     */
    addListener(name: string, fn: (data: unknown) => void): void;

    /**
     * Adds multiple event listeners.
     * @param listeners - A map of listeners.
     * @throws {Error} - If an event listener for any of the events already exists.
     */
    addListeners(listeners: Map<string, (data: unknown) => void>): void

    /**
     * Removes an event listener.
     * @param name - Name of the event.
     * @throws {Error} - If no event listener exists for this event.
     */
    removeListener(name: string): void;

    /**
     * Removes multiple event listeners.
     * @param names - List of event names.
     * @throws {Error} - If no event listener exists for any of the events.
     */
    removeListeners(names: string[]): void;

    /**
     * Removes all event listeners.
     */
    removeAllListeners(): void;

    /**
     * Checks if an event listener exists.
     * @param name - Name of the event.
     * @return {boolean} - Returns true if the listener exists, false otherwise.
     */
    hasListener(name: string): boolean;
}
