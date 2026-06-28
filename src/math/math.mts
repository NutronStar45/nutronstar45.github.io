import $ from "jquery";

/** Article structure. */
type Article = {
    filename: string,
    title: string
};

/** Topic structure. */
type Topic = {
    filename: string,
    title: string,
    subtopics?: string[],
    articles?: string[]
};

/** Metadata structure. */
type Metadata = {
    articles: Article[],
    topics: Topic[]
};

const path = location.pathname.split("/");
const pageType = path[2]!;
const filename = path[3]!.split(".")[0]!;

/** Generate the topics section of the article. */
function genArticleTopics(allTopics: Topic[]) {
    // Get topics
    let ownTopics: { filename: string, title: string }[] = [];
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
    } else {
        topicsHTML = '<i class="status">Empty</i>';
    }
    $("section#sec-topics > div").html(topicsHTML);
}

/** Generates the article's layout. */
function genArticleLayout(metadata: Metadata) {
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

    $("div#main-wrapper").prepend(`<h2>${ownData.title}</h2>`);
    genArticleTopics(metadata.topics);
}

/** Generates the subtopics section of the topic. */
function genTopicSubtopics(ownData: Topic, allTopics: Topic[]) {
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
    } else {
        subtopicsHTML = '<i class="status">Empty</i>';
    }
    $("section#sec-subtopics > div").html(subtopicsHTML);
}

/** Generates the articles section of the topic. */
function genTopicArticles(ownData: Topic, allArticles: Article[]) {
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
    } else {
        articlesHTML = '<i class="status">Empty</i>';
    }
    $("section#sec-articles > div").html(articlesHTML);
}

/** Generates the topics section of the topic. */
function genTopicTopics(allTopics: Topic[]) {
    // Get topics
    let ownTopics: { filename: string, title: string }[] = [];
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
    } else {
        topicsHTML = '<i class="status">Empty</i>';
    }
    $("section#sec-topics > div").html(topicsHTML);
}

/** Generates the topic's layout. */
function genTopicLayout(metadata: Metadata) {
    // Get topic data
    let ownData;
    for (const topic of metadata.topics) {
        if (topic.filename === filename) {
            ownData = topic;
            break;
        }
    }
    if (ownData === undefined) {
        throw Error(`Cannot find topic ${filename} in metadata`);
    }

    $("div#main-wrapper").prepend(`<h2>Topic: ${ownData.title}</h2>`);
    genTopicSubtopics(ownData, metadata.topics);
    genTopicArticles(ownData, metadata.articles);
    genTopicTopics(metadata.topics);
}

try {
    // Fetch metadata
    const response = await fetch("/src/math/metadata.json");
    if (!response.ok) {
        throw new Error(`Error fetching metadata: HTTP ${response.status}`);
    }

    // Parse metadata
    const metadata: Metadata = await response.json();

    if (pageType === "article") {
        genArticleLayout(metadata);
    } else if (pageType === "topic") {
        genTopicLayout(metadata);
    }
} catch (e) {
    console.error(e);
}
