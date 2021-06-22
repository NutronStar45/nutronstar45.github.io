// Log every available pages
const pages = [
	{
		title: '404 Not Found',
		relation: 'HTTP404',
		path: {
			relativePath: null,
			relativeIndexPath: '/http404.html',
			relativeStylesheetPath: '/',
			relativeStylesheetIndexPath: '/index.css',
			relativeScriptPath: '/',
			relativeScriptIndexPath: '/index.js'
		},
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
		path: {
			relativePath: '/',
			relativeIndexPath: '/index.html',
			relativeStylesheetPath: '/',
			relativeStylesheetIndexPath: '/index.css',
			relativeScriptPath: '/',
			relativeScriptIndexPath: '/index.js'
		},
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
		path: {
			relativePath: '/projs',
			relativeIndexPath: '/projs/index.html',
			relativeStylesheetPath: '/',
			relativeStylesheetIndexPath: '/index.css',
			relativeScriptPath: '/',
			relativeScriptIndexPath: '/index.js'
		},
		attributes: {
			toolbar: {
				enabled: true,
				class: 'toolbar',
				id: 'toolbarMeta'
			}
		}
	}
];

// On page loaded
window.onload = () => {
	pages.forEach(element => {
		// If the page has toolbar enabled
		if (document.title == element.title &&
			element.attributes.toolbar.enabled) {
			document.getElementById(element.attributes.toolbar.id).innerHTML = `
				<!-- Homepage icon -->
				<a xlink:href="/">
					<rect width="50" height="50" style="fill:#fff" />
					<polyline points="5,25 25,5 45,25" style="fill:none;stroke:#7f7f7f;stroke-width:3;" />
					<rect y="25" width="50" height="25" style="fill:#fff" />
					<polyline points="12,25 12,45 38,45 38,25" style="fill:none;stroke:#7f7f7f;stroke-width:3;" />
				</a>
				<!-- Projects -->
				<a xlink:href="/projs">
					<text x="100" y="30" fill="#000">Projects</text>
				</a>
			`;
			// File missing location on HTTP404
			if (element.relation == 'HTTP404')
				document.getElementById('pageSubtitle').innerHTML = `File or Site missing at <code>${window.location.pathname}</code>`;
		}
	});
}
