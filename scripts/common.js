let commitVer = '2.10.4.7';



let alerts = {
  invalid: 'Invalid/Empty',
  small: 'Number too small',
  big: 'Number too big'
};



/**
 * Validates one or more `<input>`s and returns the validity.
 * @param {(string | $)[]} targets The validation targets.
 * @param {boolean} alert Whether to alert invalid input or not, defaults to true.
 * @returns Whether `targets` are valid or not.
 */
function validate(targets, alert = true) {
  let validity = true;

  for (let i = 0; i < targets.length; i++) {
    let target = targets[i];

    if (typeof target === 'string') {
      target = $(target);
    }

    if (target.prop('type') === 'number') {
      // Invalid/empty
      if (target.val() === '') {
        alertInvalid(target, 'invalid', alert);
        validity = false;
        continue;
      } else {
        let min = -Infinity, max = Infinity;

        // Calculate min
        if (isNaN(target.prop('min'))) {
          if (validate([target.prop('min')], false)) {
            min = +$(target.prop('min')).val();
          }
        } else if (target.prop('min') !== '') {
          min = +target.prop('min');
        }

        // Calculate max
        if (isNaN(target.prop('max'))) {
          if (validate([target.prop('max')], false)) {
            max = +$(target.prop('max')).val();
          }
        } else if (target.prop('max') !== '') {
          max = +target.prop('max');
        }

        // Too small
        if (+target.val() < min) {
          alertInvalid(target, 'small', alert);
          validity = false;
          continue;
        }
        // Too big
        if (+target.val() > max) {
          alertInvalid(target, 'big', alert);
          validity = false;
          continue;
        }
      }
    }

    target.next().remove(); // Remove potential alert
  }

  return validity;
}



/**
 * Place alert after `<input>`.
 * @param {$} target The invalid `<input>`
 * @param {string} type The type of the invalidity.
 * @param {boolean} alert Whether to alert or not.
 */
function alertInvalid(target, type, alert) {
  if (alert) {
    target.next().remove();
    target.after($(`<span class="invalid-input">${
      target.attr('alert-' + type)
        ? target.attr('alert-' + type)
        : alerts[type]
    }</span>`));
  }
}



$(function() {

  // Location in 404 page
  $('#404-location').html(`File or Site missing at <code>${location.pathname}</code>`);

  let sections = [];

  // Sections
  $('div.section, div.non-text-section').each(function() {
    sections.push({
      title: $(this).children('p.section-title').text(),
      id: $(this).prop('id')
    });
  });

  // Fixed toolbar
  let fixedToolbar = `<a href="#">To top</a><br><span>Commit ${commitVer}</span>`;

  if (sections.length > 0) {
    fixedToolbar += '<br><button class="coll">Sections</button><div>';

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

  // Required indicator
  $('input.required').before('<span class="required-ind">* </span>');

  // Collapsible
  $('button.coll').click(function() {
    $(this).toggleClass('opened');
  });

});
