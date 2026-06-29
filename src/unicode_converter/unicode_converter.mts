import $ from "jquery";
import { Representation } from "./util.mjs";
import { fromRepresentation } from "./from_repr.mjs";
import { toRepresentation } from "./to_repr.mjs";

/** Converts a representation into every representation. */
function convertFromRepr(repr: Representation) {
    try {
        // Convert into code points
        const codePoints = fromRepresentation($(`textarea#${repr}`).val() as string, repr);

        // Convert code points into every representation
        for (const target_key in Representation) {
            const target_repr = Representation[target_key as keyof typeof Representation];
            const uppercase = $("input#uppercase").prop("checked");

            $(`textarea#${target_repr}`).val(toRepresentation(codePoints, target_repr, uppercase));
            $(`div#${target_repr}-message`).empty();
        }
    } catch (e) {
        if (e instanceof RangeError) {
            $(`div#${repr}-message`).text("Error: " + e.message);
        } else {
            throw e;
        }
    }
}

/** Handle settings. */
function handleSettings() {
    // Convert on enter
    $("input#convert-on-enter").prop("checked", true);

    // Convert on enter > Exclude text
    $("input#convert-on-enter").on("change", function () {
        $("input#convert-on-enter-exclude-text").prop("disabled", !(this as HTMLInputElement).checked);
    });

    // Uppercase
    $("input#uppercase").prop("checked", true);
}

// Handle conversion
for (const key in Representation) {
    const repr = Representation[key as keyof typeof Representation];

    // Convert button
    $(`button#convert-from-${repr}`).on("click", () => {
        convertFromRepr(repr);
    });

    // Convert if enter is pressed and "Convert on enter" is enabled
    $(`textarea#${repr}`).on("keydown", e => {
        // Pressed enter
        // "Convert on enter" is enabled
        if (e.key === "Enter" && $("input#convert-on-enter").prop("checked")) {
            // Check for "Exclude text"
            if (!(repr === Representation.Text && $("input#convert-on-enter-exclude-text").prop("checked"))) {
                convertFromRepr(repr);
                e.preventDefault();
            }
        }
    });
}

handleSettings();
