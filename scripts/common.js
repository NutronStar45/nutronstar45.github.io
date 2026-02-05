let siteVer = "3.2";


let defaultAlerts = {
    invalidInput: () => "Invalid/Empty",
    small: min => `Should be at least ${min}`,
    big: max => `Should be at most ${max}`,
    short: lmin => `Length should be at least ${lmin}`,
    long: lmax => `Length should be at most ${lmax}`
};


/**
 * Creates an element with the SVG namespace.
 * @param {string} name The tag name of the element.
 * @returns {jQuery} The jQuery element with SVG namespace.
 */
function svgElement(name) {
    return $(document.createElementNS("http://www.w3.org/2000/svg", name));
}


/**
 * Validates one or more `<input>`s and returns `true` if all inputs are valid. References to other inputs are validated but no alert is placed after, because those inputs are assumed to already be validated on their own.
 * @param {(string | jQuery)[]} targets Targets for validation, contains query selectors and/or `jQuery` objects.
 * @param {boolean} alert Whether to put an alert after invalid inputs or not. Defaults to `true`.
 * @returns {boolean} Whether `targets` are valid or not.
 */
function validate(targets, alert=true) {
    let allValid = true;

    for (let target of targets) {
        let isTargetValid = true;

        if (typeof target === "string") {
            target = $(target);
        }

        if (target.is("[type=number]")) {
            // Invalid/empty
            if (target.val() === "") {
                if (target.prop("required")) {
                    if (alert) alertError(target.parent(), "invalidInput");
                    isTargetValid = allValid = false;
                }
                continue;
            } else {
                let min = -Infinity;
                let max = Infinity;

                // Calculate minimum
                // Check if minimum is a query selector
                if (isNaN(target.prop("min"))) {
                    // Validate reference
                    if (validate([target.prop("min")], false)) {
                        min = +$(target.prop("min")).val();
                    }
                }
                // Check if minimum exists
                else if (target.prop("min") !== "") {
                    min = +target.prop("min");
                }

                // Calculate maximum
                // Check if maximum is a query selector
                if (isNaN(target.prop("max"))) {
                    // Validate reference
                    if (validate([target.prop("max")], false)) {
                        max = +$(target.prop("max")).val();
                    }
                }
                // Check if maximum exists
                else if (target.prop("max") !== "") {
                    max = +target.prop("max");
                }

                // Too small
                if (+target.val() < min) {
                    if (alert) alertError(target.parent(), "small", min);
                    isTargetValid = allValid = false;
                    continue;
                }

                // Too big
                if (+target.val() > max) {
                    if (alert) alertError(target.parent(), "big", max);
                    isTargetValid = allValid = false;
                    continue;
                }
            }
        }

        if (target.is("[type=text]")) {
            // Custom type: numbers separated by commas, whitespaces are ignored
            // `min` and `max` are the restrictions on each number
            // `lmin` and `lmax` are the restrictions on the number of numbers
            if (target.is("[ctype=numbers]")) {
                let values = target.val().replace(/ /g, "").split(",");
                let min = -Infinity;
                let max = Infinity;
                let lmin = 0;
                let lmax = Infinity;

                // Calculate minimum
                // Check if minimum is a query selector
                if (isNaN(target.attr("min"))) {
                    // Validate minimum
                    if (validate([target.attr("min")], false)) {
                        min = +$(target.attr("min")).val();
                    }
                }
                // Check if minimum exists
                else if (target.attr("min") !== "" && target.attr("min") !== undefined) {
                    min = +target.attr("min");
                }

                // Calculate maximum
                // Check if maximum is a query selector
                if (isNaN(target.attr("max"))) {
                    // Validate maximum
                    if (validate([target.attr("max")], false)) {
                        max = +$(target.attr("max")).val();
                    }
                }
                // Check if maximum exists
                else if (target.attr("max") !== "" && target.attr("max") !== undefined) {
                    max = +target.attr("max");
                }

                // Calculate minimum length
                // Check if minimum length is a query selector
                if (isNaN(target.attr("lmin"))) {
                    // Validate minimum length
                    if (validate([target.attr("lmin")], false)) {
                        lmin = +$(target.attr("lmin")).val();
                    }
                }
                // Check if minimum length exists
                else if (target.attr("lmin") !== "" && target.attr("lmin") !== undefined) {
                    lmin = +target.attr("lmin");
                }

                // Calculate maximum length
                if (isNaN(target.attr("lmax"))) {
                    // Validate maximum length
                    if (validate([target.attr("lmax")], false)) {
                        lmax = +$(target.attr("lmax")).val();
                    }
                }
                // Check if maximum length exists
                else if (target.attr("lmax") !== "" && target.attr("lmax") !== undefined) {
                    lmax = +target.attr("lmax");
                }

                // Too short
                if (values.length < lmin) {
                    if (alert) alertError(target.parent(), "short", lmin);
                    isTargetValid = allValid = false;
                    continue;
                }

                // Too long
                if (values.length > lmax) {
                    if (alert) alertError(target.parent(), "long", lmax);
                    isTargetValid = allValid = false;
                    continue;
                }

                for (let value of values) {
                    // Invalid
                    if (value === "" || isNaN(value)) {
                        if (alert) alertError(target.parent(), "invalidInput");
                        isTargetValid = allValid = false;
                        break;
                    }

                    // Too small
                    if (+value < min) {
                        if (alert) alertError(target.parent(), "small", min);
                        isTargetValid = allValid = false;
                        break;
                    }

                    // Too big
                    if (+value > max) {
                        if (alert) alertError(target.parent(), "big", max);
                        isTargetValid = allValid = false;
                        break;
                    }
                }
            }
        }

        if (isTargetValid) {
            target.parent().next("span.alert").remove(); // Remove previous alert
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
    let alertText = target.attr("alert-" + type) ?? defaultAlerts[type](args) ?? "Error";

    target.next("span.alert").remove(); // Remove previous alert if one exists
    target.after(`<span class="alert">${alertText}</span>`); // Place alert
}


$(() => {
    // Location on 404 page
    $("h3#404-location").html(
        `The page <code>${location.pathname}</code> doesn't exist`
    );

    /**
     * Sections information.
     * @type {{ title: string, id: string }[]}
     */
    let sections = [];

    // Fetch sections
    $("div.section").each(function () {
        sections.push({
            title: $(this).children("span").text(),
            id: $(this).prop("id"),
        });
    });

    let fixedToolbar = `<a href="#">To top</a><br><span>Version ${siteVer}</span>`;

    // Section links
    if (sections.length > 0) {
        fixedToolbar += '<br><button class="coll">Sections</button><div>';
        $.each(sections, function (i, section) {
            fixedToolbar += `<a href="#${section.id}">${section.title}</a>`;
            if (i < sections.length - 1) {
                fixedToolbar += `<br>`
            }
        });
        fixedToolbar += "</div>";
    }

    let nav = '<a href="/">Home</a><a href="/projs">Projects</a>';

    // Header
    $("div#header").html(nav);

    // Sticky corner box
    $("div#corner-box").html(fixedToolbar);

    // Required indicator
    $("input[required]").before('<span class="required-ind">* </span>');

    // Collapsible
    $("button.coll").on("click", function () {
        $(this).toggleClass("opened");
    });
});
