import $ from "jquery";
const HEX_DIGIT_REGEX = /[0-9a-fA-F]/;
const DEC_DIGIT_REGEX = /[0-9]/;
/**
 * Throws an error if the given code point isn't valid.
 * @param decimal Whether to display the code point in decimal in an error message. Defaults to displaying in hex.
 * @throws {TypeError} Thrown when the given code point is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function validateCodePoint(codePoint, decimal = false) {
    if (!Number.isInteger(codePoint)) {
        throw new TypeError(`Non-integer code point (${codePoint})`);
    }
    let codePointDisplay;
    if (decimal) {
        codePointDisplay = codePoint.toString();
    }
    else {
        codePointDisplay = Math.abs(codePoint).toString(16).toUpperCase();
        if (codePoint >= 0) {
            codePointDisplay = "0x" + codePointDisplay.padStart(4, "0");
        }
        else {
            codePointDisplay = "-0x" + codePointDisplay;
        }
    }
    if (codePoint < 0 || codePoint > 0x10FFFF) {
        throw new TypeError(`Code point outside valid range (${codePointDisplay})`);
    }
    if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
        throw new TypeError(`Surrogate code point (${codePointDisplay})`);
    }
}
/**
 * Converts a string into a code point sequence.
 * @throws {TypeError} Thrown when the given text contains an isolated surrogate.
 */
function fromText(str) {
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
function fromCodePointsHex(str) {
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
function fromCodePointsDec(str) {
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
function fromUTF32Hex(str) {
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
 * Converts a code point sequence to text.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function toText(sequence) {
    for (const codePoint of sequence) {
        validateCodePoint(codePoint);
    }
    return String.fromCodePoint(...sequence);
}
/**
 * Converts a code point sequence to its hex representation.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function toCodePointsHex(sequence) {
    let string = "";
    for (const [i, codePoint] of sequence.entries()) {
        validateCodePoint(codePoint);
        if (i > 0)
            string += " ";
        string += codePoint.toString(16).toUpperCase().padStart(4, "0");
    }
    return string;
}
/**
 * Converts a code point sequence to its decimal representation.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function toCodePointsDec(sequence) {
    let string = "";
    for (const [i, codePoint] of sequence.entries()) {
        validateCodePoint(codePoint);
        if (i > 0)
            string += " ";
        string += codePoint.toString();
    }
    return string;
}
/**
 * Converts a code point sequence to UTF-32.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function toUTF32Hex(sequence) {
    let string = "";
    for (const [i, codePoint] of sequence.entries()) {
        validateCodePoint(codePoint);
        if (i > 0)
            string += " ";
        string += codePoint.toString(16).toUpperCase().padStart(8, "0");
    }
    return string;
}
/** Clears messages */
function clearMessages() {
    $("div#text-message").empty();
    $("div#code-points-hex-message").empty();
    $("div#code-points-dec-message").empty();
    $("div#utf32-message").empty();
}
/** Converts text into other representations. */
function convertFromText() {
    try {
        let codePoints = fromText($("textarea#text").val());
        $("textarea#code-points-hex").val(toCodePointsHex(codePoints));
        $("textarea#code-points-dec").val(toCodePointsDec(codePoints));
        $("textarea#utf32").val(toUTF32Hex(codePoints));
        clearMessages();
    }
    catch (e) {
        if (e instanceof TypeError) {
            $("div#text-message").text("Error: " + e.message);
        }
        else {
            throw e;
        }
    }
}
/** Converts the hex representation of a code point sequence into other representations. */
function convertFromCodePointsHex() {
    try {
        let codePoints = fromCodePointsHex($("textarea#code-points-hex").val());
        $("textarea#text").val(toText(codePoints));
        $("textarea#code-points-dec").val(toCodePointsDec(codePoints));
        $("textarea#utf32").val(toUTF32Hex(codePoints));
        clearMessages();
    }
    catch (e) {
        if (e instanceof TypeError) {
            $("div#code-points-hex-message").text("Error: " + e.message);
        }
        else {
            throw e;
        }
    }
}
/** Converts the decimal representation of a code point sequence into other representations. */
function convertFromCodePointsDec() {
    try {
        let codePoints = fromCodePointsDec($("textarea#code-points-dec").val());
        $("textarea#text").val(toText(codePoints));
        $("textarea#code-points-hex").val(toCodePointsHex(codePoints));
        $("textarea#utf32").val(toUTF32Hex(codePoints));
        clearMessages();
    }
    catch (e) {
        if (e instanceof TypeError) {
            $("div#code-points-dec-message").text("Error: " + e.message);
        }
        else {
            throw e;
        }
    }
}
/** Converts the hex representation of a UTF-32 string into other representations. */
function convertFromUTF32Hex() {
    try {
        let codePoints = fromUTF32Hex($("textarea#utf32").val());
        $("textarea#text").val(toText(codePoints));
        $("textarea#code-points-hex").val(toCodePointsHex(codePoints));
        $("textarea#code-points-dec").val(toCodePointsDec(codePoints));
        clearMessages();
    }
    catch (e) {
        if (e instanceof TypeError) {
            $("div#utf32-message").text("Error: " + e.message);
        }
        else {
            throw e;
        }
    }
}
$(() => {
    $("button#convert-from-text").on("click", convertFromText);
    $("button#convert-from-code-points-hex").on("click", convertFromCodePointsHex);
    $("button#convert-from-code-points-dec").on("click", convertFromCodePointsDec);
    $("button#convert-from-utf32").on("click", convertFromUTF32Hex);
});
