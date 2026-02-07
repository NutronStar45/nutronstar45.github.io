const SITE_VERSION = "3.4";


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
 * @param {jQuery} targets Targets for validation; a jQuery object that may refer to multiple elements.
 * @param {boolean} alert Whether to put an alert after invalid inputs or not. Defaults to `true`.
 * @returns {boolean} Whether `targets` are valid or not.
 */
function validate(targets, alert=true) {
    let allValid = true;

    for (const target of targets) {
        const targetJQuery = $(target);
        const labelJQuery = targetJQuery.parent("label");
        let isTargetValid = true;

        if (targetJQuery.is("[type=number]")) {
            // Check references
            {
                // Check if minimum is a query selector
                if (targetJQuery.attr("ref-min") !== undefined) {
                    // Validate reference
                    if (validate($(targetJQuery.attr("ref-min")), false)) {
                        targetJQuery.attr("min", $(targetJQuery.attr("ref-min")).val());
                    }
                }

                // Check if maximum is a query selector
                if (targetJQuery.attr("ref-max") !== undefined) {
                    // Validate reference
                    if (validate($(targetJQuery.attr("ref-max")), false)) {
                        targetJQuery.attr("max", $(targetJQuery.attr("ref-max")).val());
                    }
                }

                // Check if step is a query selector
                if (targetJQuery.attr("ref-step") !== undefined) {
                    // Validate reference
                    if (validate($(targetJQuery.attr("ref-step")), false)) {
                        targetJQuery.attr("step", $(targetJQuery.attr("ref-step")).val());
                    }
                }
            }

            const min = +(targetJQuery.attr("min") ?? -Infinity);
            const max = +(targetJQuery.attr("max") ?? Infinity);
            const step = +(targetJQuery.attr("step") ?? 1);

            const validity = target.validity;
            if (!validity.valid) {
                isTargetValid = allValid = false;

                if (alert) {
                    if (validity.valueMissing) {
                        alertError(labelJQuery, "numberMissing");
                    } else if (validity.badInput) {
                        alertError(labelJQuery, "numberBadInput");
                    }

                    else if (validity.rangeUnderflow) {
                        alertError(labelJQuery, "numberUnderflow", { min });
                    } else if (validity.rangeOverflow) {
                        alertError(labelJQuery, "numberOverflow", { max });
                    }

                    else if (validity.stepMismatch) {
                        alertError(labelJQuery, "numberStepMismatch", { step });
                    }

                    else {
                        alertError(labelJQuery, "custom", { text: target.validationMessage });
                    }
                }
            }
        }

        if (targetJQuery.is("[type=text]")) {
            // Custom type: numbers separated by commas, whitespaces are ignored
            // `min` and `max` are the restrictions on each number
            // `lmin` and `lmax` are the restrictions on the number (length) of numbers
            if (targetJQuery.is("[ctype=numbers]")) {
                // Check references
                {
                    // Check if minimum is a query selector
                    if (targetJQuery.attr("ref-min") !== undefined) {
                        // Validate reference
                        if (validate($(targetJQuery.attr("ref-min")), false)) {
                            targetJQuery.attr("min", $(targetJQuery.attr("ref-min")).val());
                        }
                    }

                    // Check if maximum is a query selector
                    if (targetJQuery.attr("ref-max") !== undefined) {
                        // Validate reference
                        if (validate($(targetJQuery.attr("ref-max")), false)) {
                            targetJQuery.attr("max", $(targetJQuery.attr("ref-max")).val());
                        }
                    }

                    // Check if step is a query selector
                    if (targetJQuery.attr("ref-step") !== undefined) {
                        // Validate reference
                        if (validate($(targetJQuery.attr("ref-step")), false)) {
                            targetJQuery.attr("step", $(targetJQuery.attr("ref-step")).val());
                        }
                    }

                    // Check if minimum length is a query selector
                    if (targetJQuery.attr("ref-lmin") !== undefined) {
                        // Validate reference
                        if (validate($(targetJQuery.attr("ref-lmin")), false)) {
                            targetJQuery.attr("lmin", $(targetJQuery.attr("ref-lmin")).val());
                        }
                    }

                    // Check if maximum length is a query selector
                    if (targetJQuery.attr("ref-lmax") !== undefined) {
                        // Validate reference
                        if (validate($(targetJQuery.attr("ref-lmax")), false)) {
                            targetJQuery.attr("lmax", $(targetJQuery.attr("ref-lmax")).val());
                        }
                    }
                }

                const min = +(targetJQuery.attr("min") ?? -Infinity);
                const max = +(targetJQuery.attr("max") ?? Infinity);
                const step = +(targetJQuery.attr("step") ?? 1);
                const lmin = +(targetJQuery.attr("lmin") ?? 0);
                const lmax = +(targetJQuery.attr("lmax") ?? Infinity);

                // Manual tests
                (() => {
                    const values = targetJQuery.val().replace(/ /g, "").split(",");

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
                            alertError(labelJQuery, "numbersMissing");
                        } else if (message === "numbersBadInput") {
                            alertError(labelJQuery, "numbersBadInput");
                        }

                        else if (message === "numbersLengthUnderflow") {
                            alertError(labelJQuery, "numbersLengthUnderflow", { lmin });
                        } else if (message === "numbersLengthOverflow") {
                            alertError(labelJQuery, "numbersLengthOverflow", { lmax });
                        }

                        else if (message === "numbersUnderflow") {
                            alertError(labelJQuery, "numbersUnderflow", { min });
                        } else if (message === "numbersOverflow") {
                            alertError(labelJQuery, "numbersOverflow", { max });
                        }

                        else if (message === "numbersStepMismatch") {
                            alertError(labelJQuery, "numbersStepMismatch", { step });
                        }

                        else {
                            alertError(labelJQuery, "custom", { text: message });
                        }
                    }
                }
            }
        }

        if (isTargetValid) {
            labelJQuery.next("span.alert").remove(); // Remove previous alert
        }
    }

    return allValid;
}


/**
 * Places an alert after an element.
 * @param {jQuery} target The element.
 * @param {string} type The type of the alert.
 * @param {object} args Arguments that gets passed into the function which generates the alert. Defaults to an empty object.
 */
function alertError(target, type, args={}) {
    // Use the alert text if provided
    // Otherwise pass the arguments to the default alert text function if it exists
    // Otherwise use a generic text
    const alertText = target.attr("alert-" + type) ?? DEFAULT_ALERTS[type](args) ?? "Error";

    target.next("span.alert").remove(); // Remove previous alert if one exists
    target.after(`<span class="alert alert-${type}">${alertText}</span>`); // Place alert
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


$(() => {
    // Location on 404 page
    $("h3#404-location").html(
        `The page <code>${location.pathname}</code> doesn't exist`
    );

    // Header
    const header = '<a href="/">Home</a><a href="/projs">Projects</a>';
    $("div#header").html(header);

    /**
     * Sections information.
     * @type {{ title: string, id: string }[]}
     */
    const sections = $("div.section").map(function () {
        return {
            title: $(this).children("span:first-child").text(),
            id: $(this).attr("id"),
        };
    }).get();

    // Sticky corner box
    let cornerBox = `<a href="#">To top</a><br><span>Version ${SITE_VERSION}</span>`;

    // Section links
    if (sections.length > 0) {
        cornerBox += '<br><button class="coll">Sections</button><div>';
        $.each(sections, function (i, section) {
            cornerBox += `<a href="#${section.id}">${section.title}</a>`;
            if (i < sections.length - 1) {
                cornerBox += `<br>`
            }
        });
        cornerBox += "</div>";
    }

    $("div#corner-box").html(cornerBox);

    // Required indicator
    $("input[required]")
        .before('<span class="required-ind">* </span>')
        .parent("label")
        .attr("title", "Required");

    // Collapsible
    $("button.coll").on("click", function () {
        $(this).toggleClass("opened");
    });
});
