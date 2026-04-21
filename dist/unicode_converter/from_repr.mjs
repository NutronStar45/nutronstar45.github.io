import { HEX_DIGIT_REGEX, DEC_DIGIT_REGEX, Representation, validateCodePoint } from "./util.mjs";
/**
 * Converts a string into a code point sequence.
 * @throws {TypeError} Thrown when the given text contains an isolated surrogate.
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
 * Converts the hex representation of a code point sequence into the code point sequence.
 * @throws {TypeError} Thrown when the given string:
 * - contains a character that is neither a hex digit nor a whitespace,
 * - contains a hex digit sequence with length greater than 6 digits,
 * - contains a code point outside the valid range, or
 * - contains a code point reserved for an surrogate.
 */
export function fromCodePointsHex(str) {
    let sequence = [];
    let partialCodePointHex = ""; // A partially-built code point (in hex representation)
    for (const char of str) {
        if (/\s/.test(char)) {
            if (partialCodePointHex !== "") {
                let codePoint = Number.parseInt(partialCodePointHex, 16);
                validateCodePoint(codePoint);
                sequence.push(codePoint);
                partialCodePointHex = "";
            }
        }
        else if (HEX_DIGIT_REGEX.test(char)) {
            partialCodePointHex += char.toUpperCase();
            if (partialCodePointHex.length > 6) {
                throw new TypeError(`Hex digit sequence longer than 6 digits (${partialCodePointHex})`);
            }
        }
        else {
            throw new TypeError(`Encountered a character that is neither a hex digit nor a whitespace (\"${char}\")`);
        }
    }
    if (partialCodePointHex !== "") {
        let codePoint = Number.parseInt(partialCodePointHex, 16);
        validateCodePoint(codePoint);
        sequence.push(codePoint);
    }
    return sequence;
}
/**
 * Converts the decimal representation of a code point sequence into the code point sequence.
 * @throws {TypeError} Thrown when the given string:
 * - contains a character that is neither a decimal digit nor a whitespace,
 * - contains a decimal digit sequence with length greater than 7 digits,
 * - contains a code point outside the valid range, or
 * - contains a code point reserved for an surrogate.
 */
export function fromCodePointsDec(str) {
    let sequence = [];
    let partialCodePointDec = ""; // A partially-built code point (in decimal representation)
    for (const char of str) {
        if (/\s/.test(char)) {
            if (partialCodePointDec !== "") {
                let codePoint = Number(partialCodePointDec);
                validateCodePoint(codePoint, true);
                sequence.push(codePoint);
                partialCodePointDec = "";
            }
        }
        else if (DEC_DIGIT_REGEX.test(char)) {
            partialCodePointDec += char;
            if (partialCodePointDec.length > 7) {
                throw new TypeError(`Decimal digit sequence longer than 7 digits (${partialCodePointDec})`);
            }
        }
        else {
            throw new TypeError(`Encountered a character that is neither a decimal digit nor a whitespace (\"${char}\")`);
        }
    }
    if (partialCodePointDec !== "") {
        let codePoint = Number(partialCodePointDec);
        validateCodePoint(codePoint, true);
        sequence.push(codePoint);
    }
    return sequence;
}
/**
 * Converts the hex representation of a UTF-32 string into a code point sequence.
 * @throws {TypeError} Thrown when the given string:
 * - contains a character that is neither a hex digit nor a whitespace,
 * - contains a code point outside the valid range,
 * - contains a code point reserved for an surrogate, or
 * - contains an invalid number of digits.
 */
export function fromUTF32Hex(str) {
    let sequence = [];
    let digitIndex = 0; // The index of the current digit
    let partialCodeUnitHex = ""; // A partially-built code unit (in hex representation)
    for (const char of str) {
        if (/\s/.test(char))
            continue;
        if (HEX_DIGIT_REGEX.test(char)) {
            partialCodeUnitHex += char.toUpperCase();
        }
        else {
            throw new TypeError(`Encountered a character that is neither a hex digit nor a whitespace (\"${char}\")`);
        }
        if (partialCodeUnitHex.length === 8) {
            let codePoint = Number.parseInt(partialCodeUnitHex, 16);
            validateCodePoint(codePoint);
            sequence.push(codePoint);
            partialCodeUnitHex = "";
        }
        digitIndex++;
    }
    if (partialCodeUnitHex !== "") {
        throw new TypeError(`Invalid number of hex digits (${digitIndex})`);
    }
    return sequence;
}
/**
 * Converts the specified representation of a string into a code point sequence.
 * @throws {TypeError} Thrown when the given string is invalid. Exact conditions can be seen in the docs of individual conversions.
 */
export function fromRepresentation(str, representation) {
    switch (representation) {
        case Representation.Text:
            return fromText(str);
        case Representation.CodePointsHex:
            return fromCodePointsHex(str);
        case Representation.CodePointsDec:
            return fromCodePointsDec(str);
        case Representation.UTF32Hex:
            return fromUTF32Hex(str);
    }
}
