import { radixDigitsRegex, Representation, validateCodePoint, sequenceDisplayHex } from "./util.mjs";
/**
 * Converts a string into a code point sequence.
 * @throws {RangeError} Thrown when the given text contains an isolated surrogate.
 */
export function fromText(str) {
    let sequence = [];
    for (const char of str) {
        let codePoint = char.codePointAt(0);
        validateCodePoint(codePoint);
        sequence.push(codePoint);
    }
    return sequence;
}
/**
 * Converts the specified representation of a code point sequence into the code point sequence. Code points should be separated by whitespaces.
 * @param radix The radix of the representation.
 * @param maxLength The maximum allowed number of digits of a digit sequence.
 * @throws {RangeError} Thrown when:
 * - the given max length isn't a positive integer,
 * - the given string contains a character that is neither an allowed digit of the radix nor a whitespace,
 * - the given string contains a digit sequence with length greater than the specified max length,
 * - the given string contains a code point outside the valid range, or
 * - the given string contains a code point reserved for an surrogate.
 */
function fromCodePointsRepr(str, radix, maxLength) {
    if (!Number.isInteger(maxLength) || maxLength < 0) {
        throw new RangeError("Max length must be a positive integer");
    }
    let sequence = [];
    let partialCodePoint = ""; // The representation of a partially-built code point
    for (const char of str) {
        if (/\s/.test(char)) {
            if (partialCodePoint !== "") {
                const codePoint = Number.parseInt(partialCodePoint, radix);
                validateCodePoint(codePoint);
                sequence.push(codePoint);
                partialCodePoint = "";
            }
        }
        else if (radixDigitsRegex(radix).test(char)) {
            partialCodePoint += char.toUpperCase();
            if (partialCodePoint.length > maxLength) {
                throw new RangeError(`Digit sequence longer than ${maxLength} digits (${partialCodePoint})`);
            }
        }
        else {
            throw new RangeError(`Encountered a character that is neither an allowed digit nor a whitespace (\"${char}\")`);
        }
    }
    if (partialCodePoint !== "") {
        const codePoint = Number.parseInt(partialCodePoint, radix);
        validateCodePoint(codePoint);
        sequence.push(codePoint);
    }
    return sequence;
}
/**
 * Converts the hex representation of a code point sequence into the code point sequence.
 * @throws {RangeError} Thrown when the given string:
 * - contains a character that is neither a hex digit nor a whitespace,
 * - contains a hex digit sequence with length greater than 6 digits,
 * - contains a code point outside the valid range, or
 * - contains a code point reserved for an surrogate.
 */
export function fromCodePointsHex(str) {
    return fromCodePointsRepr(str, 16, 6);
}
/**
 * Converts the decimal representation of a code point sequence into the code point sequence.
 * @throws {RangeError} Thrown when the given string:
 * - contains a character that is neither a decimal digit nor a whitespace,
 * - contains a decimal digit sequence with length greater than 7 digits,
 * - contains a code point outside the valid range, or
 * - contains a code point reserved for an surrogate.
 */
export function fromCodePointsDec(str) {
    return fromCodePointsRepr(str, 10, 7);
}
/**
 * Parses fixed-width digit sequences (code units, bytes, etc.) in the specified representation of an encoding form or scheme; ignores whitespaces.
 * @param radix The radix of the representation.
 * @param width The width of the digit sequences; must be a positive integer.
 * @throws {RangeError} Thrown when:
 * - the given width isn't a positive integer,
 * - the given string contains a character that is neither an allowed digit nor a whitespace, or
 * - the given string contains an invalid number of digits.
 */
function parseUnits(str, radix, width) {
    if (!Number.isInteger(width) || width < 0) {
        throw new RangeError("Width must be a positive integer");
    }
    let sequence = [];
    let digitIndex = 0; // The index of the current digit
    let partialUnit = ""; // A partially-built code unit (in hex representation)
    for (const char of str) {
        if (/\s/.test(char))
            continue;
        if (radixDigitsRegex(radix).test(char)) {
            partialUnit += char.toUpperCase();
        }
        else {
            throw new RangeError(`Encountered a character that is neither an allowed digit nor a whitespace (\"${char}\")`);
        }
        // Parse code unit
        if (partialUnit.length === width) {
            const unit = Number.parseInt(partialUnit, radix);
            sequence.push(unit);
            partialUnit = "";
        }
        digitIndex++;
    }
    if (partialUnit !== "") {
        throw new RangeError(`Invalid number of digits (${digitIndex})`);
    }
    return sequence;
}
/**
 * Converts the hex representation of a UTF-8 string into a code point sequence.
 * @throws {RangeError} Thrown when the given string:
 * - contains a character that is neither a hex digit nor a whitespace,
 * - contains an invalid number of digits, or
 * - contains an ill-formed code unit sequence.
 */
export function fromUTF8Hex(str) {
    let sequence = [];
    let partialCodeUnitSequence = []; // Code units of a partially built character
    for (const codeUnit of parseUnits(str, 16, 2)) {
        // 1-code-unit character (0xxx_xxxx)
        if (codeUnit <= 0x7F) {
            // After an incomplete code unit sequence
            if (partialCodeUnitSequence.length !== 0) {
                throw new RangeError(`Incomplete code unit sequence (${sequenceDisplayHex(partialCodeUnitSequence, 2, true)})`);
            }
            sequence.push(codeUnit);
        }
        // Trail code unit (10xx_xxxx)
        else if (codeUnit <= 0xBF) {
            // Not after an incomplete code unit sequence
            if (partialCodeUnitSequence.length === 0) {
                throw new RangeError(`Lone trail code unit (0x${codeUnit.toString(16).toUpperCase()})`);
            }
            partialCodeUnitSequence.push(codeUnit);
            // Combine 2-code-unit character (110x_xxxx)
            if (partialCodeUnitSequence[0] <= 0xDF) {
                if (partialCodeUnitSequence.length === 2) {
                    const codePoint = ((partialCodeUnitSequence[0] - 0xC0) << 6)
                        + (partialCodeUnitSequence[1] - 0x80);
                    if (codePoint <= 0x7F) {
                        throw new RangeError(`Non-shortest form code unit sequence (${sequenceDisplayHex(partialCodeUnitSequence, 2, true)})`);
                    }
                    sequence.push(codePoint);
                    partialCodeUnitSequence = [];
                }
            }
            // Combine 3-code-unit character (1110_xxxx)
            if (partialCodeUnitSequence[0] <= 0xEF) {
                if (partialCodeUnitSequence.length === 3) {
                    const codePoint = ((partialCodeUnitSequence[0] - 0xE0) << 12)
                        + ((partialCodeUnitSequence[1] - 0x80) << 6)
                        + (partialCodeUnitSequence[2] - 0x80);
                    if (codePoint <= 0x7FF) {
                        throw new RangeError(`Non-shortest form code unit sequence (${sequenceDisplayHex(partialCodeUnitSequence, 2, true)})`);
                    }
                    validateCodePoint(codePoint); // Check for code points assigned to surrogates
                    sequence.push(codePoint);
                    partialCodeUnitSequence = [];
                }
            }
            // Combine 4-code-unit character (1111_xxxx)
            else {
                if (partialCodeUnitSequence.length === 4) {
                    const codePoint = ((partialCodeUnitSequence[0] - 0xF0) << 18)
                        + ((partialCodeUnitSequence[1] - 0x80) << 12)
                        + ((partialCodeUnitSequence[2] - 0x80) << 6)
                        + (partialCodeUnitSequence[3] - 0x80);
                    if (codePoint <= 0xFFFF) {
                        throw new RangeError(`Non-shortest form code unit sequence (${sequenceDisplayHex(partialCodeUnitSequence, 2, true)})`);
                    }
                    validateCodePoint(codePoint); // Check for code points greater than 0x10FFFF
                    sequence.push(codePoint);
                    partialCodeUnitSequence = [];
                }
            }
        }
        // Lead code unit (110x_xxxx ~ 1111_0xxx)
        else if (codeUnit <= 0xF7) {
            // After an incomplete code unit sequence
            if (partialCodeUnitSequence.length !== 0) {
                throw new RangeError(`Incomplete code unit sequence (${sequenceDisplayHex(partialCodeUnitSequence, 2, true)})`);
            }
            partialCodeUnitSequence.push(codeUnit);
        }
        // Invalid code unit
        else {
            throw new RangeError(`Invalid code unit (0x${codeUnit.toString(16).toUpperCase()})`);
        }
    }
    if (partialCodeUnitSequence.length !== 0) {
        throw new RangeError(`Incomplete code unit sequence (${sequenceDisplayHex(partialCodeUnitSequence, 2, true)})`);
    }
    return sequence;
}
/**
 * Converts the hex representation of a UTF-16 string into a code point sequence.
 * @throws {RangeError} Thrown when the given string:
 * - contains a character that is neither a hex digit nor a whitespace,
 * - contains an invalid number of digits, or
 * - contains a lone surrogate.
 */
export function fromUTF16Hex(str) {
    let sequence = [];
    let lowSurrogate = null; // Leading low surrogate, or `null` when not storing one
    for (const codeUnit of parseUnits(str, 16, 4)) {
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
            sequence.push(codePoint);
            lowSurrogate = null;
        }
        // Scalar
        else {
            // After a low surrogate
            if (lowSurrogate !== null) {
                throw new RangeError(`Lone low surrogate (0x${lowSurrogate.toString(16).toUpperCase()})`);
            }
            sequence.push(codeUnit);
        }
    }
    if (lowSurrogate !== null) {
        throw new RangeError(`Lone low surrogate (0x${lowSurrogate.toString(16).toUpperCase()})`);
    }
    return sequence;
}
/**
 * Converts the hex representation of a UTF-32 string into a code point sequence.
 * @throws {RangeError} Thrown when the given string:
 * - contains a character that is neither a hex digit nor a whitespace,
 * - contains an invalid number of digits,
 * - contains a code point outside the valid range, or
 * - contains a code point reserved for an surrogate.
 */
export function fromUTF32Hex(str) {
    let sequence = [];
    for (const codeUnit of parseUnits(str, 16, 8)) {
        validateCodePoint(codeUnit);
        sequence.push(codeUnit);
    }
    return sequence;
}
/**
 * Converts the specified representation of a string into a code point sequence.
 * @throws {RangeError} Thrown when the given string is invalid. Exact conditions can be seen in the docs of individual conversions.
 */
export function fromRepresentation(str, representation) {
    switch (representation) {
        case Representation.Text:
            return fromText(str);
        case Representation.CodePointsHex:
            return fromCodePointsHex(str);
        case Representation.CodePointsDec:
            return fromCodePointsDec(str);
        case Representation.UTF8Hex:
            return fromUTF8Hex(str);
        case Representation.UTF16Hex:
            return fromUTF16Hex(str);
        case Representation.UTF32Hex:
            return fromUTF32Hex(str);
        default:
            throw new RangeError("Invalid representation");
    }
}
