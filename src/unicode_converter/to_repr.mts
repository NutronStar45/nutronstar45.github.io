import { Representation, validateCodePoint } from "./util.mjs";

/**
 * Converts a code point sequence to text.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
export function toText(sequence: number[]) {
    for (const codePoint of sequence) {
        validateCodePoint(codePoint);
    }
    return String.fromCodePoint(...sequence);
}

/**
 * Converts a code point sequence to its hex representation.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
export function toCodePointsHex(sequence: number[]) {
    let string = "";
    for (const [i, codePoint] of sequence.entries()) {
        validateCodePoint(codePoint);
        if (i > 0) string += " ";
        string += codePoint.toString(16).toUpperCase().padStart(4, "0");
    }
    return string;
}

/**
 * Converts a code point sequence to its decimal representation.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
export function toCodePointsDec(sequence: number[]) {
    let string = "";
    for (const [i, codePoint] of sequence.entries()) {
        validateCodePoint(codePoint);
        if (i > 0) string += " ";
        string += codePoint.toString();
    }
    return string;
}

/**
 * Converts a code point sequence to UTF-32.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
export function toUTF32Hex(sequence: number[]) {
    let string = "";
    for (const [i, codePoint] of sequence.entries()) {
        validateCodePoint(codePoint);
        if (i > 0) string += " ";
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
export function toRepresentation(codePoints: number[], representation: Representation) {
    switch (representation) {
        case Representation.Text:
            return toText(codePoints);
        case Representation.CodePointsHex:
            return toCodePointsHex(codePoints);
        case Representation.CodePointsDec:
            return toCodePointsDec(codePoints);
        case Representation.UTF32Hex:
            return toUTF32Hex(codePoints);
    }
}
