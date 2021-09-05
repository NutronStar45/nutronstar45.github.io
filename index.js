// Log every available pages
const pages = [
  {
    title: '404 Not Found',
    attributes: {
      toolbar: {
        enabled: true,
        id: 'toolbar-meta'
      }
    }
  },
  {
    title: 'NutronStar45\'s Work',
    attributes: {
      toolbar: {
        enabled: true,
        id: 'toolbar-meta'
      }
    }
  },
  {
    title: 'Projects',
    attributes: {
      toolbar: {
        enabled: true,
        id: 'toolbar-meta'
      }
    }
  },
  {
    title: 'NutronStar45\'s Discord Bot',
    attributes: {
      toolbar: {
        enabled: true,
        id: 'toolbar-meta'
      }
    }
  }
];

// Log every available URL params
const params = [
  {
    label: 'Theme',
    key: 'theme',
    values: [
      'white',
      'dimmedBlack',
      'black'
    ],
    defaultValue: 'black'
  }
]

// Match each value
function matchArrayValue(array, value) {
  result = false;
  array.forEach(element => {
    result = result && (value == element);
  });
  return result;
}

// URL query/params
var paramEntriesRaw = new URLSearchParams(window.location.search);
var paramEntries = {
  theme: paramEntriesRaw.get('theme')
};

// On page loaded
window.onload = () => {
  // Themes
  var hasValidTheme = false;
  params[0].values.forEach(element => {
    if (paramEntries.theme == element) {
      document.querySelector('#stylesheet-source').href = `/themes/${element}.css`;
      hasValidTheme = true;
    } if (!hasValidTheme) document.querySelector('#stylesheet-source').href = `/themes/${params[0].defaultValue}.css`;
  });

  // Search page in data
  pages.forEach(element => {
    if (document.title == element.title) {
      // Fill internal script
      document.querySelector('#script-internal').innerHTML = `
document.querySelectorAll('[internal-link]').forEach(element => {
  if (element.getAttribute('internal-link') == '/')
    element.setAttribute('href', '/');
  else
    element.setAttribute('href', '/' + element.getAttribute('internal-link').split('-'));
});

var colls = document.querySelectorAll('.collapsible-button');
for (var coll = 0; coll < colls.length; coll++) {
  colls[coll].addEventListener('click', () => {
    var collContent = colls[coll].nextElementSibling;
    colls[coll].classList.toggle('opened');
    if (collContent.getAttribute('style') == 'display:none;')
      collContent.setAttribute('style', 'display:block;');
    else
      collContent.setAttribute('style', 'display:none;');
  });
}
`;

      // If toolbar is enabled
      if (element.attributes.toolbar.enabled) {
        document.getElementById(element.attributes.toolbar.id).innerHTML =
          `
<svg width="1000" height="50">
  <!-- Homepage icon -->
  <a xlink:href="/">
    <rect width="50" height="50" style="fill:${
      paramEntries.theme == 'white' ? '#fff' : (
      paramEntries.theme == 'dimmedBlack' ? '#1f1f1f' : (
      paramEntries.theme == 'black' ? '#000' : '#000'))
    }" />
    <polyline points="5,25 25,5 45,25" style="fill:none;stroke:#7f7f7f;stroke-width:3;" />
    <rect y="25" width="50" height="25" style="fill:${
      paramEntries.theme == 'white' ? '#fff' : (
      paramEntries.theme == 'dimmedBlack' ? '#1f1f1f' : (
      paramEntries.theme == 'black' ? '#000' : '#000'))
    }" />
    <polyline points="12,25 12,45 38,45 38,25" style="fill:none;stroke:#7f7f7f;stroke-width:3;" />
  </a>
  <!-- Projects -->
  <a xlink:href="/projs">
    <text x="100" y="30" fill="${
      paramEntries.theme == 'white' ? '#000' : (
      paramEntries.theme == 'dimmedBlack' ? '#fff' : (
      paramEntries.theme == 'black' ? '#fff' : '#fff'))
    }">Projects</text>
  </a>
</svg>
<!-- Fixed toolbar -->
<div class="toolbar-fixed">
  <a href="#">To top</a>
  <button class="collapsible-button" type="button">Options</button>
  <!-- Options -->
  <div style="display:none;">
    <label for="select-theme">Theme</label>
    <select id="select-theme" name="select-theme">
      <option${(
          !matchArrayValue(params[0].values, paramEntries.theme) &&
          params[0].defaultValue == 'white'
        ) || paramEntries.theme == 'white' ? ' selected' : ''
      }>White</option>
      <option${(
          !matchArrayValue(params[0].values, paramEntries.theme) &&
          params[0].defaultValue == 'dimmedBlack'
        ) || paramEntries.theme == 'dimmedBlack' ? ' selected' : ''
      }>Dimmed Black</option>
      <option${(
          !matchArrayValue(params[0].values, paramEntries.theme) &&
          params[0].defaultValue == 'black'
        ) || paramEntries.theme == 'black' ? ' selected' : ''
      }>Black</option>
    </select>
  </div>
</div>
`;
      }

      // File missing location on HTTP404
      if (element.title == '404 Not Found')
        document.querySelector('#page-subtitle').innerHTML = `File or Site missing at <code>${window.location.pathname}</code>`;
    }
  });

  // When theme changed
  var selectTheme = document.querySelector('#select-theme');
  selectTheme.onchange = () => {
    window.location.href = '?theme=' + params[0].values[selectTheme.selectedIndex];
  }
}
