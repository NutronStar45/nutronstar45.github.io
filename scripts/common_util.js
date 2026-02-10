const SITE_VERSION = "3.7";


/**
 * Chooses a random element from the array.
 * @param {any[]} array An array to choose an element from.
 * @returns {any} A random element from the array.
 */
function chooseRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}


/**
 * Removes the first occurrence of `value` in `array`.
 * Does nothing if `value` isn't contained in `array`.
 * @param {any[]} array The array to remove an element from.
 * @param {any} value The value to remove from the array.
 */
function removeItem(array, value) {
    if (array.includes(value)) {
        array.splice(array.indexOf(value), 1);
    }
}
