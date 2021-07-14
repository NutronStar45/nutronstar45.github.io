// Log every available pages
const pages = [
  {
    title: '404 Not Found',
    relationTree: [null],
    attributes: {
      toolbar: {
        enabled: true,
        id: 'toolbarMeta'
      }
    }
  },
  {
    title: 'NutronStar45\'s Work',
    relationTree: [],
    attributes: {
      toolbar: {
        enabled: true,
        id: 'toolbarMeta'
      }
    }
  },
  {
    title: 'Projects',
    relationTree: ['Projects'],
    attributes: {
      toolbar: {
        enabled: true,
        id: 'toolbarMeta'
      }
    }
  },
  {
    title: 'NutronStar45\'s Discord Bot',
    relationTree: ['Projects', 'NutronStar45\'s Discord Bot'],
    attributes: {
      toolbar: {
        enabled: true,
        id: 'toolbarMeta'
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
    result ||= value == element;
  });
  return result;
}

// URL query/params
let paramEntriesRaw = new URLSearchParams(window.location.search);
let paramEntries = {
  theme: paramEntriesRaw.get('theme')
};

// On page loaded
window.onload = () => {
  // Page title
  let tabTitle = document.title;

  // Themes
  let hasValidTheme = false;
  params[0].values.forEach(element => {
    if (paramEntries.theme == element) {
      document.getElementById('stylesheetSource').href = `/themes/${ element }.css`;
      hasValidTheme = true;
    } if (!hasValidTheme) document.getElementById('stylesheetSource').href = `/themes/${ params[0].defaultValue }.css`;
  });

  // Fill in internal script
  pages.forEach(element => {
    document.getElementById('scriptInternal').innerHTML =
`
function link(path, site) {
  if (site == undefined)
    window.location.href = \`\${ path }?theme=\${ new URLSearchParams(window.location.search).get('theme') }\`;
  else if (site == 'github')
    window.location.href = \`https://github.com/\${ path }\`;
  else if (site == 'wiki')
    window.location.href = \`https://en.wikipedia.org/wiki/\${ path }\`;
}
`;

    // If the page has toolbar enabled
    if (document.title == element.title) {
      if (element.attributes.toolbar.enabled) {
        document.getElementById(element.attributes.toolbar.id).innerHTML =
`
<svg width="1000" height="50">
  <!-- Homepage icon -->
  <a xlink:href="javascript:link('/');">
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
  <a xlink:href="javascript:link('/projs');">
    <text x="100" y="30" fill="${
      paramEntries.theme == 'white' ? '#000' : (
      paramEntries.theme == 'dimmedBlack' ? '#fff' : (
      paramEntries.theme == 'black' ? '#fff' : '#fff'))
    }">Projects</text>
  </a>
</svg>
<!-- Fixed toolbar -->
<div class="toolbarFixed">
  <a href="#">To top</a>
  <button class="collapsibleButton" type="button">Options</button>
  <!-- Options -->
  <div style="display:none;">
    <label for="selectTheme">Theme</label>
    <select id="selectTheme" name="selectTheme">
      <option${
        (
          !matchArrayValue(params[0].values, paramEntries.theme) &&
          params[0].defaultValue == 'white'
        ) || paramEntries.theme == 'white' ? ' selected' : ''
      }>White</option>
      <option${
        (
          !matchArrayValue(params[0].values, paramEntries.theme) &&
          params[0].defaultValue == 'dimmedBlack'
        ) || paramEntries.theme == 'dimmedBlack' ? ' selected' : ''
      }>Dimmed Black</option>
      <option${
        (
          !matchArrayValue(params[0].values, paramEntries.theme) &&
          params[0].defaultValue == 'black'
        ) || paramEntries.theme == 'black' ? ' selected' : ''
      }>Black</option>
    </select>
  </div>
  <button class="collapsibleButton" type="button">Contents</button>
  <div style="display:none;">
    <span>${
      tabTitle == '404 Not Found' ? `
<a href="#what">What is this?</a> <br>
<a href="#why">Why is this happening?</a> <br>
<a href="#nextMove">What should I do?</a>
` : (
      tabTitle == 'NutronStar45\'s Work' ? `
<a href="#about">Who am I?</a> <br>
<a href="#making">What am I making?</a> <br>
<a href="#plannedMaking">Also I'm planning to make</a> <br>
<a href="#links">Useful links</a> <br>
<a href="#sources">Sources</a>
` : (
      tabTitle == 'Projects' ? `
<a href="#ongoing">Ongoing</a> <br>
<a href="#planned">Planned</a> <br>
` : (
      tabTitle == 'NutronStar45\'s Discord Bot' ? `
<a href="#aboutDiscord">About Discord</a> <br>
<a href="#aboutBot">About Discord bot</a> <br>
<a href="#whatFor">What is this bot for?</a> <br>
<a href="#getItWorking">How to get it working</a>
` : (
      ''
    ))))
    }</span>
  </div>
</div>
`;
      }

      // Collapsible
      let colls = document.getElementsByClassName('collapsibleButton');
      for (let coll = 0; coll < colls.length; coll++) {
        colls[coll].addEventListener('click', () => {
          let collContent = colls[coll].nextElementSibling;
          colls[coll].classList.toggle('opened');
          if (collContent.getAttribute('style') == 'display:none;')
            collContent.setAttribute('style', 'display:block;');
          else
            collContent.setAttribute('style', 'display:none;');
        });
      }

      // File missing location on HTTP404
      if (element.relationTree[0] == null)
        document.getElementById('pageSubtitle').innerHTML = `File or Site missing at <code>${ window.location.pathname }</code>`;
    }
  });

  // When theme changed
  let selectTheme = document.getElementById('selectTheme');
  selectTheme.onchange = () => {
    window.location.href = '?theme=' + params[0].values[selectTheme.selectedIndex];
  }
}
