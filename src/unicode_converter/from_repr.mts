import { type Radix, radixDigitsRegex, Endianness, Representation, validateCodePoints, formatIntegers } from "./util.mjs";

/**
 * Converts a string into a code point sequence.
 * @throws {RangeError} Thrown when the given text contains an isolated surrogate.
 */
function fromText(str: string) {
    let codePoints = [];
    for (const char of str) {
        let codePoint = char.codePointAt(0)!;
        codePoints.push(codePoint);
    }

    validateCodePoints(codePoints);
    return codePoints;
}

/**
 * Parses the specified representation of a sequence of non-negative integers into the sequence.
 * @param radix The radix of the representation.
 * @param maxLength The maximum allowed number of digits of a digit sequence.
 * @throws {RangeError} Thrown when:
 * - the given max length isn't a positive integer,
 * - the given string contains a character that is neither an allowed digit of the radix nor a whitespace, or
 * - the given string contains a digit sequence with length greater than the specified max length.
 */
function parseIntegersWhitespace(str: string, radix: Radix, maxLength: number) {
    if (!Number.isInteger(maxLength) || maxLength <= 0) {
        throw new RangeError("Max length must be a positive integer");
    }

    let integers = [];
    let partialInteger = ""; // The representation of a partially-built integer

    for (const char of str) {
        if (/\s/.test(char)) {
            if (partialInteger !== "") {
                const integer = Number.parseInt(partialInteger, radix);
                integers.push(integer);
                partialInteger = "";
            }
        } else if (radixDigitsRegex(radix).test(char)) {
            partialInteger += char.toUpperCase();
            if (partialInteger.length > maxLength) {
                throw new RangeError(`Digit sequence longer than ${maxLength} digits (${partialInteger})`);
            }
        } else {
            throw new RangeError(`Encountered a character that is neither an allowed digit nor a whitespace (\"${char}\")`);
        }
    }

    if (partialInteger !== "") {
        const integer = Number.parseInt(partialInteger, radix);
        integers.push(integer);
    }

    return integers;
}

/**
 * Parses fixed-width integers in the specified representation of an encoding form or scheme; ignores whitespaces.
 * @param radix The radix of the representation.
 * @param width The width of the digit sequences; must be a positive integer.
 * @throws {RangeError} Thrown when:
 * - the given width isn't a positive integer,
 * - the given string contains a character that is neither an allowed digit nor a whitespace, or
 * - the given string contains an invalid number of digits.
 */
function parseIntegers(str: string, radix: Radix, width: number) {
    if (!Number.isInteger(width) || width <= 0) {
        throw new RangeError("Width must be a positive integer");
    }

    let integers = [];
    let digitIndex = 0; // The index of the current digit
    let partialInteger = ""; // The representation of a partially-built integer

    for (const char of str) {
        if (/\s/.test(char)) continue;
        if (radixDigitsRegex(radix).test(char)) {
            partialInteger += char.toUpperCase();
        } else {
            throw new RangeError(`Encountered a character that is neither an allowed digit nor a whitespace (\"${char}\")`);
        }

        // Parse code unit
        if (partialInteger.length === width) {
            const unit = Number.parseInt(partialInteger, radix);
            integers.push(unit);
            partialInteger = "";
        }

        digitIndex++;
    }

    if (partialInteger !== "") {
        throw new RangeError(`Invalid number of digits (${digitIndex})`);
    }

    return integers;
}

/**
 * Converts the representation of a code point sequence into the code point sequence.
 * @param radix The radix of the representation.
 * @param maxLength The maximum allowed number of digits of a digit sequence.
 * @throws {RangeError} Thrown when the given max length isn't a positive integer, or the given string:
 * - contains a character that is neither an allowed digit of the radix nor a whitespace,
 * - contains a digit sequence with length greater than the given max length,
 * - contains a code point outside the valid range, or
 * - contains a code point reserved for an surrogate.
 */
function fromCodePointsRepr(str: string, radix: Radix, maxLength: number) {
    const codePoints = parseIntegersWhitespace(str, radix, maxLength);
    validateCodePoints(codePoints);
    return codePoints;
}

/**
 * Converts a byte sequence into a code unit sequence.
 * @param size The number of bytes of each code unit.
 * @param endianness The endianness to parse the byte sequence with.
 * @throws {RangeError} Thrown when:
 * - the given size isn't a positive integer,
 * - the length of the given array isn't a multiple of the given size, or
 * - the given array contains a non-byte.
 */
function codeUnitsFromBytes(bytes: number[], size: number, endianness: Endianness) {
    if (!Number.isInteger(size) || size <= 0) {
        throw RangeError("Size must be a positive integer");
    }
    if (bytes.length % size !== 0) {
        throw RangeError("Length of array must be a multiple of the size");
    }

    let codeUnits = [];
    for (let codeUnitPos = 0; codeUnitPos < bytes.length; codeUnitPos += size) {
        // Big-endian
        let codeUnitBytes = bytes.slice(codeUnitPos, codeUnitPos + size);

        // Correct for endianness
        if (endianness === Endianness.Little) {
            codeUnitBytes.reverse();
        }

        // Compose code unit
        let codeUnit = 0;
        for (const byte of codeUnitBytes) {
            if (!Number.isInteger(byte) || size < 0 || size > 255) {
                throw RangeError("Encountered a number that is not a byte");
            }

            codeUnit = codeUnit * 256 + byte;
        }
        codeUnits.push(codeUnit);
    }

    return codeUnits;
}

/**
 * Converts a UTF-8 code unit sequence into a code point sequence.
 * @throws {RangeError} Thrown when the given sequence is ill-formed.
 */
function fromUTF8Units(codeUnits: number[]) {
    let codePoints = [];
    let partialCodeUnitSequence = []; // Code units of a partially built character

    for (const codeUnit of codeUnits) {
        if (!Number.isInteger(codeUnit) || codeUnit < 0 || codeUnit > 0xFF) {
            throw new RangeError("Invalid code unit");
        }

        // 1-code-unit character (0xxx_xxxx)
        if (codeUnit <= 0x7F) {
            // After an incomplete code unit sequence
            if (partialCodeUnitSequence.length !== 0) {
                throw new RangeError(`Incomplete code unit sequence (${formatIntegers(partialCodeUnitSequence, 16, 2, true)})`);
            }

            codePoints.push(codeUnit);
        }

        // Trail code unit (10xx_xxxx)
        else if (codeUnit <= 0xBF) {
            // Not after an incomplete code unit sequence
            if (partialCodeUnitSequence.length === 0) {
                throw new RangeError(`Lone trail code unit (0x${codeUnit.toString(16).toUpperCase()})`);
            }

            partialCodeUnitSequence.push(codeUnit);

            // Combine 2-code-unit character (110x_xxxx)
            if (partialCodeUnitSequence[0]! <= 0xDF) {
                if (partialCodeUnitSequence.length === 2) {
                    const codePoint = ((partialCodeUnitSequence[0]! - 0xC0) << 6)
                        + (partialCodeUnitSequence[1]! - 0x80);
                    if (codePoint <= 0x7F) {
                        throw new RangeError(`Non-shortest form code unit sequence (${formatIntegers(partialCodeUnitSequence, 16, 2, true)})`);
                    }
                    codePoints.push(codePoint);
                    partialCodeUnitSequence = [];
                }
            }

            // Combine 3-code-unit character (1110_xxxx)
            if (partialCodeUnitSequence[0]! <= 0xEF) {
                if (partialCodeUnitSequence.length === 3) {
                    const codePoint = ((partialCodeUnitSequence[0]! - 0xE0) << 12)
                        + ((partialCodeUnitSequence[1]! - 0x80) << 6)
                        + (partialCodeUnitSequence[2]! - 0x80);
                    if (codePoint <= 0x7FF) {
                        throw new RangeError(`Non-shortest form code unit sequence (${formatIntegers(partialCodeUnitSequence, 16, 2, true)})`);
                    }
                    codePoints.push(codePoint);
                    partialCodeUnitSequence = [];
                }
            }

            // Combine 4-code-unit character (1111_xxxx)
            else {
                if (partialCodeUnitSequence.length === 4) {
                    const codePoint = ((partialCodeUnitSequence[0]! - 0xF0) << 18)
                        + ((partialCodeUnitSequence[1]! - 0x80) << 12)
                        + ((partialCodeUnitSequence[2]! - 0x80) << 6)
                        + (partialCodeUnitSequence[3]! - 0x80);
                    if (codePoint <= 0xFFFF) {
                        throw new RangeError(`Non-shortest form code unit sequence (${formatIntegers(partialCodeUnitSequence, 16, 2, true)})`);
                    }
                    codePoints.push(codePoint);
                    partialCodeUnitSequence = [];
                }
            }
        }

        // Lead code unit (110x_xxxx ~ 1111_0xxx)
        else if (codeUnit <= 0xF7) {
            // After an incomplete code unit sequence
            if (partialCodeUnitSequence.length !== 0) {
                throw new RangeError(`Incomplete code unit sequence (${formatIntegers(partialCodeUnitSequence, 16, 2, true)})`);
            }

            partialCodeUnitSequence.push(codeUnit);
        }

        // Invalid code unit
        else {
            throw new RangeError(`Invalid code unit (0x${codeUnit.toString(16).toUpperCase()})`);
        }
    }

    if (partialCodeUnitSequence.length !== 0) {
        throw new RangeError(`Incomplete code unit sequence (${formatIntegers(partialCodeUnitSequence, 16, 2, true)})`);
    }

    validateCodePoints(codePoints);
    return codePoints;
}

/**
 * Converts a UTF-16 code unit sequence into a code point sequence.
 * @throws {RangeError} Thrown when the given sequence is ill-formed.
 */
function fromUTF16Units(codeUnits: number[]) {
    let codePoints = [];
    let lowSurrogate = null; // Leading low surrogate, or `null` when not storing one

    for (const codeUnit of codeUnits) {
        if (!Number.isInteger(codeUnit) || codeUnit < 0 || codeUnit > 0xFFFF) {
            throw new RangeError("Invalid code unit");
        }

        // Low surrogate
        if (codeUnit >= 0xD800 && codeUnit <= 0xDBFF) {
            // After a low surrogate
            if (lowSurrogate !== null) {
                throw new RangeError(`Lone low surrogate (0x${lowSurrogate.toString(16).toUpperCase()})`);
            }

            lowSurrogate = codeUnit;
        }

        // High surrogate
        else if (codeUnit >= 0xDC00 && codeUnit <= 0xDFFF) {
            // Not after a low surrogate
            if (lowSurrogate === null) {
                throw new RangeError(`Lone high surrogate (0x${codeUnit.toString(16).toUpperCase()})`);
            }

            // Combine surrogate pair
            const codePoint = ((lowSurrogate - 0xD800 + 0x40) << 10) + (codeUnit - 0xDC00);
            codePoints.push(codePoint);
            lowSurrogate = null;
        }

        // Scalar
        else {
            // After a low surrogate
            if (lowSurrogate !== null) {
                throw new RangeError(`Lone low surrogate (0x${lowSurrogate.toString(16).toUpperCase()})`);
            }

            codePoints.push(codeUnit);
        }
    }

    if (lowSurrogate !== null) {
        throw new RangeError(`Lone low surrogate (0x${lowSurrogate.toString(16).toUpperCase()})`);
    }

    return codePoints;
}

/**
 * Converts a UTF-32 code unit sequence into a code point sequence.
 * @throws {RangeError} Thrown when the given sequence is ill-formed.
 */
function fromUTF32Units(codeUnits: number[]) {
    validateCodePoints(codeUnits);
    return codeUnits;
}

/**
 * Converts the specified representation of a string into a code point sequence.
 * @throws {RangeError} Thrown when the given string is invalid. Exact conditions can be seen in the docs of individual conversions.
 */
export function fromRepresentation(str: string, representation: Representation) {
    switch (representation) {
        case Representation.Text:
            return fromText(str);

        case Representation.CodePointsHex:
            return fromCodePointsRepr(str, 16, 6);
        case Representation.CodePointsDec:
            return fromCodePointsRepr(str, 10, 7);
        case Representation.CodePointsBin:
            return fromCodePointsRepr(str, 2, 21);

        case Representation.UTF8Hex:
            return fromUTF8Units(parseIntegers(str, 16, 2));
        case Representation.UTF8Dec:
            return fromUTF8Units(parseIntegersWhitespace(str, 10, 3));
        case Representation.UTF8Bin:
            return fromUTF8Units(parseIntegers(str, 2, 8));

        case Representation.UTF16Hex:
            return fromUTF16Units(parseIntegers(str, 16, 4));
        case Representation.UTF16Dec:
            return fromUTF16Units(parseIntegersWhitespace(str, 10, 5));
        case Representation.UTF16Bin:
            return fromUTF16Units(parseIntegers(str, 2, 16));

        case Representation.UTF32Hex:
            return fromUTF32Units(parseIntegers(str, 16, 8));
        case Representation.UTF32Dec:
            return fromUTF32Units(parseIntegersWhitespace(str, 10, 10));
        case Representation.UTF32Bin:
            return fromUTF32Units(parseIntegers(str, 2, 32));

        default:
            throw new RangeError("Invalid representation");
    }
}
