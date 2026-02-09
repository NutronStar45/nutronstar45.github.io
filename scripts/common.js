const DEFAULT_ALERTS = {
    numberMissing: _args => "A number should be entered",
    numberBadInput: _args => "A number should be entered",
    numberUnderflow: args => `Number should be at least ${args.min}`,
    numberOverflow: args => `Number should be at most ${args.max}`,
    numberStepMismatch: args => {
        if (+args.step === 1) {
            return `Number should be an integer`;
        } else {
            return `Number should be a multiple of ${args.step}`;
        }
    },

    numbersMissing: _args => "Number(s) should be entered",
    numbersBadInput: _args => "Number(s) should be entered",
    numbersLengthUnderflow: args => `At least ${args.lmin} numbers should be given`,
    numbersLengthOverflow: args => `At most ${args.lmax} numbers should be given`,
    numbersUnderflow: args => `Number(s) should be at least ${args.min}`,
    numbersOverflow: args => `Number(s) should be at most ${args.max}`,
    numbersStepMismatch: args => {
        if (+args.step === 1) {
            return `Number(s) should be an integer`;
        } else {
            return `Number(s) should be multiple(s) of ${args.step}`;
        }
    },

    custom: args => args.text
};


/**
 * Creates an element with the SVG namespace.
 * This function is necessary because all SVG elements must be namespaced.
 * @param {string} name The tag name of the element.
 * @returns {jQuery} The jQuery element with SVG namespace.
 */
function svgElement(name) {
    return $(document.createElementNS("http://www.w3.org/2000/svg", name));
}


/**
 * Validates one or more `<input>`s and returns `true` if all inputs are valid. References to other inputs are validated but no alert is placed after, because those inputs are assumed to already be validated on their own.
 * @param {jQuery} $targets Targets for validation; a jQuery object that may refer to multiple elements.
 * @param {boolean} alert Whether to put an alert after invalid inputs or not. Defaults to `true`.
 * @returns {boolean} Whether `targets` are valid or not.
 */
function validate($targets, alert=true) {
    let allValid = true;

    for (const target of $targets) {
        const $target = $(target);
        const $label = $target.parent("label");
        let isTargetValid = true;

        if ($target.is("[type=number]")) {
            // Check references
            {
                // Check if minimum is a query selector
                if ($target.attr("ref-min") !== undefined) {
                    // Validate reference
                    if (validate($($target.attr("ref-min")), false)) {
                        $target.attr("min", $($target.attr("ref-min")).val());
                    }
                }

                // Check if maximum is a query selector
                if ($target.attr("ref-max") !== undefined) {
                    // Validate reference
                    if (validate($($target.attr("ref-max")), false)) {
                        $target.attr("max", $($target.attr("ref-max")).val());
                    }
                }

                // Check if step is a query selector
                if ($target.attr("ref-step") !== undefined) {
                    // Validate reference
                    if (validate($($target.attr("ref-step")), false)) {
                        $target.attr("step", $($target.attr("ref-step")).val());
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
                    } else if (validity.badInput) {
                        alertError($label, "numberBadInput");
                    }

                    else if (validity.rangeUnderflow) {
                        alertError($label, "numberUnderflow", { min });
                    } else if (validity.rangeOverflow) {
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
                    if ($target.attr("ref-min") !== undefined) {
                        // Validate reference
                        if (validate($($target.attr("ref-min")), false)) {
                            $target.attr("min", $($target.attr("ref-min")).val());
                        }
                    }

                    // Check if maximum is a query selector
                    if ($target.attr("ref-max") !== undefined) {
                        // Validate reference
                        if (validate($($target.attr("ref-max")), false)) {
                            $target.attr("max", $($target.attr("ref-max")).val());
                        }
                    }

                    // Check if step is a query selector
                    if ($target.attr("ref-step") !== undefined) {
                        // Validate reference
                        if (validate($($target.attr("ref-step")), false)) {
                            $target.attr("step", $($target.attr("ref-step")).val());
                        }
                    }

                    // Check if minimum length is a query selector
                    if ($target.attr("ref-lmin") !== undefined) {
                        // Validate reference
                        if (validate($($target.attr("ref-lmin")), false)) {
                            $target.attr("lmin", $($target.attr("ref-lmin")).val());
                        }
                    }

                    // Check if maximum length is a query selector
                    if ($target.attr("ref-lmax") !== undefined) {
                        // Validate reference
                        if (validate($($target.attr("ref-lmax")), false)) {
                            $target.attr("lmax", $($target.attr("ref-lmax")).val());
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
                        if (value === "" || isNaN(value)) {
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
                        } else if (message === "numbersBadInput") {
                            alertError($label, "numbersBadInput");
                        }

                        else if (message === "numbersLengthUnderflow") {
                            alertError($label, "numbersLengthUnderflow", { lmin });
                        } else if (message === "numbersLengthOverflow") {
                            alertError($label, "numbersLengthOverflow", { lmax });
                        }

                        else if (message === "numbersUnderflow") {
                            alertError($label, "numbersUnderflow", { min });
                        } else if (message === "numbersOverflow") {
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
 * @param {jQuery} $target The element.
 * @param {string} type The type of the alert.
 * @param {object} args Arguments that gets passed into the function which generates the alert. Defaults to an empty object.
 */
function alertError($target, type, args={}) {
    // Use the alert text if provided
    // Otherwise pass the arguments to the default alert text function if it exists
    // Otherwise use a generic text
    const alertText = $target.attr("alert-" + type) ?? DEFAULT_ALERTS[type](args) ?? "Error";

    $target.next("span.alert").remove(); // Remove previous alert if one exists
    $target.after(`<span class="alert alert-${type}">${alertText}</span>`); // Place alert
}


/**
 * Downloads a file.
 * @param {string} content The content of the file.
 * @param {string} filename The name of the file, including the file extension.
 */
function downloadFile(content, filename) {
    const blob = new Blob([content]);
    const url = URL.createObjectURL(blob);
    $("<a></a>").attr("download", filename).attr("href", url)[0].click();
    URL.revokeObjectURL(url);
}


/**
 * Shows/hides the corner box and the "show corner box" button, and stores to `localStorage`.
 * @param {boolean} visible Whether the corner box is visible or not.
 */
function updateCornerBoxVisibility(visible) {
    $("div#corner-box").toggle(visible);
    $("button#show-corner-box").toggle(!visible);
    localStorage.setItem("cornerBoxVisible", visible);
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

    /**
     * Sections information.
     * @type {{ title: string, id: string }[]}
     */
    const sections = $("section").map(function () {
        return {
            title: $(this).children("h3").text(),
            id: $(this).attr("id"),
        };
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
