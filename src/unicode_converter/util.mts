/** An allowed radix. */
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

/** A Unicode representation. */
export enum Representation {
    Text = "text",
    CodePointsHex = "code-points-hex",
    CodePointsDec = "code-points-dec",
    UTF8Hex = "utf8-hex",
    UTF16Hex = "utf16-hex",
    UTF32Hex = "utf32-hex"
}

/**
 * Throws an error if the given code point isn't valid.
 * @param radix The radix to display the code point in in an error message.
 * @throws {RangeError} Thrown when the given code point is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function validateCodePoint(codePoint: number, radix: Radix) {
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
 * @param radix The radix to display the code point in in an error message.
 * @throws {RangeError} Thrown when the given code point sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
export function validateCodePoints(codePoints: number[], radix: Radix) {
    for (const codePoint of codePoints) {
        validateCodePoint(codePoint, radix);
    }
}

/**
 * Formats a non-negative integer sequence into (optionally fixed-width) numbers in the specified radix separated by spaces. "0x" or "0b" (for hex and bin, respectively) can be optionally prepended to every number.
 * @param radix The radix to display the integers in.
 * @param width If 0, disables fixed-width; if positive, controls the width to display the numbers in. If positive, the sequence must not contain a number whose width exceeds this parameter.
 * @param prefix If true, "0x" or "0b" (for hex and bin, respectively) is prepended to every number.
 * @throws {RangeError} Thrown if the input array contains a number:
 * - that is not a non-negative integer, or
 * - whose width exceeds {@linkcode width} (if fixed-width is enabled).
 */
export function integersDisplay(sequence: number[], radix: Radix, width: number, prefix: boolean) {
    if (!Number.isInteger(width) || width <= 0) {
        throw new RangeError("Width must be a non-negative integer");
    }

    let string = "";

    for (const [i, number] of sequence.entries()) {
        if (!Number.isInteger(number) || number < 0) {
            throw new RangeError("Encountered a number that is not a non-negative integer");
        }
        if (width > 0 && number >= radix ** width) {
            throw new RangeError("Encountered a number whose width exceeds the specified limit");
        }

        if (i > 0) {
            string += " ";
        }
        if (prefix) {
            string += radixPrefix(radix);
        }
        string += number.toString(radix).toUpperCase().padStart(width, "0");
    }

    return string;
}
