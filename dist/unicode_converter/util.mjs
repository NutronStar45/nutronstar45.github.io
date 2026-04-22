export const HEX_DIGIT_REGEX = /[0-9a-fA-F]/;
export const DEC_DIGIT_REGEX = /[0-9]/;
/** A Unicode representation. */
export var Representation;
(function (Representation) {
    Representation["Text"] = "text";
    Representation["CodePointsHex"] = "code-points-hex";
    Representation["CodePointsDec"] = "code-points-dec";
    Representation["UTF8Hex"] = "utf8-hex";
    Representation["UTF16Hex"] = "utf16-hex";
    Representation["UTF32Hex"] = "utf32-hex";
})(Representation || (Representation = {}));
/**
 * Throws an error if the given code point isn't valid.
 * @param decimal Whether to display the code point in decimal in an error message. Defaults to displaying in hex.
 * @throws {TypeError} Thrown when the given code point is:
 * - not an integer,
 * - outside the valid range, or
 * - reserved for a surrogate.
 */
export function validateCodePoint(codePoint, decimal = false) {
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
        throw new TypeError(`Code point reserved for a surrogate (${codePointDisplay})`);
    }
}
