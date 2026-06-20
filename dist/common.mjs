import $ from "jquery";
import {} from "./alerts.mjs";
import * as alerts from "./alerts.mjs";
// The page width at which the navigation is hidden by default
const NAV_HIDDEN_PAGE_WIDTH = "700px";
// Whether navigation is forced hidden
let navForcedHidden = false;
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
 * @returns Whether all {@linkcode $targets} are valid or not.
 */
export function validateInputs($targets, alert = true) {
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
                    if (validateInputs($(refMax), false)) {
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
                    if (validateInputs($(refStep)), false) {
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
            const min = Number($target.attr("min") ?? -Infinity);
            const max = Number($target.attr("max") ?? Infinity);
            const step = Number($target.attr("step") ?? 1);
            const validity = target.validity;
            const message = target.validationMessage;
            if (!validity.valid) {
                isTargetValid = allValid = false;
                if (alert) {
                    if (validity.valueMissing) {
                        alertError($target, new alerts.AlertNumberMissing());
                    }
                    else if (validity.badInput) {
                        alertError($target, new alerts.AlertNumberBadInput());
                    }
                    else if (validity.rangeUnderflow) {
                        alertError($target, new alerts.AlertNumberUnderflow(min));
                    }
                    else if (validity.rangeOverflow) {
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
                        if (validateInputs($(refMax), false)) {
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
                        if (validateInputs($(refStep), false)) {
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
                        if (validateInputs($(refLmin), false)) {
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
                        if (validateInputs($(refLmax), false)) {
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
                const min = Number($target.attr("min") ?? -Infinity);
                const max = Number($target.attr("max") ?? Infinity);
                const step = Number($target.attr("step") ?? 1);
                const lmin = Number($target.attr("lmin") ?? 0);
                const lmax = Number($target.attr("lmax") ?? Infinity);
                // Manual tests
                (() => {
                    const values = $target.val().replace(/ /g, "").split(",");
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
                        }
                        else if (message === "badInput") {
                            alertError($target, new alerts.AlertNumbersBadInput());
                        }
                        else if (message === "lengthUnderflow") {
                            alertError($target, new alerts.AlertNumbersLengthUnderflow(lmin));
                        }
                        else if (message === "lengthOverflow") {
                            alertError($target, new alerts.AlertNumbersLengthOverflow(lmax));
                        }
                        else if (message === "underflow") {
                            alertError($target, new alerts.AlertNumbersUnderflow(min));
                        }
                        else if (message === "overflow") {
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
function alertError($target, alert) {
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
export function downloadFile(content, filename) {
    const blob = new Blob([content]);
    const url = URL.createObjectURL(blob);
    $("<a></a>").attr("download", filename).attr("href", url)[0].click();
    URL.revokeObjectURL(url);
}
/** Populate the header. */
function fillHeader() {
    // Header
    const headerHTML = '<button id="nav-toggle" class="img-button" title="Toggle navigation"><div></div></button><a href="/">NutronStar45\'s Work</a>';
    $("header").html(headerHTML);
}
/** Populate the navigation. */
function fillNav() {
    // Fetch sections
    const sections = $("main > section").map(function () {
        const title = $(this).children("h3").text();
        const id = $(this).attr("id");
        if (id === undefined) {
            console.error(`Section with title ${title} doesn't have an ID`);
        }
        return { title, id: id ?? "" };
    }).get();
    // Navigation
    let navHTML = '<a href="#">Top</a><hr>'
        + '<section><h3>Links</h3>'
        + '<ul><li><a href="/projects.html">Projects</a></li>'
        + '<li><a href="/math.html">Math</a></li></ul></section>';
    // Generate section links
    if (sections.length > 0) {
        navHTML += "<hr><section><h3>Sections</h3><ul>";
        for (const section of sections) {
            navHTML += `<li><a href="#${section.id}">${section.title}</a></li>`;
        }
        navHTML += "</ul></section>";
    }
    $("nav").html(navHTML);
}
/** Handles navigation visibility. */
function handleNavVisibility() {
    $("nav").toggleClass("force-hidden", navForcedHidden);
    // Handle navigation toggle
    const smallWidth = matchMedia(`(max-width: ${NAV_HIDDEN_PAGE_WIDTH})`);
    $("button#nav-toggle").on("click", () => {
        if (smallWidth.matches) {
            $("nav").toggleClass("force-hidden", false);
            $("nav").toggleClass("force-shown");
            $("div#main-overlay").toggleClass("active");
            $("div#main-wrapper").prop("inert", !$("div#main-wrapper").prop("inert"));
            localStorage.setItem("navForcedHidden", String(false));
        }
        else {
            $("nav").toggleClass("force-hidden");
            localStorage.setItem("navForcedHidden", String($("nav").hasClass("force-hidden")));
        }
    });
    // Handle width change
    smallWidth.addEventListener("change", () => {
        $("nav").toggleClass("force-shown", false);
        $("div#main-overlay").toggleClass("active", false);
        $("div#main-wrapper").prop("inert", false);
    });
}
$(() => {
    navForcedHidden = localStorage.getItem("navForcedHidden") === "true";
    // Location on 404 page
    // `slice(1)` to trim the beginning slash
    $("code#404-location").html(location.pathname.slice(1));
    // Required indicators
    $("input[required]")
        .before('<span class="required-ind">* </span>')
        .parent("label")
        .attr("title", "Required");
    fillHeader();
    fillNav();
    handleNavVisibility();
});
