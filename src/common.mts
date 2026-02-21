import { $ } from "jquery.mjs";
import { SITE_VERSION } from "./common_util.mjs";
import { type Alert } from "./alerts.mjs";
import * as alerts from "./alerts.mjs";


/**
 * Creates an element with the SVG namespace.
 * This function is necessary because all SVG elements must be namespaced.
 * @param name The tag name of the element.
 * @returns The JQuery element with SVG namespace.
 */
export function svgElement(name: string): JQuery<SVGElement> {
    return $(document.createElementNS("http://www.w3.org/2000/svg", name));
}


/**
 * Validates zero or more `<input>`s and returns `true` if all inputs are valid. References to other inputs are validated but no alert is placed after, because those inputs are assumed to already be validated on their own.
 * @param $targets Targets for validation; a JQuery object that contains an arbitrary number of elements. Non-`<input>`s will be ignored.
 * @param alert Whether to put an alert after invalid inputs or not. Defaults to `true`.
 * @returns Whether all {@linkcode $targets} are valid or not.
 */
export function validateInputs($targets: JQuery, alert=true): boolean {
    let allValid = true;

    for (const target of $targets) {
        const $target = $(target);
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
                    if (validateInputs($(refMin), false)) {
                        const val = $(refMin).val();
                        if (typeof val === "number") {
                            $target.attr("min", val);
                        } else {
                            console.error(`Value referenced by \`ref-min\` isn't a number: ${val}`);
                        }
                    }
                }

                // Check if maximum is a query selector
                const refMax = $target.attr("ref-max");
                if (refMax !== undefined) {
                    // Validate reference
                    if (validateInputs($(refMax), false)) {
                        const val = $(refMax).val();
                        if (typeof val === "number") {
                            $target.attr("max", val);
                        } else {
                            console.error(`Value referenced by \`ref-max\` isn't a number: ${val}`);
                        }
                    }
                }

                // Check if step is a query selector
                const refStep = $target.attr("ref-step");
                if (refStep !== undefined) {
                    // Validate reference
                    if (validateInputs($(refStep)), false) {
                        const val = $(refStep).val();
                        if (typeof val === "number") {
                            $target.attr("step", val);
                        } else {
                            console.error(`Value referenced by \`ref-step\` isn't a number: ${val}`);
                        }
                    }
                }
            }

            const min = Number($target.attr("min") ?? -Infinity);
            const max = Number($target.attr("max") ?? Infinity);
            const step = Number($target.attr("step") ?? 1);

            const validity = target.validity;
            const message = (target as HTMLInputElement).validationMessage;

            if (!validity.valid) {
                isTargetValid = allValid = false;

                if (alert) {
                    if (validity.valueMissing) {
                        alertError($target, new alerts.AlertNumberMissing());
                    } else if (validity.badInput) {
                        alertError($target, new alerts.AlertNumberBadInput());
                    }

                    else if (validity.rangeUnderflow) {
                        alertError($target, new alerts.AlertNumberUnderflow(min));
                    } else if (validity.rangeOverflow) {
                        alertError($target, new alerts.AlertNumberOverflow(max));
                    }

                    else if (validity.stepMismatch) {
                        alertError($target, new alerts.AlertNumberStepMismatch(step));
                    }

                    else {
                        alertError($target, new alerts.AlertCustom(message));
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
                        if (validateInputs($(refMin), false)) {
                            const val = $(refMin).val();
                            if (typeof val === "number") {
                                $target.attr("min", val);
                            } else {
                                console.error(`Value referenced by \`ref-min\` isn't a number: ${val}`);
                            }
                        }
                    }

                    // Check if maximum is a query selector
                    const refMax = $target.attr("ref-max");
                    if (refMax !== undefined) {
                        // Validate reference
                        if (validateInputs($(refMax), false)) {
                            const val = $(refMax).val();
                            if (typeof val === "number") {
                                $target.attr("max", val);
                            } else {
                                console.error(`Value referenced by \`ref-max\` isn't a number: ${val}`);
                            }
                        }
                    }

                    // Check if step is a query selector
                    const refStep = $target.attr("ref-step");
                    if (refStep !== undefined) {
                        // Validate reference
                        if (validateInputs($(refStep), false)) {
                            const val = $(refStep).val();
                            if (typeof val === "number") {
                                $target.attr("step", val);
                            } else {
                                console.error(`Value referenced by \`ref-step\` isn't a number: ${val}`);
                            }
                        }
                    }

                    // Check if minimum length is a query selector
                    const refLmin = $target.attr("ref-lmin");
                    if (refLmin !== undefined) {
                        // Validate reference
                        if (validateInputs($(refLmin), false)) {
                            const val = $(refLmin).val();
                            if (typeof val === "number") {
                                $target.attr("lmin", val);
                            } else {
                                console.error(`Value referenced by \`ref-lmin\` isn't a number: ${val}`);
                            }
                        }
                    }

                    // Check if maximum length is a query selector
                    const refLmax = $target.attr("ref-lmax");
                    if (refLmax !== undefined) {
                        // Validate reference
                        if (validateInputs($(refLmax), false)) {
                            const val = $(refLmax).val();
                            if (typeof val === "number") {
                                $target.attr("lmax", val);
                            } else {
                                console.error(`Value referenced by \`ref-lmax\` isn't a number: ${val}`);
                            }
                        }
                    }
                }

                const min = Number($target.attr("min") ?? -Infinity);
                const max = Number($target.attr("max") ?? Infinity);
                const step = Number($target.attr("step") ?? 1);
                const lmin = Number($target.attr("lmin") ?? 0);
                const lmax = Number($target.attr("lmax") ?? Infinity);

                // Manual tests
                (() => {
                    const values = ($target.val() as string).replace(/ /g, "").split(",");

                    // Too few numbers
                    if (values.length < lmin) {
                        target.setCustomValidity("lengthUnderflow");
                        return;
                    }

                    // Too many numbers
                    if (values.length > lmax) {
                        target.setCustomValidity("lengthOverflow");
                        return;
                    }

                    for (const value of values) {
                        // Invalid
                        if (value === "" || Number.isNaN(Number(value))) {
                            target.setCustomValidity("badInput");
                            return;
                        }

                        // Too small
                        if (Number(value) < min) {
                            target.setCustomValidity("underflow");
                            return;
                        }

                        // Too big
                        if (Number(value) > max) {
                            target.setCustomValidity("overflow");
                            return;
                        }

                        // Step mismatch
                        if (Number(value) % step !== 0) {
                            target.setCustomValidity("stepMismatch");
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
                            alertError($target, new alerts.AlertNumbersMissing());
                        } else if (message === "badInput") {
                            alertError($target, new alerts.AlertNumbersBadInput());
                        }

                        else if (message === "lengthUnderflow") {
                            alertError($target, new alerts.AlertNumbersLengthUnderflow(lmin));
                        } else if (message === "lengthOverflow") {
                            alertError($target, new alerts.AlertNumbersLengthOverflow(lmax));
                        }

                        else if (message === "underflow") {
                            alertError($target, new alerts.AlertNumbersUnderflow(min));
                        } else if (message === "overflow") {
                            alertError($target, new alerts.AlertNumbersOverflow(max));
                        }

                        else if (message === "stepMismatch") {
                            alertError($target, new alerts.AlertNumbersStepMismatch(step));
                        }

                        else {
                            alertError($target, new alerts.AlertCustom(message));
                        }
                    }
                }
            }
        }

        if (isTargetValid) {
            $target.parent("label").next("span.alert").remove(); // Remove previous alert
        }
    }

    return allValid;
}


/**
 * Places an alert after an `<input>`.
 * @param $target The `<input>`.
 * @param alert The alert.
 */
function alertError($target: JQuery, alert: Alert) {
    // Use the alert text if provided
    // Otherwise pass the arguments to the default alert text function if it exists
    // Otherwise use a generic text
    const alertText = $target.attr(alert.identifier) ?? alert.message();

    $target.parent("label").next("span.alert").remove(); // Remove previous alert if one exists
    $target.parent("label").after(`<span class="alert ${alert.identifier}">${alertText}</span>`); // Place alert
}


/**
 * Downloads a file.
 * @param content The content of the file.
 * @param filename The name of the file, including the file extension.
 */
export function downloadFile(content: string, filename: string) {
    const blob = new Blob([content]);
    const url = URL.createObjectURL(blob);
    ($("<a></a>").attr("download", filename).attr("href", url)[0] as HTMLElement).click();
    URL.revokeObjectURL(url);
}


/**
 * Shows/hides the corner box and the "show corner box" button, and stores to {@linkcode localStorage}.
 * @param visible Whether the corner box is visible or not.
 */
function updateCornerBoxVisibility(visible: boolean) {
    $("section#corner-box").toggle(visible);
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
    const sections = $("main > section").map(function () {
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
                cornerBoxHTML += `<br>`
            }
            cornerBoxHTML += `<a href="#${section.id}">${section.title}</a>`;
        });
        cornerBoxHTML += "</details>";
    }

    // Place corner box into DOM
    $("section#corner-box").html(cornerBoxHTML);
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
