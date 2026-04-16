import $ from "jquery";

/**
 * Converts a string to a code point sequence.
 * @throws {TypeError} Thrown when the given text contains an isolated surrogate.
 */
function fromText(text: string) {
    let i = 0;
    let sequence = [];
    while (i < text.length) {
        let codePoint = text.codePointAt(i)!;
        sequence.push(codePoint);
        if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
            throw new TypeError("Isolated surrogate");
        } else if (codePoint >= 0x10000) {
            i += 2;
        } else {
            i += 1;
        }
    }
    return sequence;
}

/**
 * Converts a code point sequence to UTF-32.
 * @throws {TypeError} Thrown when the given sequence is invalid.
 */
function toUTF32(sequence: number[]) {
    let string = "";
    for (const [i, codePoint] of sequence.entries()) {
        if (!Number.isInteger(codePoint)) {
            throw new TypeError("Non-integer code point");
        }
        if (codePoint < 0 || codePoint > 0x10FFFF) {
            throw new TypeError("Code point outside the valid range");
        }
        if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
            throw new TypeError("Surrogate code point");
        }

        if (i > 0) string += " ";
        string += codePoint.toString(16).toUpperCase().padStart(8, "0");
    }
    return string;
}

/** Converts text to other encodings. */
function convertFromText() {
    let codePoints = fromText($("textarea#text").val() as string);

    let utf32 = toUTF32(codePoints);
    $("textarea#utf32").val(utf32);
}

$(() => {
    $("button#convert-from-text").on("click", convertFromText);
});
