/** Returns a RegExp matching an allowed digit of the specified radix. */
export function radixDigitsRegex(radix) {
    switch (radix) {
        case 2:
            return /0|1/;
        case 10:
            return /\d/;
        case 16:
            return /[\da-fA-F]/;
        default:
            throw new TypeError("Invalid radix");
    }
}
/** A Unicode representation. */
export var Representation;
(function (Representation) {
    Representation["Text"] = "text";
    Representation["CodePointsHex"] = "code-points-hex";
    Representation["CodePointsDec"] = "code-points-dec";
    Representation["UTF8Hex"] = "utf8-hex";
    Representation["UTF16Hex"] = "utf16-hex";
    Representation["UTF32Hex"] = "utf32-hex";
})(Representation || (Representation = {}));
/**
 * Throws an error if the given code point isn't valid.
 * @param decimal Whether to display the code point in decimal in an error message. Defaults to displaying in hex.
 * @throws {TypeError} Thrown when the given code point is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
export function validateCodePoint(codePoint, decimal = false) {
    if (!Number.isInteger(codePoint)) {
        throw new TypeError(`Non-integer code point (${codePoint})`);
    }
    let codePointDisplay;
    if (decimal) {
        codePointDisplay = codePoint.toString();
    }
    else {
        codePointDisplay = Math.abs(codePoint).toString(16).toUpperCase();
        if (codePoint >= 0) {
            codePointDisplay = "0x" + codePointDisplay.padStart(4, "0");
        }
        else {
            codePointDisplay = "-0x" + codePointDisplay;
        }
    }
    if (codePoint < 0 || codePoint > 0x10FFFF) {
        throw new TypeError(`Code point outside valid range (${codePointDisplay})`);
    }
    if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
        throw new TypeError(`Code point reserved for a surrogate (${codePointDisplay})`);
    }
}
/**
 * Formats a non-negative integer sequence into fixed-width hex numbers separated by spaces. "0x" can be optionally prepended to every number.
 * @param width The width to display the numbers in; must be a positive integer. The sequence must not contain numbers whose width exceeds this parameter.
 * @param prefix If true, "0x" is prepended to every number.
 * @throws {TypeError} Thrown if the input array contains a number:
 * - that is not a non-negative integer, or
 * - whose width exceeds {@linkcode width}.
 */
export function sequenceDisplayHex(sequence, width, prefix) {
    if (!Number.isInteger(width) || width < 0) {
        throw new TypeError("Width must be a positive integer");
    }
    let string = "";
    for (const [i, number] of sequence.entries()) {
        if (!Number.isInteger(number) || number < 0) {
            throw new TypeError("Encountered a number that is not a non-negative integer");
        }
        if (number >= 16 ** width) {
            throw new TypeError("Encountered a number whose width exceeds the specified limit");
        }
        if (i > 0) {
            string += " ";
        }
        if (prefix) {
            string += "0x";
        }
        string += number.toString(16).toUpperCase().padStart(width, "0");
    }
    return string;
}
