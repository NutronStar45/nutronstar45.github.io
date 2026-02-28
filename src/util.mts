export const SITE_VERSION = "4.4";


/**
 * Chooses a random element from the array.
 * @param array An array to choose an element from.
 * @returns A random element from the array, or `undefined` if the array is empty.
 */
export function chooseRandom<T>(array: T[]) {
    return array[Math.floor(Math.random() * array.length)];
}


/**
 * Removes the first occurrence of {@linkcode value} in {@linkcode array}.
 * Does nothing if {@linkcode value} isn't contained in {@linkcode array}.
 * @param array The array to remove an element from.
 * @param value The value to remove from the array.
 */
export function removeItem<T>(array: T[], value: T) {
    if (array.includes(value)) {
        array.splice(array.indexOf(value), 1);
    }
}


/**
 * Checks whether a number is an integer in a given range.
 * @param num The number to be checked.
 * @param low The minimum allowed integer.
 * @param high The minimum disallowed integer.
 * @returns Whether {@linkcode num} is in the range [{@linkcode low}, {@linkcode high}) or not.
 */
export function isIntegerInRange(num: number, low: number, high: number) {
    return Number.isInteger(num) && num >= low && num < high;
}


/**
 * Checks if a value is a numeric array.
 * @param x The value to be checked.
 * @returns Whether {@linkcode x} is a numeric array or not.
 */
export function isNumericArray(x: any): x is number[] {
    return Array.isArray(x) && x.every(v => typeof v === "number");
}
