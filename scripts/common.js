// Log every available pages
const pages = [
  { title: '404 Not Found', is404: true },
  { title: 'NutronStar45\'s Work' },
  { title: 'Projects' },
  { title: 'NutronStar45\'s Discord Bot' }
];

$(function() {

  /*
  // Search through every page
  pages.forEach(function(page) {
    // Location on 404 page
    if (page.title == document.title && page.is404)
      $('#page-subtitle').html(`File or Site missing at <code>${location.pathname}</code>`);
  });

  const sections = [];

  // Sections
  $('.section').each(function() {
    sections.push({
      title: $(this).children('.section-title').text(),
      id: $(this).prop('id')
    });
  });
  */

  // Fixed toolbar
  let fixedToolbar = '<a href="#">To top</a><p class="coll">Sections</p><div>';

  /*
  $.each(sections, function(i, section) {
    fixedToolbar += `<a href="#${section.id}">${section.title}</a>${i < sections.length - 1 ? '<br>' : ''}`
  });
  */

  fixedToolbar += '</div>'

  // Toolbar
  $('#toolbar-meta').html(`
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

  <!-- Fixed toolbar -->
  <div class="toolbar-fixed">
    ${fixedToolbar}
  </div>
  `);

  // Collapsible
  $('.coll').click(function () {
    $(this).toggleClass('opened');
  });

});
