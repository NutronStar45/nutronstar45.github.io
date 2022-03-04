/**
 * Validates one or more `<input>`s and returns the validity.
 * @param {(string | $)[]} targets The validation targets.
 * @param {boolean} alert Whether to alert invalid input or not, defaults to true.
 * @returns Whether `targets` are valid or not.
 */
function validate(targets, alert = true) {
  for (let i = 0; i < targets.length; i++) {
    let target = targets[i];

    if (typeof target === 'string') {
      target = $(target);
    }

    if (target.prop('type') === 'number') {
      // Invalid/empty
      if (target.val() === '') {
        alertInvalid(target, 'alert-invalid', 'Invalid/Empty', alert);
        return false;
      } else {
        let min, max;

        // Calculate min
        if (isNaN(target.prop('min'))) {
          if (validate([target.prop('min')], false)) {
            min = +$(target.prop('min')).val();
          } else {
            min = -Infinity; // To avoid alerting
          }
        } else {
          min = +target.prop('min');
        }

        // Calculate max
        if (isNaN(target.prop('max'))) {
          if (validate([target.prop('max')], false)) {
            max = +$(target.prop('max')).val();
          } else {
            max = Infinity; // To avoid alerting
          }
        } else {
          max = +target.prop('max');
        }

        // Too small
        if (+target.val() < min) {
          alertInvalid(target, 'alert-small', 'Number too small', alert);
          return false;
        }
        // Too big
        if (+target.val() > max) {
          alertInvalid(target, 'alert-big', 'Number too big', alert);
          return false;
        }
      }
    }
  }

  // All valid
  return true;
}



/**
 * Place alert after `<input>`.
 * @param {$} target The invalid `<input>`
 * @param {string} propName The name of the property that contains a custom alert.
 * @param {string} defMsg The default alert if custom alert is not defined.
 * @param {boolean} alert Whether to alert or not.
 */
function alertInvalid(target, propName, defMsg, alert) {
  if (alert) {
    target.next().remove();
    target.after($(`<span class="invalid-input">${target.prop(propName)
        ? target.prop(propName)
        : defMsg
      }</span>`));
  }
}



$(function() {

  // Location on 404 page
  $('#404-location').html(`File or Site missing at <code>${location.pathname}</code>`);

  const sections = [];

  // Sections
  $('.section, .non-text-section').each(function() {
    sections.push({
      title: $(this).children('.section-title').text(),
      id: $(this).prop('id')
    });
  });

  // Fixed toolbar
  let fixedToolbar = '<a href="#">To top</a>';

  if (sections.length > 0) {
    fixedToolbar += '<br><span class="coll">Sections</span><div>';

    $.each(sections, function(i, section) {
      fixedToolbar += `<a href="#${section.id}">${section.title}</a>${i < sections.length - 1 ? '<br>' : ''}`;
    });
    fixedToolbar += '</div>';
  }

  // Toolbar
  $('#toolbar').html(`
  <svg width="1000" height="50">
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
  </svg>

  <div id="fixed-toolbar">
    ${fixedToolbar}
  </div>
  `);

  // Collapsible
  $('.coll').click(function() {
    $(this).toggleClass('opened');
  });

});
