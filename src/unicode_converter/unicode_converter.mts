import $ from "jquery";

const HEX_DIGITS_REGEX = /[0-9a-fA-F]/;

/**
 * Throws an error if the given code point isn't valid.
 * @throws {TypeError} Thrown when the given code point is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function validateCodePoint(codePoint: number) {
    if (!Number.isInteger(codePoint)) {
        throw new TypeError(`Non-integer code point: ${codePoint}`);
    }
    if (codePoint < 0 || codePoint > 0x10FFFF) {
        let codePointDisplay = Math.abs(codePoint).toString(16).toUpperCase();
        if (codePoint >= 0) {
            codePointDisplay = "0x" + codePointDisplay.padStart(4, "0");
        } else {
            codePointDisplay = "-0x" + codePointDisplay;
        }
        throw new TypeError(`Code point outside valid range: ${codePointDisplay}`);
    }
    if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
        throw new TypeError(`Surrogate code point: 0x${codePoint.toString(16).toUpperCase()}`);
    }
}

/**
 * Converts a string into a code point sequence.
 * @throws {TypeError} Thrown when the given text contains an isolated surrogate.
 */
function fromText(str: string) {
    let sequence = [];
    for (const char of str) {
        let codePoint = char.codePointAt(0)!;
        validateCodePoint(codePoint);
        sequence.push(codePoint);
    }
    return sequence;
}

/**
 * Converts the hexadecimal representation of a UTF-32 string into a code point sequence.
 * @throws {TypeError} Thrown when the given string:
 * - contains a character that is neither a hexadecimal digit nor a whitespace,
 * - contains a code point outside the valid range,
 * - contains a code point reserved for an isolated surrogate, or
 * - contains an invalid number of digits.
 */
function fromUTF32(str: string) {
    let sequence = [];
    let partialCodeUnit = 0; // A partially-built code unit
    let place = 7; // The place of the current digit; 0 indicates the 16^0 place and 7 indicates the 16^7 place
    let digitIndex = 0; // The index of the current character

    for (const char of str) {
        if (/\s/.test(char)) continue;
        if (HEX_DIGITS_REGEX.test(char)) {
            partialCodeUnit = (partialCodeUnit << 4) + Number.parseInt(char, 16);
            digitIndex++;
        } else {
            throw TypeError(`Encountered a character that is neither a hexadecimal digit or a whitespace (\"${char}\")`);
        }

        if (place === 0) {
            validateCodePoint(partialCodeUnit);
            sequence.push(partialCodeUnit);
            partialCodeUnit = 0;
            place = 7;
        } else {
            place--;
        }
    }

    if (place !== 7) {
        throw new TypeError(`Invalid number of digits (${digitIndex})`);
    }

    return sequence;
}

/**
 * Converts a code point sequence to text.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function toText(sequence: number[]) {
    for (const codePoint of sequence) {
        validateCodePoint(codePoint);
    }
    return String.fromCodePoint(...sequence);
}

/**
 * Converts a code point sequence to UTF-32.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function toUTF32(sequence: number[]) {
    let string = "";
    for (const [i, codePoint] of sequence.entries()) {
        validateCodePoint(codePoint);
        if (i > 0) string += " ";
        string += codePoint.toString(16).toUpperCase().padStart(8, "0");
    }
    return string;
}

/** Clears messages */
function clearMessages() {
    $("div#text-message").empty();
    $("div#utf32-message").empty();
}

/** Converts text into other encodings. */
function convertFromText() {
    try {
        let codePoints = fromText($("textarea#text").val() as string);

        let utf32 = toUTF32(codePoints);
        $("textarea#utf32").val(utf32);

        clearMessages();
    } catch (e) {
        if (e instanceof TypeError) {
            $("div#text-message").text("Error: " + e.message);
        } else {
            throw e;
        }
    }
}

/** Converts the hexadecimal representation of a UTF-32 string into other encodings. */
function convertFromUTF32() {
    try {
        let codePoints = fromUTF32($("textarea#utf32").val() as string);

        let text = toText(codePoints);
        $("textarea#text").val(text);

        clearMessages();
    } catch (e) {
        if (e instanceof TypeError) {
            $("div#utf32-message").text("Error: " + e.message);
        } else {
            throw e;
        }
    }
}

$(() => {
    $("button#convert-from-text").on("click", convertFromText);
    $("button#convert-from-utf32").on("click", convertFromUTF32);
});
