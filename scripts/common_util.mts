export const SITE_VERSION = "4.0";


/**
 * Chooses a random element from the array.
 * @param array An array to choose an element from.
 * @returns A random element from the array.
 */
export function chooseRandom(array: any[]) {
    return array[Math.floor(Math.random() * array.length)];
}


/**
 * Removes the first occurrence of `value` in `array`.
 * Does nothing if `value` isn't contained in `array`.
 * @param array The array to remove an element from.
 * @param value The value to remove from the array.
 */
export function removeItem(array: any[], value: any) {
    if (array.includes(value)) {
        array.splice(array.indexOf(value), 1);
    }
}
