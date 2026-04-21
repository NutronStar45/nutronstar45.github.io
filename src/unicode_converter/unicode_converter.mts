import $ from "jquery";
import { Representation } from "./util.mjs";
import { fromRepresentation } from "./from_repr.mjs";
import { toRepresentation } from "./to_repr.mjs";

$(() => {
    // Attach listener to every convert button
    for (const key in Representation) {
        const repr = Representation[key as keyof typeof Representation];

        $(`button#convert-from-${repr}`).on("click", () => {
            try {
                // Convert into code points
                let codePoints = fromRepresentation($(`textarea#${repr}`).val() as string, repr);

                // Convert code points into every representation
                for (const target_key in Representation) {
                    const target_repr = Representation[target_key as keyof typeof Representation];
                    $(`textarea#${target_repr}`).val(toRepresentation(codePoints, target_repr));
                    $(`div#${target_repr}-message`).empty();
                }
            } catch (e) {
                if (e instanceof TypeError) {
                    $(`div#${repr}-message`).text("Error: " + e.message);
                } else {
                    throw e;
                }
            }
        });
    }
});
