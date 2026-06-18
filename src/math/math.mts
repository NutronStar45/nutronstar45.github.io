import $ from "jquery";

/** Metadata structure. */
type Metadata = {
    articles: { filename: string, title: string }[],
    topics: { filename: string, title: string, articles: string[] }[]
};

const path = location.pathname.split("/");
const pageType = path[2]!;
const filename = path[3]!.split(".")[0]!;

try {
    // Fetch metadata
    const response = await fetch("/src/math/metadata.json");
    if (!response.ok) {
        throw new Error(`Error fetching metadata: HTTP ${response.status}`);
    }

    // Parse metadata
    const metadata: Metadata = await response.json();
    const { articles: allArticles, topics: allTopics } = metadata;

    // Topics
    if (pageType === "topic") {
        // Get articles
        let articles;
        for (const topic of allTopics) {
            if (topic.filename === filename) {
                articles = topic.articles;
                break;
            }
        }
        if (articles === undefined) {
            throw new TypeError("Metadata has incorrect format");
        }

        let articlesHTML = "<div><ul>";
        for (const ownArticleFilename of articles) {
            for (const article of allArticles) {
                if (article.filename === ownArticleFilename) {
                    articlesHTML += `<li><a href="../article/${ownArticleFilename}.html">${article.title}</a></li>`;
                }
            }
        }
        articlesHTML += "</ul></div>";
        $("section#sec-articles").append(articlesHTML);
    }
} catch (e) {
    console.error(e);
}
