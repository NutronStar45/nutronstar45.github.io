import { $ } from "jquery.mjs";
import { SITE_VERSION } from "./common_util.mjs";
/**
 * Returns default alert messages.
 * @param type The type of the alert.
 * @param args Some arguments. Depends on the type of the alert.
 * @returns The default alert message, or `null` if the `type` isn't supported or `args` is unexpected.
 */
export function defaultAlert(type, args) {
    switch (type) {
        case "numberMissing":
            return "A number should be entered";
        case "numberBadInput":
            return "A number should be entered";
        case "numberUnderflow":
            if ("min" in args && typeof args.min === "number") {
                return `Number should be at least ${args.min}`;
            }
            break;
        case "numberOverflow":
            if ("max" in args && typeof args.max === "number") {
                return `Number should be at most ${args.max}`;
            }
            break;
        case "numberStepMismatch":
            if ("step" in args && typeof args.step === "number") {
                if (args.step === 1) {
                    return `Number should be an integer`;
                }
                else {
                    return `Number should be a multiple of ${args.step}`;
                }
            }
            break;
        case "numbersMissing":
            return "Number(s) should be entered";
        case "numbersBadInput":
            return "Number(s) should be entered";
        case "numbersLengthUnderflow":
            if ("lmin" in args && typeof args.lmin === "number") {
                return `At least ${args.lmin} numbers should be given`;
            }
            break;
        case "numbersLengthOverflow":
            if ("lmax" in args && typeof args.lmax === "number") {
                return `At most ${args.lmax} numbers should be given`;
            }
            break;
        case "numbersUnderflow":
            if ("min" in args && typeof args.min === "number") {
                return `Number(s) should be at least ${args.min}`;
            }
            break;
        case "numbersOverflow":
            if ("max" in args && typeof args.max === "number") {
                return `Number(s) should be at most ${args.max}`;
            }
            break;
        case "numbersStepMismatch":
            if ("step" in args && typeof args.step === "number") {
                if (args.step === 1) {
                    return `Number(s) should be an integer`;
                }
                else {
                    return `Number(s) should be multiple(s) of ${args.step}`;
                }
            }
            break;
        case "custom":
            if ("text" in args && typeof args.text === "string") {
                return args.text;
            }
            break;
    }
    return null;
}
/**
 * Creates an element with the SVG namespace.
 * This function is necessary because all SVG elements must be namespaced.
 * @param name The tag name of the element.
 * @returns The JQuery element with SVG namespace.
 */
export function svgElement(name) {
    return $(document.createElementNS("http://www.w3.org/2000/svg", name));
}
/**
 * Validates zero or more `<input>`s and returns `true` if all inputs are valid. References to other inputs are validated but no alert is placed after, because those inputs are assumed to already be validated on their own.
 * @param $targets Targets for validation; a JQuery object that contains an arbitrary number of elements. Non-`<input>`s will be ignored.
 * @param alert Whether to put an alert after invalid inputs or not. Defaults to `true`.
 * @returns Whether `targets` are valid or not.
 */
export function validate($targets, alert = true) {
    let allValid = true;
    for (const target of $targets) {
        const $target = $(target);
        const $label = $target.parent("label");
        let isTargetValid = true;
        // Ignore non-`<input>`s
        if (!(target instanceof HTMLInputElement)) {
            continue;
        }
        if ($target.is("[type=number]")) {
            // Check references
            {
                // Check if minimum is a query selector
                const refMin = $target.attr("ref-min");
                if (refMin !== undefined) {
                    // Validate reference
                    if (validate($(refMin), false)) {
                        const val = $(refMin).val();
                        if (typeof val === "number") {
                            $target.attr("min", val);
                        }
                        else {
                            console.error(`Value referenced by \`ref-min\` isn't a number: ${val}`);
                        }
                    }
                }
                // Check if maximum is a query selector
                const refMax = $target.attr("ref-max");
                if (refMax !== undefined) {
                    // Validate reference
                    if (validate($(refMax), false)) {
                        const val = $(refMax).val();
                        if (typeof val === "number") {
                            $target.attr("max", val);
                        }
                        else {
                            console.error(`Value referenced by \`ref-max\` isn't a number: ${val}`);
                        }
                    }
                }
                // Check if step is a query selector
                const refStep = $target.attr("ref-step");
                if (refStep !== undefined) {
                    // Validate reference
                    if (validate($(refStep)), false) {
                        const val = $(refStep).val();
                        if (typeof val === "number") {
                            $target.attr("step", val);
                        }
                        else {
                            console.error(`Value referenced by \`ref-step\` isn't a number: ${val}`);
                        }
                    }
                }
            }
            const min = +($target.attr("min") ?? -Infinity);
            const max = +($target.attr("max") ?? Infinity);
            const step = +($target.attr("step") ?? 1);
            const validity = target.validity;
            if (!validity.valid) {
                isTargetValid = allValid = false;
                if (alert) {
                    if (validity.valueMissing) {
                        alertError($label, "numberMissing");
                    }
                    else if (validity.badInput) {
                        alertError($label, "numberBadInput");
                    }
                    else if (validity.rangeUnderflow) {
                        alertError($label, "numberUnderflow", { min });
                    }
                    else if (validity.rangeOverflow) {
                        alertError($label, "numberOverflow", { max });
                    }
                    else if (validity.stepMismatch) {
                        alertError($label, "numberStepMismatch", { step });
                    }
                    else {
                        alertError($label, "custom", { text: target.validationMessage });
                    }
                }
            }
        }
        if ($target.is("[type=text]")) {
            // Custom type: numbers separated by commas, whitespaces are ignored
            // `min` and `max` are the restrictions on each number
            // `lmin` and `lmax` are the restrictions on the number (length) of numbers
            if ($target.is("[ctype=numbers]")) {
                // Check references
                {
                    // Check if minimum is a query selector
                    const refMin = $target.attr("ref-min");
                    if (refMin !== undefined) {
                        // Validate reference
                        if (validate($(refMin), false)) {
                            const val = $(refMin).val();
                            if (typeof val === "number") {
                                $target.attr("min", val);
                            }
                            else {
                                console.error(`Value referenced by \`ref-min\` isn't a number: ${val}`);
                            }
                        }
                    }
                    // Check if maximum is a query selector
                    const refMax = $target.attr("ref-max");
                    if (refMax !== undefined) {
                        // Validate reference
                        if (validate($(refMax), false)) {
                            const val = $(refMax).val();
                            if (typeof val === "number") {
                                $target.attr("max", val);
                            }
                            else {
                                console.error(`Value referenced by \`ref-max\` isn't a number: ${val}`);
                            }
                        }
                    }
                    // Check if step is a query selector
                    const refStep = $target.attr("ref-step");
                    if (refStep !== undefined) {
                        // Validate reference
                        if (validate($(refStep), false)) {
                            const val = $(refStep).val();
                            if (typeof val === "number") {
                                $target.attr("step", val);
                            }
                            else {
                                console.error(`Value referenced by \`ref-step\` isn't a number: ${val}`);
                            }
                        }
                    }
                    // Check if minimum length is a query selector
                    const refLmin = $target.attr("ref-lmin");
                    if (refLmin !== undefined) {
                        // Validate reference
                        if (validate($(refLmin), false)) {
                            const val = $(refLmin).val();
                            if (typeof val === "number") {
                                $target.attr("lmin", val);
                            }
                            else {
                                console.error(`Value referenced by \`ref-lmin\` isn't a number: ${val}`);
                            }
                        }
                    }
                    // Check if maximum length is a query selector
                    const refLmax = $target.attr("ref-lmax");
                    if (refLmax !== undefined) {
                        // Validate reference
                        if (validate($(refLmax), false)) {
                            const val = $(refLmax).val();
                            if (typeof val === "number") {
                                $target.attr("lmax", val);
                            }
                            else {
                                console.error(`Value referenced by \`ref-lmax\` isn't a number: ${val}`);
                            }
                        }
                    }
                }
                const min = +($target.attr("min") ?? -Infinity);
                const max = +($target.attr("max") ?? Infinity);
                const step = +($target.attr("step") ?? 1);
                const lmin = +($target.attr("lmin") ?? 0);
                const lmax = +($target.attr("lmax") ?? Infinity);
                // Manual tests
                (() => {
                    const values = $target.val().replace(/ /g, "").split(",");
                    // Too few numbers
                    if (values.length < lmin) {
                        target.setCustomValidity("numbersLengthUnderflow");
                        return;
                    }
                    // Too many numbers
                    if (values.length > lmax) {
                        target.setCustomValidity("numbersLengthOverflow");
                        return;
                    }
                    for (const value of values) {
                        // Invalid
                        if (value === "" || isNaN(+value)) {
                            target.setCustomValidity("numbersBadInput");
                            return;
                        }
                        // Too small
                        if (+value < min) {
                            target.setCustomValidity("numbersUnderflow");
                            return;
                        }
                        // Too big
                        if (+value > max) {
                            target.setCustomValidity("numbersOverflow");
                            return;
                        }
                        // Step mismatch
                        if (+value % step !== 0) {
                            target.setCustomValidity("numbersStepMismatch");
                            return;
                        }
                    }
                })();
                const validity = target.validity;
                const message = target.validationMessage;
                if (!validity.valid) {
                    isTargetValid = allValid = false;
                    if (alert) {
                        if (validity.valueMissing) {
                            alertError($label, "numbersMissing");
                        }
                        else if (message === "numbersBadInput") {
                            alertError($label, "numbersBadInput");
                        }
                        else if (message === "numbersLengthUnderflow") {
                            alertError($label, "numbersLengthUnderflow", { lmin });
                        }
                        else if (message === "numbersLengthOverflow") {
                            alertError($label, "numbersLengthOverflow", { lmax });
                        }
                        else if (message === "numbersUnderflow") {
                            alertError($label, "numbersUnderflow", { min });
                        }
                        else if (message === "numbersOverflow") {
                            alertError($label, "numbersOverflow", { max });
                        }
                        else if (message === "numbersStepMismatch") {
                            alertError($label, "numbersStepMismatch", { step });
                        }
                        else {
                            alertError($label, "custom", { text: message });
                        }
                    }
                }
            }
        }
        if (isTargetValid) {
            $label.next("span.alert").remove(); // Remove previous alert
        }
    }
    return allValid;
}
/**
 * Places an alert after an element.
 * @param $target The element.
 * @param type The type of the alert.
 * @param args Arguments that gets passed into the function which generates the alert. Defaults to an empty object.
 */
function alertError($target, type, args = {}) {
    // Use the alert text if provided
    // Otherwise pass the arguments to the default alert text function if it exists
    // Otherwise use a generic text
    const alertText = $target.attr("alert-" + type) ?? defaultAlert(type, args) ?? "Error";
    $target.next("span.alert").remove(); // Remove previous alert if one exists
    $target.after(`<span class="alert alert-${type}">${alertText}</span>`); // Place alert
}
/**
 * Downloads a file.
 * @param content The content of the file.
 * @param filename The name of the file, including the file extension.
 */
export function downloadFile(content, filename) {
    const blob = new Blob([content]);
    const url = URL.createObjectURL(blob);
    $("<a></a>").attr("download", filename).attr("href", url)[0].click();
    URL.revokeObjectURL(url);
}
/**
 * Shows/hides the corner box and the "show corner box" button, and stores to `localStorage`.
 * @param visible Whether the corner box is visible or not.
 */
function updateCornerBoxVisibility(visible) {
    $("div#corner-box").toggle(visible);
    $("button#show-corner-box").toggle(!visible);
    localStorage.setItem("cornerBoxVisible", String(visible));
}
$(() => {
    let cornerBoxVisible = localStorage.getItem("cornerBoxVisible") !== "false";
    // Location on 404 page
    // `slice(1)` to trim the beginning slash
    $("code#404-location").html(location.pathname.slice(1));
    // Header
    const headerHTML = '<nav><a href="/">Home</a><a href="/projs">Projects</a></nav>'
        + '<button id="show-corner-box">Show corner box</button>';
    $("header").html(headerHTML);
    $("button#show-corner-box").hide();
    // Sections information
    const sections = $("section").map(function () {
        const title = $(this).children("h3").text();
        const id = $(this).attr("id");
        if (id === undefined) {
            console.error(`Section with title ${title} doesn't have an ID`);
        }
        return { title, id: id ?? "" };
    }).get();
    // Corner box
    let cornerBoxHTML = `<button id="hide-corner-box">Hide</button><br><a href="#">To top</a><br><span>Version ${SITE_VERSION}</span>`;
    // Section links
    if (sections.length > 0) {
        cornerBoxHTML += '<br><details><summary>Sections</summary>';
        sections.forEach((section, i) => {
            if (i > 0) {
                cornerBoxHTML += `<br>`;
            }
            cornerBoxHTML += `<a href="#${section.id}">${section.title}</a>`;
        });
        cornerBoxHTML += "</details>";
    }
    // Place corner box into DOM
    $("div#corner-box").html(cornerBoxHTML);
    updateCornerBoxVisibility(cornerBoxVisible);
    // Show corner box
    $("button#show-corner-box").on("click", function () {
        cornerBoxVisible = true;
        updateCornerBoxVisibility(cornerBoxVisible);
    });
    // Hide corner box
    $("button#hide-corner-box").on("click", function () {
        cornerBoxVisible = false;
        updateCornerBoxVisibility(cornerBoxVisible);
    });
    // Required indicator
    $("input[required]")
        .before('<span class="required-ind">* </span>')
        .parent("label")
        .attr("title", "Required");
});
