import $ from "jquery";
const path = location.pathname.split("/");
const pageType = path[2];
const filename = path[3].split(".")[0];
/** Generates the article's layout. */
function genArticleLayout(metadata) {
    const allTopics = metadata.topics;
    // Get article data
    let ownData;
    for (const article of metadata.articles) {
        if (article.filename === filename) {
            ownData = article;
        }
    }
    if (ownData === undefined) {
        throw Error(`Cannot find article ${filename} in metadata`);
    }
    // Generate title
    $("div#main-wrapper").prepend(`<h2>${ownData.title}</h2>`);
    // Get topics
    let ownTopics = [];
    for (const topic of allTopics) {
        if (topic.articles !== undefined && topic.articles.includes(filename)) {
            ownTopics.push({ filename: topic.filename, title: topic.title });
        }
    }
    // Generate topics section
    let topicsHTML;
    if (ownTopics.length > 0) {
        topicsHTML = '<ul>';
        for (const ownTopic of ownTopics) {
            topicsHTML += `<li><a href="../topic/${ownTopic.filename}.html">${ownTopic.title}</a></li>`;
        }
        topicsHTML += '</ul>';
    }
    else {
        topicsHTML = '<i class="status">Empty</i>';
    }
    $("section#sec-topics > div").html(topicsHTML);
}
/** Generates the topic's layout. */
function genTopicLayout(metadata) {
    const { articles: allArticles, topics: allTopics } = metadata;
    // Get topic data
    let ownData;
    for (const topic of allTopics) {
        if (topic.filename === filename) {
            ownData = topic;
            break;
        }
    }
    if (ownData === undefined) {
        throw Error(`Cannot find topic ${filename} in metadata`);
    }
    // Generate title
    $("div#main-wrapper").prepend(`<h2>Topic: ${ownData.title}</h2>`);
    // Generate subtopics section
    let subtopicsHTML;
    if (ownData.subtopics !== undefined) {
        subtopicsHTML = '<ul>';
        for (const ownSubtopicFilename of ownData.subtopics) {
            for (const topic of allTopics) {
                if (topic.filename === ownSubtopicFilename) {
                    subtopicsHTML += `<li><a href="../topic/${ownSubtopicFilename}.html">${topic.title}</a></li>`;
                }
            }
        }
        subtopicsHTML += '</ul>';
    }
    else {
        subtopicsHTML = '<i class="status">Empty</i>';
    }
    $("section#sec-subtopics > div").html(subtopicsHTML);
    // Generate articles section
    let articlesHTML;
    if (ownData.articles !== undefined) {
        articlesHTML = '<ul>';
        for (const ownArticleFilename of ownData.articles) {
            for (const article of allArticles) {
                if (article.filename === ownArticleFilename) {
                    articlesHTML += `<li><a href="../article/${ownArticleFilename}.html">${article.title}</a></li>`;
                }
            }
        }
        articlesHTML += '</ul>';
    }
    else {
        articlesHTML = '<i class="status">Empty</i>';
    }
    $("section#sec-articles > div").html(articlesHTML);
    // Get topics
    let ownTopics = [];
    for (const topic of allTopics) {
        if (topic.subtopics !== undefined && topic.subtopics.includes(filename)) {
            ownTopics.push({ filename: topic.filename, title: topic.title });
        }
    }
    // Generate topics HTML
    let topicsHTML;
    if (ownTopics.length > 0) {
        topicsHTML = '<ul>';
        for (const ownTopic of ownTopics) {
            topicsHTML += `<li><a href="./${ownTopic.filename}.html">${ownTopic.title}</a></li>`;
        }
        topicsHTML += '</ul>';
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
    if (pageType === "article") {
        genArticleLayout(metadata);
    }
    else if (pageType === "topic") {
        genTopicLayout(metadata);
    }
}
catch (e) {
    console.error(e);
}
