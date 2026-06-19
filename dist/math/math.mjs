import $ from "jquery";
const path = location.pathname.split("/");
const pageType = path[2];
const filename = path[3].split(".")[0];
/** Populate the article's topics section. */
function fillArticleSections(metadata) {
    const allTopics = metadata.topics;
    // Get topics
    let ownTopics = [];
    for (const topic of allTopics) {
        if (topic.articles !== undefined && topic.articles.includes(filename)) {
            ownTopics.push([topic.filename, topic.title]);
        }
    }
    // Generate topics HTML
    let topicsHTML;
    if (ownTopics.length > 0) {
        topicsHTML = "<ul>";
        for (const ownTopic of ownTopics) {
            topicsHTML += `<li><a href="../topic/${ownTopic[0]}.html">${ownTopic[1]}</a></li>`;
        }
        topicsHTML += "</ul>";
    }
    else {
        topicsHTML = '<i class="status">Empty</i>';
    }
    $("section#sec-topics > div").html(topicsHTML);
}
/** Populate the topic's subtopics, articles and topics sections. */
function fillTopicSections(metadata) {
    const { articles: allArticles, topics: allTopics } = metadata;
    // Get subtopics and articles
    let subtopics;
    let articles;
    for (const topic of allTopics) {
        if (topic.filename === filename) {
            subtopics = topic.subtopics;
            articles = topic.articles;
            break;
        }
    }
    // Generate subtopics HTML
    let subtopicsHTML;
    if (subtopics !== undefined) {
        subtopicsHTML = "<ul>";
        for (const ownSubtopicFilename of subtopics) {
            for (const topic of allTopics) {
                if (topic.filename === ownSubtopicFilename) {
                    subtopicsHTML += `<li><a href="../topic/${ownSubtopicFilename}.html">${topic.title}</a></li>`;
                }
            }
        }
        subtopicsHTML += "</ul>";
    }
    else {
        subtopicsHTML = '<i class="status">Empty</i>';
    }
    $("section#sec-subtopics > div").html(subtopicsHTML);
    // Generate articles HTML
    let articlesHTML;
    if (articles !== undefined) {
        articlesHTML = "<ul>";
        for (const ownArticleFilename of articles) {
            for (const article of allArticles) {
                if (article.filename === ownArticleFilename) {
                    articlesHTML += `<li><a href="../article/${ownArticleFilename}.html">${article.title}</a></li>`;
                }
            }
        }
        articlesHTML += "</ul>";
    }
    else {
        articlesHTML = '<i class="status">Empty</i>';
    }
    $("section#sec-articles > div").html(articlesHTML);
    // Get topics
    let ownTopics = [];
    for (const topic of allTopics) {
        if (topic.subtopics !== undefined && topic.subtopics.includes(filename)) {
            ownTopics.push([topic.filename, topic.title]);
        }
    }
    // Generate topics HTML
    let topicsHTML;
    if (ownTopics.length > 0) {
        topicsHTML = "<ul>";
        for (const ownTopic of ownTopics) {
            topicsHTML += `<li><a href="./${ownTopic[0]}.html">${ownTopic[1]}</a></li>`;
        }
        topicsHTML += "</ul>";
    }
    else {
        topicsHTML = '<i class="status">Empty</i>';
    }
    $("section#sec-topics > div").html(topicsHTML);
}
try {
    // Fetch metadata
    const response = await fetch("/src/math/metadata.json");
    if (!response.ok) {
        throw new Error(`Error fetching metadata: HTTP ${response.status}`);
    }
    // Parse metadata
    const metadata = await response.json();
    // Articles
    if (pageType === "article") {
        fillArticleSections(metadata);
    }
    // Topics
    else if (pageType === "topic") {
        fillTopicSections(metadata);
    }
}
catch (e) {
    console.error(e);
}
