type EventListenerCallback = (data: unknown) => void;

export interface IBasaltEventListenerManager {
    /**
     * Adds a new event listener.
     * @param {string} name - The name of the event.
     * @param {EventListenerCallback} fn - The callback function to run when the event occurs.
     * @throws {Error} Throws an error if an event listener for the specified event already exists.
     * @returns {void}
     */
    addListener(name: string, fn: EventListenerCallback): void;

    /**
     * Adds multiple event listeners.
     * @param {Map<string, EventListenerCallback>} listeners - A map of event names to listener functions.
     * @throws {Error} Throws an error if an event listener for the specified event already exists.
     * @returns {void}
     */
    addListeners(listeners: Map<string, EventListenerCallback>): void;

    /**
     * Removes a specific event listener.
     * @param {string} name - The name of the event.
     * @throws {Error} Throws an error if an event listener for the specified event does not exist.
     * @returns {void}
     */
    removeListener(name: string): void;

    /**
     * Removes multiple event listeners.
     * @param {string[]} names - An array of event names.
     * @throws {Error} Throws an error if an event listener for the specified event does not exist.
     * @returns {void}
     */
    removeListeners(names: string[]): void;

    /**
     * Removes all event listeners.
     * @returns {void}
     */
    removeAllListeners(): void;

    /**
     * Checks if a listener is registered for a specific event.
     * @param {string} name - The name of the event.
     * @returns {boolean} Returns true if a listener is registered for the event, false otherwise.
     */
    hasListener(name: string): boolean;
}
