// Log every available pages
const pages = [
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
		if (document.getElementById('pageTitle').innerHTML == element.title &&
			element.attributes.toolbar.enabled) {
			document.getElementById('toolbarMeta').innerHTML = `
				<!-- Homepage icon -->
				<a xlink:href="/">
					<rect width="50" height="50" style="fill:#fff" />
					<path d="M5 25 l20 -20 l20 20" stroke="#7f7f7f" stroke-width="3" fill="none" />
					<rect y="25" width="50" height="25" style="fill:#fff" />
					<path d="M12 25 l0 20 l26 0 l0 -20" stroke="#7f7f7f" stroke-width="3" fill="none" />
				</a>
				<!-- Projects -->
				<a xlink:href="/projs">
					<text x="100" y="30" fill="#000">Projects</text>
				</a>
			`;
		}
	});
}
