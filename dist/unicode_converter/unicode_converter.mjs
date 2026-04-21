import $ from "jquery";
const HEX_DIGIT_REGEX = /[0-9a-fA-F]/;
const DEC_DIGIT_REGEX = /[0-9]/;
/** A Unicode representation. */
var Representation;
(function (Representation) {
    Representation["Text"] = "text";
    Representation["CodePointsHex"] = "code-points-hex";
    Representation["CodePointsDec"] = "code-points-dec";
    Representation["UTF32Hex"] = "utf32";
})(Representation || (Representation = {}));
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
/**
 * Converts the specified representation of a string into a code point sequence.
 * @throws {TypeError} Thrown when the given string is invalid. Exact conditions can be seen in the docs of individual conversions.
 */
function fromRepresentation(str, representation) {
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
/**
 * Converts a code point sequence into the specified representation.
 * @throws {TypeError} Thrown when the given sequence contains a code point that is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
function toRepresentation(codePoints, representation) {
    switch (representation) {
        case Representation.Text:
            return toText(codePoints);
        case Representation.CodePointsHex:
            return toCodePointsHex(codePoints);
        case Representation.CodePointsDec:
            return toCodePointsDec(codePoints);
        case Representation.UTF32Hex:
            return toUTF32Hex(codePoints);
    }
}
$(() => {
    // Attach listener to every convert button
    for (const key in Representation) {
        const repr = Representation[key];
        $(`button#convert-from-${repr}`).on("click", () => {
            try {
                // Convert into code points
                let codePoints = fromRepresentation($(`textarea#${repr}`).val(), repr);
                // Convert code points into every representation
                for (const target_key in Representation) {
                    const target_repr = Representation[target_key];
                    $(`textarea#${target_repr}`).val(toRepresentation(codePoints, target_repr));
                    $(`div#${target_repr}-message`).empty();
                }
            }
            catch (e) {
                if (e instanceof TypeError) {
                    $(`div#${repr}-message`).text("Error: " + e.message);
                }
                else {
                    throw e;
                }
            }
        });
    }
});
