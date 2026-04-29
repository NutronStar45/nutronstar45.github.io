/** A supported radix. */
export type Radix = 2 | 10 | 16;

/** Returns a RegExp matching an allowed digit of the specified radix. */
export function radixDigitsRegex(radix: Radix) {
    switch (radix) {
        case 2:
            return /0|1/;
        case 10:
            return /\d/;
        case 16:
            return /[\da-fA-F]/;
        default:
            throw new RangeError("Invalid radix");
    }
}

/** Returns the prefix associated with the given radix. */
export function radixPrefix(radix: Radix) {
    switch (radix) {
        case 2:
            return "0b";
        case 10:
            return "";
        case 16:
            return "0x";
        default:
            throw new RangeError("Invalid radix");
    }
}

/** An endianness. */
export enum Endianness {
    Big,
    Little
}

/** A Unicode representation. */
export enum Representation {
    Text = "text",

    CodePointsHex = "code-points-hex",
    CodePointsDec = "code-points-dec",
    CodePointsBin = "code-points-bin",

    UTF8Hex = "utf8-hex",
    UTF8Dec = "utf8-dec",
    UTF8Bin = "utf8-bin",

    UTF16Hex = "utf16-hex",
    UTF16Dec = "utf16-dec",
    UTF16Bin = "utf16-bin",

    UTF16BEHex = "utf16be-hex",
    UTF16BEDec = "utf16be-dec",
    UTF16BEBin = "utf16be-bin",

    UTF16LEHex = "utf16le-hex",
    UTF16LEDec = "utf16le-dec",
    UTF16LEBin = "utf16le-bin",

    UTF32Hex = "utf32-hex",
    UTF32Dec = "utf32-dec",
    UTF32Bin = "utf32-bin"
}

/**
 * Throws an error if the given code point isn't valid.
 * @param radix The radix to display the code point in in an error message; defaults to hexadecimal.
 * @throws {RangeError} Thrown when the given code point is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function validateCodePoint(codePoint: number, radix: Radix = 16) {
    if (!Number.isInteger(codePoint)) {
        throw new RangeError(`Non-integer code point (${codePoint})`);
    }

    let codePointDisplay = Math.abs(codePoint).toString(radix).toUpperCase();
    if (codePoint >= 0) {
        if (radix === 2) {
            codePointDisplay = codePointDisplay.padStart(16, "0");
        }
        if (radix === 16) {
            codePointDisplay = codePointDisplay.padStart(4, "0");
        }
    }
    codePointDisplay = radixPrefix(radix) + codePointDisplay;
    if (codePoint < 0) {
        codePointDisplay = "-" + codePointDisplay;
    }

    if (codePoint < 0 || codePoint > 0x10FFFF) {
        throw new RangeError(`Code point outside valid range (${codePointDisplay})`);
    }
    if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
        throw new RangeError(`Code point reserved for a surrogate (${codePointDisplay})`);
    }
}

/**
 * Throws an error if the given code point sequence isn't valid.
 * @param radix The radix to display the code point in in an error message. Defaults to hexadecimal.
 * @throws {RangeError} Thrown when the given code point sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
export function validateCodePoints(codePoints: number[], radix: Radix = 16) {
    for (const codePoint of codePoints) {
        validateCodePoint(codePoint, radix);
    }
}

/**
 * Formats a non-negative integer sequence into the specified radix, separated by spaces. Numbers can optionally have a minimum width. "0x" or "0b" (for hex and bin, respectively) can be optionally prepended to every number.
 * @param radix The radix to convert the integers into.
 * @param minWidth The minimum width of the numbers; must be a non-negative integer. Numbers whose widths exceed this parameter keep their width.
 * @param prefix If true, "0x" or "0b" (for hex and bin, respectively) is prepended to every number.
 * @throws {RangeError} Thrown if the given minimum width is not a non-negative integer, or if the given array contains a number that is not a non-negative integer.
 */
export function formatIntegers(sequence: number[], radix: Radix, minWidth: number, prefix: boolean) {
    if (!Number.isInteger(minWidth) || minWidth < 0) {
        throw new RangeError("Minimum width must be a non-negative integer");
    }

    let string = "";

    for (const [i, number] of sequence.entries()) {
        if (!Number.isInteger(number) || number < 0) {
            throw new RangeError("Encountered a number that is not a non-negative integer");
        }

        if (i > 0) {
            string += " ";
        }
        if (prefix) {
            string += radixPrefix(radix);
        }
        string += number.toString(radix).toUpperCase().padStart(minWidth, "0");
    }

    return string;
}
