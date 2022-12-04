let commitVer = "2.15.0.5";


let alerts = {
  invalid: "Invalid/Empty",
  small: "Too small",
  big: "Too big",
  short: "Too short",
  long: "Too long"
};


/**
 * Choose a pseudorandom element from the array
 * @returns A random element from the array
 */
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};


/**
 * Remove the first occurrence of `value` in an array
 * @param {*} value The value to remove from the array
 */
Array.prototype.remove = function (value) {
  if (this.includes(value))
    this.splice(this.indexOf(value), 1);
};


let round = Math.round;
/**
 * Rounds a number to a specific precision
 * @param {number} x The number to be rounded
 * @param {number} precision Number of decimal places
 * @returns {number} The rounded value
 */
Math.round = function (x, precision = 0) {
  return round(x * Math.pow(10, precision)) / Math.pow(10, precision);
};


/**
 * Creates an element with SVG namespace
 * @param {string} name The name of the tag
 * @returns {$} The element with SVG namespace in JQuery
 */
function svgNS(name) {
  return $(document.createElementNS("http://www.w3.org/2000/svg", name));
}


/**
 * Validates one or more `<input>`s and returns the validity
 * @param {(string | $)[]} targets The validation targets
 * @param {boolean} alert Whether to alert invalid input or not, defaults to true
 * @returns {boolean} Whether `targets` are valid or not
 */
function validate(targets, alert = true) {
  let validity = true;

  for (let target of targets) {
    if (typeof target === "string") {
      target = $(target);
    }

    if (target.is("[type=number]")) {
      // Invalid/empty
      if (target.val() === "") {
        if (target.prop("required")) {
          alertInvalid(target, "invalid", alert);
          validity = false;
        }
        continue;
      } else {
        let min = -Infinity, max = Infinity;

        // Calculate min
        if (isNaN(target.prop("min"))) {
          if (validate([target.prop("min")], false))
            min = +$(target.prop("min")).val();
        } else if (target.prop("min") !== "") {
          min = +target.prop("min");
        }

        // Calculate max
        if (isNaN(target.prop("max"))) {
          if (validate([target.prop("max")], false))
            max = +$(target.prop("max")).val();
        } else if (target.prop("max") !== "") {
          max = +target.prop("max");
        }

        // Too small
        if (+target.val() < min) {
          alertInvalid(target, "small", alert);
          validity = false;
          continue;
        }

        // Too big
        if (+target.val() > max) {
          alertInvalid(target, "big", alert);
          validity = false;
          continue;
        }
      }
    }

    if (target.is("[type=text]")) {
      if (target.is("[ctype=numbers]")) {
        let values = target.val().replace(/ /g, "").split(",");
        let min = -Infinity, max = Infinity, lmin = 0, lmax = Infinity

        // Calculate min
        if (isNaN(target.attr("min"))) {
          if (validate([target.attr("min")], false))
            min = +$(target.attr("min")).val();
        } else if (target.attr("min") !== "" && target.attr("min") !== undefined) {
          min = +target.attr("min");
        }

        // Calculate max
        if (isNaN(target.attr("max"))) {
          if (validate([target.attr("max")], false))
            max = +$(target.attr("max")).val();
        } else if (target.attr("max") !== "" && target.attr("max") !== undefined) {
          max = +target.attr("max");
        }

        // Calculate min length
        if (isNaN(target.attr("lmin"))) {
          if (validate([target.attr("lmin")], false))
            lmin = +$(target.attr("lmin")).val();
        } else if (target.attr("lmin") !== "" && target.attr("lmin") !== undefined) {
          lmin = +target.attr("lmin");
        }

        // Calculate max length
        if (isNaN(target.attr("lmax"))) {
          if (validate([target.attr("lmax")], false))
            lmax = +$(target.attr("lmax")).val();
        } else if (target.attr("lmax") !== "" && target.attr("lmax") !== undefined) {
          lmax = +target.attr("lmax");
        }

        // Too short
        if (values.length < lmin) {
          alertInvalid(target, "short", alert);
          validity = false;
          continue;
        }

        // Too long
        if (values.length > lmax) {
          alertInvalid(target, "long", alert);
          validity = false;
          continue;
        }

        for (let value of values) {
          // Invalid
          if (value === "" || isNaN(value)) {
            alertInvalid(target, "invalid", alert);
            validity = false;
            break;
          }

          // Too small
          if (+value < min) {
            alertInvalid(target, "small", alert);
            validity = false;
            break;
          }

          // Too big
          if (+value > max) {
            alertInvalid(target, "big", alert);
            validity = false;
            break;
          }
        }
      }
    }

    target.parent().next("span.invalid-input").remove(); // Remove potential alert
  }

  return validity;
}


/**
 * Place alert after `<input>`
 * @param {$} target The invalid `<input>`
 * @param {string} type The type of the invalidity
 * @param {boolean} alert Whether to alert or not
 */
function alertInvalid(target, type, alert) {
  if (alert) {
    target.parent().next("span.invalid-input").remove();
    target.parent().after(
      `<span class="invalid-input">${
        target.attr("alert-" + type)
          ? target.attr("alert-" + type) // Use the alert text if provided
          : alerts[type] // Default alert text
      }</span>`
    );
  }
}


$(() => {
  // Location in 404 page
  $("h3#404-location").html(
    `The page <code>${location.pathname}</code> doens't exist`
  );

  let sections = [];

  // Sections
  $("body div:is(.section, .non-text-section)").each(function () {
    sections.push({
      title: $(this).children("p.section-title").text(),
      id: $(this).prop("id"),
    });
  });

  // Fixed toolbar
  let fixedToolbar = `<a href="#">To top</a><br><span>Commit ${commitVer}</span>`;

  if (sections.length > 0) {
    fixedToolbar += '<br><button class="coll">Sections</button><div>';

    $.each(sections, function (i, section) {
      fixedToolbar += `<a href="#${section.id}">${section.title}</a>${
        i < (sections.length - 1) ? "<br>" : ""
      }`;
    });
    fixedToolbar += "</div>";
  }

  let nav = `<svg width="1000" height="50">
  <!-- Homepage icon -->
  <a xlink:href="/">
    <rect width="50" height="50" style="fill:black" />
    <polyline points="5,25 25,5 45,25" style="fill:none;stroke:#7f7f7f;stroke-width:3;" />
    <rect y="25" width="50" height="25" style="black" />
    <polyline points="12,25 12,45 38,45 38,25" style="fill:none;stroke:#7f7f7f;stroke-width:3;" />
  </a>
  <!-- Projects -->
  <a xlink:href="/projs">
    <text x="100" y="30" fill="white">Projects</text>
  </a>
  <!-- Gallery -->
  <a xlink:href="/gallery">
    <text x="200" y="30" fill="white">Gallery</text>
  </a>
</svg>`;

  // Toolbar
  $("div#toolbar").html(nav + `<div id="fixed-toolbar">${fixedToolbar}</div>`);

  // Required indicator
  $("input[required]").before('<span class="required-ind">* </span>');

  // Collapsible
  $("button.coll").click(function () {
    $(this).toggleClass("opened");
  });
});
