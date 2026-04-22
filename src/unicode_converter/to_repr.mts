import { Representation, sequenceHexDisplay, validateCodePoint } from "./util.mjs";

/**
 * Converts a code point sequence into text.
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
 * Converts a code point sequence into its hex representation.
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
 * Converts a code point sequence into its decimal representation.
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
 * Converts a code point sequence into the hex representation of a UTF-8 string.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
export function toUTF8Hex(sequence: number[]) {
    let codeUnits = [];
    for (const codePoint of sequence) {
        validateCodePoint(codePoint);

        // 1 code unit
        if (codePoint <= 0xFF) {
            codeUnits.push(codePoint);
        }

        // 2 code units
        else if (codePoint <= 0x7FF) {
            codeUnits.push(0xC0 + (codePoint >> 6));
            codeUnits.push(0x80 + (codePoint & 0x3F));
        }

        // 3 code units
        else if (codePoint <= 0xFFFF) {
            codeUnits.push(0xE0 + (codePoint >> 12));
            codeUnits.push(0x80 + ((codePoint >> 6) & 0x3F));
            codeUnits.push(0x80 + (codePoint & 0x3F));
        }

        // 4 code units
        else {
            codeUnits.push(0xF0 + (codePoint >> 18));
            codeUnits.push(0x80 + ((codePoint >> 12) & 0x3F));
            codeUnits.push(0x80 + ((codePoint >> 6) & 0x3F));
            codeUnits.push(0x80 + (codePoint & 0x3F));
        }
    }
    return sequenceHexDisplay(codeUnits, 2, false);
}

/**
 * Converts a code point sequence into the hex representation of a UTF-16 string.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
export function toUTF16Hex(sequence: number[]) {
    let codeUnits = [];
    for (const codePoint of sequence) {
        validateCodePoint(codePoint);

        // 1 code unit
        if (codePoint <= 0xFFFF) {
            codeUnits.push(codePoint);
        }

        // 2 code units
        else {
            codeUnits.push(0xD800 + ((codePoint >> 10) - 0x40));
            codeUnits.push(0xDC00 + (codePoint & 0x3FF));
        }
    }
    return sequenceHexDisplay(codeUnits, 4, false);
}

/**
 * Converts a code point sequence into the hex representation of a UTF-32 string.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
export function toUTF32Hex(sequence: number[]) {
    for (const codePoint of sequence) {
        validateCodePoint(codePoint);
    }
    return sequenceHexDisplay(sequence, 8, false);
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
        case Representation.UTF8Hex:
            return toUTF8Hex(codePoints);
        case Representation.UTF16Hex:
            return toUTF16Hex(codePoints);
        case Representation.UTF32Hex:
            return toUTF32Hex(codePoints);
    }
}
