import { type Radix, Endianness, Representation, formatIntegers, validateCodePoints } from "./util.mjs";

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
 * Converts a code point sequence into its representation in the specified radix. Code points can optionally have a minimum width.
 * @param radix The radix to convert the code points into.
 * @param minWidth The minimum width of the code points; must be a non-negative integer. Code points whose widths exceed this parameter keep their width.
 * @throws {RangeError} Thrown if the given minimum width is not a non-negative integer, or the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function toCodePointsRepr(codePoints: number[], radix: Radix, minWidth: number) {
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
 * Converts a code unit sequence into a byte sequence.
 * @param size The number of bytes of each code unit.
 * @param endianness The endianness to parse the byte sequence with.
 * @throws {RangeError} Thrown when:
 * - the given size isn't a positive integer,
 * - the given array contains a code unit that is not a non-negative integer or whose size is greater than the given size.
 */
function codeUnitsToBytes(codeUnits: number[], size: number, endianness: Endianness) {
    if (!Number.isInteger(size) || size <= 0) {
        throw new RangeError("Size must be a positive integer");
    }

    let bytes: number[] = [];
    for (let codeUnit of codeUnits) {
        if (!Number.isInteger(codeUnit) || codeUnit < 0) {
            throw new RangeError("Code unit must be a non-negative integer");
        }

        // Little-endian
        let codeUnitBytes = [];
        for (let i = 0; i < size; i++) {
            const byte = codeUnit % 256;
            codeUnitBytes.push(byte);
            codeUnit = (codeUnit - byte) / 256;
        }

        if (codeUnit !== 0) {
            throw new RangeError("Code unit has size greater than the given size");
        }

        // Correct for endianness
        if (endianness === Endianness.Big) {
            codeUnitBytes.reverse();
        }

        bytes = bytes.concat(codeUnitBytes);
    }

    return bytes;
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
        // Text
        case Representation.Text:
            return toText(codePoints);

        // Code points
        case Representation.CodePointsHex:
            return toCodePointsRepr(codePoints, 16, 4);
        case Representation.CodePointsDec:
            return toCodePointsRepr(codePoints, 10, 0);
        case Representation.CodePointsBin:
            return toCodePointsRepr(codePoints, 2, 0);

        // UTF-8
        case Representation.UTF8Hex:
            return formatIntegers(toUTF8Units(codePoints), 16, 2, false);
        case Representation.UTF8Dec:
            return formatIntegers(toUTF8Units(codePoints), 10, 0, false);
        case Representation.UTF8Bin:
            return formatIntegers(toUTF8Units(codePoints), 2, 8, false);

        // UTF-16 encoding form
        case Representation.UTF16CEFHex:
            return formatIntegers(toUTF16Units(codePoints), 16, 4, false);
        case Representation.UTF16CEFDec:
            return formatIntegers(toUTF16Units(codePoints), 10, 0, false);
        case Representation.UTF16CEFBin:
            return formatIntegers(toUTF16Units(codePoints), 2, 16, false);

        // UTF-16BE
        case Representation.UTF16BEHex:
            return formatIntegers(codeUnitsToBytes(toUTF16Units(codePoints), 2, Endianness.Big), 16, 2, false);
        case Representation.UTF16BEDec:
            return formatIntegers(codeUnitsToBytes(toUTF16Units(codePoints), 2, Endianness.Big), 10, 0, false);
        case Representation.UTF16BEBin:
            return formatIntegers(codeUnitsToBytes(toUTF16Units(codePoints), 2, Endianness.Big), 2, 8, false);

        // UTF-16LE
        case Representation.UTF16LEHex:
            return formatIntegers(codeUnitsToBytes(toUTF16Units(codePoints), 2, Endianness.Little), 16, 2, false);
        case Representation.UTF16LEDec:
            return formatIntegers(codeUnitsToBytes(toUTF16Units(codePoints), 2, Endianness.Little), 10, 0, false);
        case Representation.UTF16LEBin:
            return formatIntegers(codeUnitsToBytes(toUTF16Units(codePoints), 2, Endianness.Little), 2, 8, false);

        // UTF-32 encoding form
        case Representation.UTF32CEFHex:
            return formatIntegers(toUTF32Units(codePoints), 16, 8, false);
        case Representation.UTF32CEFDec:
            return formatIntegers(toUTF32Units(codePoints), 10, 0, false);
        case Representation.UTF32CEFBin:
            return formatIntegers(toUTF32Units(codePoints), 2, 32, false);

        // UTF-32BE
        case Representation.UTF32BEHex:
            return formatIntegers(codeUnitsToBytes(toUTF32Units(codePoints), 4, Endianness.Big), 16, 2, false);
        case Representation.UTF32BEDec:
            return formatIntegers(codeUnitsToBytes(toUTF32Units(codePoints), 4, Endianness.Big), 10, 0, false);
        case Representation.UTF32BEBin:
            return formatIntegers(codeUnitsToBytes(toUTF32Units(codePoints), 4, Endianness.Big), 2, 8, false);

        // UTF-32LE
        case Representation.UTF32LEHex:
            return formatIntegers(codeUnitsToBytes(toUTF32Units(codePoints), 4, Endianness.Little), 16, 2, false);
        case Representation.UTF32LEDec:
            return formatIntegers(codeUnitsToBytes(toUTF32Units(codePoints), 4, Endianness.Little), 10, 0, false);
        case Representation.UTF32LEBin:
            return formatIntegers(codeUnitsToBytes(toUTF32Units(codePoints), 4, Endianness.Little), 2, 8, false);

        default:
            throw new RangeError("Invalid representation");
    }
}
