// Log every available pages
const pages = [
	{
		title: '404 Not Found',
		relation: 'HTTP404',
		attributes: {
			toolbar: {
				enabled: true,
				class: 'toolbar',
				id: 'toolbarMeta'
			}
		}
	},
	{
		title: 'NutronStar45\'s Work',
		relation: 'Home Page',
		attributes: {
			toolbar: {
				enabled: true,
				class: 'toolbar',
				id: 'toolbarMeta'
			}
		}
	},
	{
		title: 'Projects',
		relation: 'Projects',
		attributes: {
			toolbar: {
				enabled: true,
				class: 'toolbar',
				id: 'toolbarMeta'
			}
		}
	}
];

// Log every available URL params
const params = [
	{
		title: 'Theme',
		key: 'theme',
		values: [
			'white',
			'dimmedBlack',
			'black'
		],
		defaultValue: 'white'
	}
]

// On page loaded
window.onload = () => {
	// URL query/params
	let paramEntriesRaw = new URLSearchParams(window.location.search);
	let paramEntries = {
		theme: paramEntriesRaw.get('theme')
	};

	// Themes
	let hasValidTheme = false;
	params[0].values.forEach(element => {
		if (paramEntries.theme == element) {
			document.getElementById('stylesheetSource').href = `/themes/${ element }.css`;
			hasValidTheme = true;
		} if (!hasValidTheme) document.getElementById('stylesheetSource').href = `/themes/${ params[0].defaultValue }.css`;
	});

	pages.forEach(element => {
		// If the page has toolbar enabled
		if (document.title == element.title &&
			element.attributes.toolbar.enabled) {
			document.getElementById(element.attributes.toolbar.id).innerHTML = `
				<svg class="toolbar" id="toolbarMeta" width="1000" height="50">
					<!-- Homepage icon -->
					<a xlink:href="javascript:link('/');">
						<rect width="50" height="50" style="fill:${
							paramEntries.theme == 'white' ? '#fff' : (
							paramEntries.theme == 'dimmedBlack' ? '#1f1f1f' : (
							paramEntries.theme == 'black' ? '#000' : '#fff'))
						}" />
						<polyline points="5,25 25,5 45,25" style="fill:none;stroke:#7f7f7f;stroke-width:3;" />
						<rect y="25" width="50" height="25" style="fill:${
							paramEntries.theme == 'white' ? '#fff' : (
							paramEntries.theme == 'dimmedBlack' ? '#1f1f1f' : (
							paramEntries.theme == 'black' ? '#000' : '#fff'))
						}" />
						<polyline points="12,25 12,45 38,45 38,25" style="fill:none;stroke:#7f7f7f;stroke-width:3;" />
					</a>
					<!-- Projects -->
					<a xlink:href="javascript:link('/projs');">
						<text x="100" y="30" fill="${
							paramEntries.theme == 'white' ? '#000' : (
							paramEntries.theme == 'dimmedBlack' ? '#fff' : (
							paramEntries.theme == 'black' ? '#fff' : '#000'))
						}">Projects</text>
					</a>
				</svg>
				<div class="toolbarFixed" id="toolbarFixed">
					<a href="#">To top</a> <br>
					<label for="selectTheme">Theme</label>
					<select class="selectDropdown" id="selectTheme" name="selectTheme">
						<option${ paramEntries.theme == 'white' ? ' selected' : '' }>White</option>
						<option${ paramEntries.theme == 'dimmedBlack' ? ' selected' : '' }>Dimmed Black</option>
						<option${ paramEntries.theme == 'black' ? ' selected' : '' }>Black</option>
					</select>
				</div>
			`;
			// File missing location on HTTP404
			if (element.relation == 'HTTP404')
				document.getElementById('pageSubtitle').innerHTML = `File or Site missing at <code>${ window.location.pathname }</code>`;
		}
	});

	// When theme changed
	let selectTheme = document.getElementById('selectTheme');
	selectTheme.onchange = () => {
		window.location.href = '?theme=' + params[0].values[selectTheme.selectedIndex];
	}

	// Link to page
	function link(path) {
		//
		`${ path }?theme=${ paramEntries.theme }`;
	}
}
