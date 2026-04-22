import { Representation, validateCodePoint } from "./util.mjs";
/**
 * Converts a code point sequence into text.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
export function toText(sequence) {
    for (const codePoint of sequence) {
        validateCodePoint(codePoint);
    }
    return String.fromCodePoint(...sequence);
}
/**
 * Converts a code point sequence into its hex representation.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
export function toCodePointsHex(sequence) {
    let string = "";
    for (const [i, codePoint] of sequence.entries()) {
        validateCodePoint(codePoint);
        if (i > 0)
            string += " ";
        string += codePoint.toString(16).toUpperCase().padStart(4, "0");
    }
    return string;
}
/**
 * Converts a code point sequence into its decimal representation.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
export function toCodePointsDec(sequence) {
    let string = "";
    for (const [i, codePoint] of sequence.entries()) {
        validateCodePoint(codePoint);
        if (i > 0)
            string += " ";
        string += codePoint.toString();
    }
    return string;
}
/**
 * Converts a code point sequence into UTF-16.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
export function toUTF16Hex(sequence) {
    let string = "";
    for (const [i, codePoint] of sequence.entries()) {
        validateCodePoint(codePoint);
        if (i > 0)
            string += " ";
        // 1 code unit
        if (codePoint <= 0xFFFF) {
            string += codePoint.toString(16).toUpperCase().padStart(4, "0");
        }
        // 2 code units
        else {
            const firstUnit = 0xD800 + ((codePoint >> 10) - 0x40);
            const secondUnit = 0xDC00 + (codePoint & 0x3FF);
            string += firstUnit.toString(16).toUpperCase();
            string += " ";
            string += secondUnit.toString(16).toUpperCase();
        }
    }
    return string;
}
/**
 * Converts a code point sequence into UTF-32.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
export function toUTF32Hex(sequence) {
    let string = "";
    for (const [i, codePoint] of sequence.entries()) {
        validateCodePoint(codePoint);
        if (i > 0)
            string += " ";
        string += codePoint.toString(16).toUpperCase().padStart(8, "0");
    }
    return string;
}
/**
 * Converts a code point sequence into the specified representation.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
export function toRepresentation(codePoints, representation) {
    switch (representation) {
        case Representation.Text:
            return toText(codePoints);
        case Representation.CodePointsHex:
            return toCodePointsHex(codePoints);
        case Representation.CodePointsDec:
            return toCodePointsDec(codePoints);
        case Representation.UTF16Hex:
            return toUTF16Hex(codePoints);
        case Representation.UTF32Hex:
            return toUTF32Hex(codePoints);
    }
}
