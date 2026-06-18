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

    // Articles
    if (pageType === "article") {
        // Get topics
        let topics: [string, string][] = [];
        for (const topic of allTopics) {
            if (topic.articles.includes(filename)) {
                topics.push([topic.filename, topic.title]);
            }
        }

        // Generate HTML
        let topicsHTMl = "<div><ul>";
        for (const ownTopic of topics) {
            topicsHTMl += `<li><a href="../topic/${ownTopic[0]}.html">${ownTopic[1]}</a></li>`;
        }
        topicsHTMl += "</ul></div>";
        $("section#sec-topics").append(topicsHTMl);
    }

    // Topics
    else if (pageType === "topic") {
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

        // Generate HTML
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
