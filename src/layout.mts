import $ from "jquery";

// The page width at which the navigation is hidden by default
const NAV_HIDDEN_PAGE_WIDTH = "700px";

// Whether navigation is forced hidden
let navForcedHidden = localStorage.getItem("navForcedHidden") === "true";


/** Generates the header. Deletes the header first if already present. */
function genHeader() {
    const headerHTML = '<header>'
            + '<button id="nav-toggle" class="img-button" title="Toggle navigation"><div></div></button>'
            + '<a href="/">NutronStar45\'s Work</a>'
        + '</header>';
    $("div#content-wrapper").before(headerHTML);
}

/** Generates the navigation. Deletes the navigation first if already present. */
function genNav() {
    // Fetch sections
    const sections = $("main > section").map(function () {
        const title = $(this).children("h3").text();
        const id = $(this).attr("id");
        if (id === undefined) {
            console.error(`Section with title ${title} doesn't have an ID`);
        }
        return { title, id: id ?? "" };
    }).get();

    // Navigation
    let navHTML = '<nav><a href="#">Top</a><hr>'
        + '<section><h3>Links</h3>'
        + '<ul><li><a href="/projects.html">Projects</a></li>'
        + '<li><a href="/math.html">Math</a></li></ul></section>';

    // Generate section links
    if (sections.length > 0) {
        navHTML += '<hr><section><h3>Sections</h3><ul>';
        for (const section of sections) {
            navHTML += `<li><a href="#${section.id}">${section.title}</a></li>`;
        }
        navHTML += '</ul></section>';
    }

    navHTML += '</nav>';
    $("div#content-wrapper").prepend(navHTML);
    $("nav").toggleClass("force-hidden", navForcedHidden);
}

/** Handles changing navigation visibility. */
function handleNavVisibilityChange() {
    // Handle navigation toggle
    const smallWidth = matchMedia(`(max-width: ${NAV_HIDDEN_PAGE_WIDTH})`);
    $("button#nav-toggle").on("click", () => {
        if (smallWidth.matches) {
            $("nav").toggleClass("force-hidden", false);
            $("nav").toggleClass("force-shown");
            $("div#main-overlay").toggleClass("active");
            $("div#main-wrapper").prop("inert", !$("div#main-wrapper").prop("inert"));

            localStorage.setItem("navForcedHidden", String(false));
        } else {
            $("nav").toggleClass("force-hidden");
            localStorage.setItem("navForcedHidden", String($("nav").hasClass("force-hidden")));
        }
    });

    // Handle width change
    smallWidth.addEventListener("change", () => {
        $("nav").toggleClass("force-shown", false);
        $("div#main-overlay").toggleClass("active", false);
        $("div#main-wrapper").prop("inert", false);
    })

    $("div#main-overlay").on("click", function () {
        $("nav").toggleClass("force-shown", false);
        $(this).toggleClass("active");
        $("div#main-wrapper").prop("inert", false);
    });
}

/** Generates the layout. */
export function genLayout() {
    $("div#content-wrapper").before('<div id="main-overlay"></div>');
    genHeader();
    genNav();
    handleNavVisibilityChange();
}
