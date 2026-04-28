import { Representation, formatIntegers, validateCodePoints } from "./util.mjs";
/**
 * Converts a code point sequence into text.
 * @throws {RangeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function toText(codePoints) {
    validateCodePoints(codePoints);
    return String.fromCodePoint(...codePoints);
}
/**
 * Converts a code point sequence into its representation in the specified radix. Code points can optionally have a minimum width.
 * @param radix The radix to convert the code points into.
 * @param minWidth The minimum width of the code points; must be a non-negative integer. Code points whose widths exceed this parameter keep their width.
 * @throws {RangeError} Thrown if the given minimum width is not a non-negative integer, or the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function toCodePointsRepr(codePoints, radix, minWidth) {
    validateCodePoints(codePoints);
    return formatIntegers(codePoints, radix, minWidth, false);
}
/**
 * Converts a code point sequence into a UTF-8 code unit sequence.
 * @throws {RangeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function toUTF8Units(codePoints) {
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
function toUTF16Units(codePoints) {
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
function toUTF32Units(codePoints) {
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
export function toRepresentation(codePoints, representation) {
    switch (representation) {
        case Representation.Text:
            return toText(codePoints);
        case Representation.CodePointsHex:
            return toCodePointsRepr(codePoints, 16, 4);
        case Representation.CodePointsDec:
            return toCodePointsRepr(codePoints, 10, 0);
        case Representation.CodePointsBin:
            return toCodePointsRepr(codePoints, 2, 0);
        case Representation.UTF8Hex:
            return formatIntegers(toUTF8Units(codePoints), 16, 2, false);
        case Representation.UTF8Dec:
            return formatIntegers(toUTF8Units(codePoints), 10, 0, false);
        case Representation.UTF8Bin:
            return formatIntegers(toUTF8Units(codePoints), 2, 8, false);
        case Representation.UTF16Hex:
            return formatIntegers(toUTF16Units(codePoints), 16, 4, false);
        case Representation.UTF16Dec:
            return formatIntegers(toUTF16Units(codePoints), 10, 0, false);
        case Representation.UTF16Bin:
            return formatIntegers(toUTF16Units(codePoints), 2, 16, false);
        case Representation.UTF32Hex:
            return formatIntegers(toUTF32Units(codePoints), 16, 8, false);
        case Representation.UTF32Dec:
            return formatIntegers(toUTF32Units(codePoints), 10, 0, false);
        case Representation.UTF32Bin:
            return formatIntegers(toUTF32Units(codePoints), 2, 32, false);
        default:
            throw new RangeError("Invalid representation");
    }
}
