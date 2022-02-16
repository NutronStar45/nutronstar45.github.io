// Log every available pages
const pages = [
  {
    title: '404 Not Found',
    is404: true
  },
  {
    title: 'NutronStar45\'s Work'
  },
  {
    title: 'Projects'
  },
  {
    title: 'NutronStar45\'s Discord Bot'
  }
];

// Match each value
function matchArrayValue(array, value) {
  result = false;
  array.forEach(element => {
    result = result && (value == element);
  });
  return result;
}

// Search through every page
pages.forEach(page => {
  if (document.title == page.title) {
    // Fill internal script
    document.getElementById('script-internal').innerHTML = `
document.querySelectorAll('[internal-link]').forEach(element => {
  element.setAttribute('href', '/' + element.getAttribute('internal-link'));
});

let colls = document.querySelector('.collapsible-button');
for (let coll = 0; coll < colls.length; coll++) {
  colls[coll].addEventListener('click', () => {
    let collContent = colls[coll].nextElementSibling;
    colls[coll].classList.toggle('opened');
    if (collContent.getAttribute('style') == 'display:none;')
      collContent.setAttribute('style', 'display:initial;');
    else
      collContent.setAttribute('style', 'display:none;');
  });
}
`;

    // Toolbar
    document.getElementById('toolbar-meta').innerHTML = `
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
  <a href="#">To top</a>
</div>
`;
  }

  // Location on 404 page
  if (page.is404)
    document.getElementById('page-subtitle').innerHTML = `File or Site missing at <code>${window.location.pathname}</code>`;
});
