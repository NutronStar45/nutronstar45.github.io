import { Representation, integersDisplay, validateCodePoints } from "./util.mjs";

/**
 * Converts a code point sequence into text.
 * @throws {RangeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function toText(codePoints: number[]) {
    validateCodePoints(codePoints);
    return String.fromCodePoint(...codePoints);
}

/**
 * Converts a code point sequence into its hex representation.
 * @throws {RangeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function toCodePointsHex(codePoints: number[]) {
    validateCodePoints(codePoints);
    return integersDisplay(codePoints, 16, 4, false);
}

/**
 * Converts a code point sequence into its decimal representation.
 * @throws {RangeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function toCodePointsDec(codePoints: number[]) {
    validateCodePoints(codePoints);
    return integersDisplay(codePoints, 10, 0, false);
}

/**
 * Converts a code point sequence into a UTF-8 code unit sequence.
 * @throws {RangeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function toUTF8Units(codePoints: number[]) {
    validateCodePoints(codePoints);

    let codeUnits = [];
    for (const codePoint of codePoints) {
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
    return codeUnits;
}

/**
 * Converts a code point sequence into a UTF-16 code unit sequence.
 * @throws {RangeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function toUTF16Units(codePoints: number[]) {
    validateCodePoints(codePoints);

    let codeUnits = [];
    for (const codePoint of codePoints) {
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
    return codeUnits;
}

/**
 * Converts a code point sequence into a UTF-32 code unit sequence.
 * @throws {RangeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function toUTF32Units(codePoints: number[]) {
    validateCodePoints(codePoints);
    return codePoints;
}

/**
 * Converts a code point sequence into the specified representation.
 * @throws {RangeError} Thrown when the given sequence contains a code point that is:
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
            return integersDisplay(toUTF8Units(codePoints), 16, 2, false);
        case Representation.UTF8Dec:
            return integersDisplay(toUTF8Units(codePoints), 10, 0, false);

        case Representation.UTF16Hex:
            return integersDisplay(toUTF16Units(codePoints), 16, 4, false);
        case Representation.UTF16Dec:
            return integersDisplay(toUTF16Units(codePoints), 10, 0, false);

        case Representation.UTF32Hex:
            return integersDisplay(toUTF32Units(codePoints), 16, 8, false);
        case Representation.UTF32Dec:
            return integersDisplay(toUTF32Units(codePoints), 10, 0, false);

        default:
            throw new RangeError("Invalid representation");
    }
}
