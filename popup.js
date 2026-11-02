const YOUTUBE_API_KEY = "AIzaSyDKBPzTKssTkFsu-7Vu0Tv3FF4VSaFPncc";

const toggleBtn = document.getElementById("toggleBtn");
const statustxt = document.getElementById("status");

let studyMode = false;

function updateUI() {
    toggleBtn.textContent = studyMode
    ? "Turn Study Mode OFF" : "Turn Study Mode ON";
    
    statustxt.textContent = studyMode
    ? "Study Mode is ON" : "Study Mode is OFF";
}

chrome.storage.local.get("studyMode", (result) => {
    studyMode = result.studyMode ?? false;
    updateUI();
})

toggleBtn.addEventListener("click", () => {
    const newStudyMode = !studyMode;

    chrome.storage.local.set(
        { studyMode: newStudyMode },
        () => {
            if (chrome.runtime.lastError) {
                statustxt.textContent =
                    "Could not update Study Mode. Please try again.";
                return;
            }

            studyMode = newStudyMode;
            updateUI();
        }
    );
});

const keywordInput = document.getElementById("keywordInput");
const addKeywordBtn = document.getElementById("addKeywordBtn");
const keywordList = document.getElementById("keywordList");
const keywordMessage = document.getElementById("keywordMessage");
const clearKeywordsBtn = document.getElementById("clearKeywordsBtn");
const clearMessage = document.getElementById("clearMessage");
const confirmModal = document.getElementById("confirmModal");
const cancelClearBtn = document.getElementById("cancelClearBtn");
const confirmClearBtn = document.getElementById("confirmClearBtn");
const modal_background = document.getElementById("modal_background");
const toggleKeywordsBtn = document.getElementById("toggleKeywordsBtn");
const keywordSection = document.getElementById("keywordList");
const resetKeywordsBtn = document.getElementById("resetKeywordsBtn");
const resetMessage = document.getElementById("resetMessage");
const confirmResetModal = document.getElementById("confirmResetModal");
const cancelResetBtn = document.getElementById("cancelResetBtn");
const confirmResetBtn = document.getElementById("confirmResetBtn");
const modal_reset_background = document.getElementById("modal_reset_background");
const topicSelect = document.getElementById("topicSelect");
const topicMessage = document.getElementById("topicMessage");
const topicKeywordHeading = document.getElementById("topicKeywordHeading");
const topicKeywordCount = document.getElementById("topicKeywordCount");
const topicKeywordInput = document.getElementById("topicKeywordInput");
const addTopicKeywordBtn = document.getElementById("addTopicKeywordBtn");
const topicKeywordMessage = document.getElementById("topicKeywordMessage");
const topicKeywordList = document.getElementById("topicKeywordList");
// Trusted Channels elements
const trustedChannelInput = document.getElementById("trustedChannelInput");
const addTrustedChannelBtn = document.getElementById("addTrustedChannelBtn");
const trustedChannelMessage = document.getElementById("trustedChannelMessage");
const trustedChannelList = document.getElementById("trustedChannelList");
// Trusted Videos elements
const trustedVideoInput = document.getElementById("trustedVideoInput");
const addTrustedVideoBtn = document.getElementById("addTrustedVideoBtn");
const trustedVideoMessage = document.getElementById("trustedVideoMessage");
const trustedVideoList = document.getElementById("trustedVideoList");

const defaultKeywords = [
    "gaming",
    "gameplay",
    "minecraft",
    "fortnite",
    "comedy",
    "prank",
    "funny moments",
    "reaction video"
];

const defaultTopicKeywords = {
    DSA: [
        "arrays",
        "linked list",
        "stack",
        "queue",
        "trees",
        "graphs",
        "recursion",
        "backtracking",
        "dynamic programming"
    ],

    OS: [
        "operating system",
        "processes",
        "threads",
        "deadlock",
        "cpu scheduling",
        "memory management",
        "virtual memory"
    ],

    DBMS: [
        "dbms",
        "sql",
        "normalization",
        "transactions",
        "indexing",
        "joins",
        "acid properties"
    ],

    CN: [
        "computer networks",
        "tcp",
        "udp",
        "http",
        "dns",
        "routing",
        "subnetting",
        "osi model"
    ]
};

function renderKeywords(keywords) {
    keywordList.innerHTML = "";

    document.getElementById("keywordCount").textContent = `Total keywords: ${keywords.length}`;

    keywords.forEach((keyword) =>{
        const li = document.createElement("li");
        li.textContent = keyword;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";

        removeBtn.addEventListener("click", () => {
            const updated = keywords.filter((item) => item !== keyword);

            chrome.storage.local.set(
                { distractingKeywords: updated },
                () => {
                    if (chrome.runtime.lastError) {
                        keywordMessage.textContent =
                            "Could not remove keyword. Please try again.";
                        return;
                    }

                    keywordMessage.textContent = "Keyword removed successfully!";
                    renderKeywords(updated);
                }
            );
        });

        li.appendChild(removeBtn);
        keywordList.appendChild(li);
    });
}

chrome.storage.local.get("distractingKeywords", (result) => {
    const keywords = result.distractingKeywords ?? defaultKeywords;

    chrome.storage.local.set({ distractingKeywords: keywords }, () => {
        renderKeywords(keywords);
    });
});

function addKeyword() {
    const keyword = keywordInput.value.trim().toLowerCase();

    if(!keyword){
        keywordMessage.textContent = "Please enter a keyword.";
        return;
    }    

    chrome.storage.local.get("distractingKeywords", (result) => {
        const keywords = result.distractingKeywords ?? defaultKeywords;

        if(keywords.includes(keyword)){
            keywordMessage.textContent = "This keyword already exists.";
            return;
        }

        const updated = [...keywords, keyword];

        chrome.storage.local.set(
            { distractingKeywords: updated },
            () => {
                keywordInput.value = "";
                renderKeywords(updated);
                clearMessage.textContent = "";
                keywordMessage.textContent = "keyword added successfully!";
            }
        );
    });
}

addKeywordBtn.addEventListener("click", addKeyword);

keywordInput.addEventListener("keydown", (event) => {
    if(event.key == "Enter"){
        addKeyword();
    }
});


clearKeywordsBtn.addEventListener("click", () => {
    clearMessage.textContent = "";
    confirmModal.classList.remove("hidden");
    modal_background.classList.remove("hidden");
});

cancelClearBtn.addEventListener("click", () => {
    confirmModal.classList.add("hidden");
    modal_background.classList.add("hidden");
});

confirmClearBtn.addEventListener("click", () => {
    chrome.storage.local.set({distractingKeywords: []}, () => {
        if(chrome.runtime.lastError){
            clearMessage.textContent = "Could not clear keywords. Please try again.";
            confirmModal.classList.add("hidden");
            modal_background.classList.add("hidden");
            return;
        }

        renderKeywords([]);
        keywordInput.value = "";
        keywordMessage.textContent = "All keywords cleared!";
        confirmModal.classList.add("hidden");
        modal_background.classList.add("hidden");
    });
});

toggleKeywordsBtn.addEventListener("click", () => {
    const isHidden = keywordSection.style.display === "none";

    if(isHidden) {
        keywordSection.style.display = "block";
        toggleKeywordsBtn.textContent = "Hide Keywords ▲";
    }
    else{
        keywordSection.style.display = "none";
        toggleKeywordsBtn.textContent = "Show Keywords ▼";
    }
});



resetKeywordsBtn.addEventListener("click", () => {
    resetMessage.textContent = "";
    confirmResetModal.classList.remove("hidden");
    modal_reset_background.classList.remove("hidden");
});

cancelResetBtn.addEventListener("click", () => {
    confirmResetModal.classList.add("hidden");
    modal_reset_background.classList.add("hidden");
});

confirmResetBtn.addEventListener("click", () => {
    const defaults = [...defaultKeywords];
    
    chrome.storage.local.set({distractingKeywords: defaults}, () => {
        if(chrome.runtime.lastError){
            resetMessage.textContent = "Could not reset keywords. Please try again.";
            confirmResetModal.classList.add("hidden");
            modal_reset_background.classList.add("hidden");
            return;
        }

        renderKeywords(defaults);
        keywordInput.value = "";
        resetMessage.textContent = "All keywords restored!";
        confirmResetModal.classList.add("hidden");
        modal_reset_background.classList.add("hidden");
    });
});




chrome.storage.local.get("selectedTopic", (result) => {

    const validTopics = ["DSA", "OS", "DBMS", "CN"];

    const selectedTopic = validTopics.includes(result.selectedTopic)
        ? result.selectedTopic
        : "DSA";

    topicSelect.value = selectedTopic;

    if (result.selectedTopic !== selectedTopic) {
        chrome.storage.local.set({
            selectedTopic: selectedTopic
        });
    }

    initializeTopicKeywords();

});

topicSelect.addEventListener("change", () => {
    const selectedTopic = topicSelect.value;

    chrome.storage.local.set(
        { selectedTopic },
        () => {
            if (chrome.runtime.lastError) {
                topicMessage.textContent =
                    "Could not save topic. Please try again.";
                topicMessage.style.color = "red";
                return;
            }

            topicMessage.textContent = "Study topic saved successfully!";
            topicMessage.style.color = "#16a34a"

            renderTopicKeywords(selectedTopic);

            topicKeywordInput.value = "";
            topicKeywordMessage.textContent = "";
        }
    );
});



// Initialize topic-specific keyword storage
function initializeTopicKeywords() {

    chrome.storage.local.get("topicKeywords", (result) => {

        const savedKeywords = result.topicKeywords ?? {};

        const initializedKeywords = {};

        Object.keys(defaultTopicKeywords).forEach((topic) => {

            initializedKeywords[topic] =
                Array.isArray(savedKeywords[topic])
                    ? savedKeywords[topic]
                    : [...defaultTopicKeywords[topic]];

        });

        chrome.storage.local.set(
            { topicKeywords: initializedKeywords },
            () => {

                if (chrome.runtime.lastError) {
                    topicKeywordMessage.textContent =
                        "Could not initialize topic keywords.";
                    return;
                }

                renderTopicKeywords(topicSelect.value);

            }
        );

    });

}


// Display keywords for the selected topic
function renderTopicKeywords(topic) {

    chrome.storage.local.get("topicKeywords", (result) => {

        const allKeywords = result.topicKeywords ?? {};

        const keywords = allKeywords[topic] ?? [];

        topicKeywordHeading.textContent = `${topic} Keywords`;

        topicKeywordCount.textContent =
            `Total keywords: ${keywords.length}`;

        topicKeywordList.innerHTML = "";

        keywords.forEach((keyword) => {

            const li = document.createElement("li");

            li.textContent = keyword;

            const removeBtn = document.createElement("button");

            removeBtn.textContent = "Remove";

            removeBtn.addEventListener("click", () => {

                const updated = keywords.filter(
                    (item) => item !== keyword
                );

                const updatedAllKeywords = {
                    ...allKeywords,
                    [topic]: updated
                };

                chrome.storage.local.set(
                    { topicKeywords: updatedAllKeywords },
                    () => {

                        if (chrome.runtime.lastError) {
                            topicKeywordMessage.textContent =
                                "Could not remove keyword.";
                            return;
                        }

                        topicKeywordMessage.textContent =
                            "Topic keyword removed successfully!";

                        renderTopicKeywords(topic);

                    }
                );

            });

            li.appendChild(removeBtn);

            topicKeywordList.appendChild(li);

        });

    });

}


// Add a keyword to the selected topic
function addTopicKeyword() {

    const topic = topicSelect.value;

    const keyword = topicKeywordInput.value.trim().toLowerCase();

    if (!keyword) {
        topicKeywordMessage.textContent =
            "Please enter a keyword.";
        return;
    }

    chrome.storage.local.get("topicKeywords", (result) => {

        const allKeywords = result.topicKeywords ?? {};

        const keywords = allKeywords[topic] ?? [];

        if (keywords.includes(keyword)) {
            topicKeywordMessage.textContent =
                "This keyword already exists in this topic.";
            return;
        }

        const updatedAllKeywords = {
            ...allKeywords,
            [topic]: [...keywords, keyword]
        };

        chrome.storage.local.set(
            { topicKeywords: updatedAllKeywords },
            () => {

                if (chrome.runtime.lastError) {
                    topicKeywordMessage.textContent =
                        "Could not add keyword. Please try again.";
                    return;
                }

                topicKeywordInput.value = "";

                topicKeywordMessage.textContent =
                    "Topic keyword added successfully!";

                renderTopicKeywords(topic);

            }
        );

    });

}


// Add button and Enter key support
addTopicKeywordBtn.addEventListener("click", addTopicKeyword);

topicKeywordInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        addTopicKeyword();
    }

});


// Extract a YouTube Channel ID

// Extract a YouTube channel handle from input
function extractChannelHandle(input) {

    const value = input.trim();

    // Direct handle: @FactTechz
    if (/^@[A-Za-z0-9._-]+$/.test(value)) {
        return value;
    }

    try {
        const url = new URL(value);

        const validHosts = [
            "youtube.com",
            "www.youtube.com",
            "m.youtube.com"
        ];

        if (!validHosts.includes(url.hostname)) {
            return null;
        }

        const match = url.pathname.match(
            /^\/@([A-Za-z0-9._-]+)\/?$/
        );

        return match ? `@${match[1]}` : null;

    } catch {
        return null;
    }
}


// Extract a YouTube channel ID
function extractChannelId(input) {

    const value = input.trim();

    if (/^UC[A-Za-z0-9_-]{22}$/.test(value)) {
        return value;
    }

    try {
        const url = new URL(value);

        const validHosts = [
            "youtube.com",
            "www.youtube.com",
            "m.youtube.com"
        ];

        if (!validHosts.includes(url.hostname)) {
            return null;
        }

        const match = url.pathname.match(
            /^\/channel\/(UC[A-Za-z0-9_-]{22})\/?$/
        );

        return match ? match[1] : null;

    } catch {
        return null;
    }
}



// Extract a YouTube Video ID
function extractVideoId(input) {

    const value = input.trim();

    // Accept a raw video ID
    if (/^[A-Za-z0-9_-]{11}$/.test(value)) {
        return value;
    }

    try {
        const url = new URL(value);

        let videoId = null;

        if (
            url.hostname === "www.youtube.com" ||
            url.hostname === "youtube.com" ||
            url.hostname === "m.youtube.com"
        ) {
            if (url.pathname === "/watch") {
                videoId = url.searchParams.get("v");
            } else {
                const match = url.pathname.match(
                    /^\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})/
                );

                videoId = match ? match[1] : null;
            }
        }

        else if (
            url.hostname === "youtu.be" ||
            url.hostname === "www.youtu.be"
        ) {
            videoId = url.pathname.split("/")[1];
        }

        return videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)
            ? videoId
            : null;

    } catch {
        return null;
    }
}

// Initialize trusted channels and videos
function initializeTrustedContent() {

    chrome.storage.local.get(
        ["trustedChannels", "trustedVideos"],
        (result) => {

            const trustedChannels =
                Array.isArray(result.trustedChannels)
                    ? result.trustedChannels
                    : [];

            const trustedVideos =
                Array.isArray(result.trustedVideos)
                    ? result.trustedVideos
                    : [];

            chrome.storage.local.set(
                {
                    trustedChannels,
                    trustedVideos
                },
                () => {

                    if (chrome.runtime.lastError) {
                        trustedChannelMessage.textContent =
                            "Could not initialize trusted content.";
                        return;
                    }

                    renderTrustedChannels();
                    renderTrustedVideos();

                }
            );

        }
    );

}


// Display trusted channels

function renderTrustedChannels() {

    chrome.storage.local.get("trustedChannels", (result) => {

        const channels = result.trustedChannels ?? [];

        trustedChannelList.innerHTML = "";

        channels.forEach((channel) => {

            const li = document.createElement("li");

            // Channel logo
            if (channel.thumbnail) {

                const logo = document.createElement("img");

                logo.src = channel.thumbnail;
                logo.alt = "";
                logo.loading = "lazy";

                li.appendChild(logo);

            }

            // Channel name and ID
            const details = document.createElement("div");

            details.className = "trusted-channel-details";

            const name = document.createElement("strong");

            name.textContent = channel.name || channel.id;

            const id = document.createElement("small");

            id.textContent = channel.id;

            details.appendChild(name);
            details.appendChild(id);

            li.appendChild(details);

            // Remove button
            const removeBtn = document.createElement("button");

            removeBtn.textContent = "Remove";

            removeBtn.addEventListener("click", () => {

                const updated = channels.filter(
                    (item) => item.id !== channel.id
                );

                chrome.storage.local.set(
                    { trustedChannels: updated },
                    () => {

                        if (chrome.runtime.lastError) {
                            trustedChannelMessage.textContent =
                                "Could not remove channel.";
                            return;
                        }

                        trustedChannelMessage.textContent =
                            "Trusted channel removed!";

                        renderTrustedChannels();

                    }
                );

            });

            li.appendChild(removeBtn);

            trustedChannelList.appendChild(li);

        });

    });

}



// Display trusted videos
function renderTrustedVideos() {

    chrome.storage.local.get("trustedVideos", (result) => {

        const videos = result.trustedVideos ?? [];

        trustedVideoList.innerHTML = "";

        videos.forEach((video) => {

            const li = document.createElement("li");

            const thumbnail = document.createElement("img");

            if (video.thumbnail) {
                thumbnail.src = video.thumbnail;
                thumbnail.alt = "";
                thumbnail.width = 80;
                thumbnail.loading = "lazy";
                li.appendChild(thumbnail);
            }

            const title = document.createElement("span");
            title.textContent = video.title || video.id;

            li.appendChild(title);

            const removeBtn = document.createElement("button");

            removeBtn.textContent = "Remove";

            removeBtn.addEventListener("click", () => {

                const updated = videos.filter(
                    (item) => item.id !== video.id
                );

                chrome.storage.local.set(
                    { trustedVideos: updated },
                    () => {

                        if (chrome.runtime.lastError) {
                            trustedVideoMessage.textContent =
                                "Could not remove video.";
                            return;
                        }

                        trustedVideoMessage.textContent =
                            "Trusted video removed!";

                        renderTrustedVideos();

                    }
                );

            });

            li.appendChild(removeBtn);

            trustedVideoList.appendChild(li);

        });

    });

}


// Add a trusted channel

async function addTrustedChannel() {

    const input = trustedChannelInput.value.trim();

    if (!input) {
        trustedChannelMessage.textContent =
            "Please enter a channel URL, ID or @handle.";
        return;
    }

    trustedChannelMessage.textContent =
        "Fetching channel information...";

    try {

        const channel = await getChannelDetails(input);

        chrome.storage.local.get("trustedChannels", (result) => {

            const channels = result.trustedChannels ?? [];

            const exists = channels.some(
                (item) => item.id === channel.id
            );

            if (exists) {
                trustedChannelMessage.textContent =
                    "This channel is already trusted.";
                return;
            }

            const updated = [...channels, channel];

            chrome.storage.local.set(
                { trustedChannels: updated },
                () => {

                    if (chrome.runtime.lastError) {
                        trustedChannelMessage.textContent =
                            "Could not save channel.";
                        return;
                    }

                    trustedChannelInput.value = "";

                    trustedChannelMessage.textContent =
                        `${channel.name} added successfully!`;

                    renderTrustedChannels();

                }
            );

        });

    } catch (error) {

        trustedChannelMessage.textContent = error.message;

    }

}


// Add a trusted video

async function addTrustedVideo() {

    const input = trustedVideoInput.value.trim();

    if (!input) {
        trustedVideoMessage.textContent =
            "Please enter a video URL or ID.";
        return;
    }

    trustedVideoMessage.textContent =
        "Fetching video information...";

    try {

        const video = await getVideoDetails(input);

        chrome.storage.local.get("trustedVideos", (result) => {

            const videos = result.trustedVideos ?? [];

            const exists = videos.some(
                (item) => item.id === video.id
            );

            if (exists) {
                trustedVideoMessage.textContent =
                    "This video is already trusted.";
                return;
            }

            const updated = [...videos, video];

            chrome.storage.local.set(
                { trustedVideos: updated },
                () => {

                    if (chrome.runtime.lastError) {
                        trustedVideoMessage.textContent =
                            "Could not save video.";
                        return;
                    }

                    trustedVideoInput.value = "";

                    trustedVideoMessage.textContent =
                        `${video.title} added successfully!`;

                    renderTrustedVideos();

                }
            );

        });

    } catch (error) {

        trustedVideoMessage.textContent = error.message;

    }

}


// Trusted channel and video event listeners
addTrustedChannelBtn.addEventListener(
    "click",
    addTrustedChannel
);

addTrustedVideoBtn.addEventListener(
    "click",
    addTrustedVideo
);

trustedChannelInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        addTrustedChannel();
    }

});

trustedVideoInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        addTrustedVideo();
    }

});

// Initialize trusted content when popup loads
initializeTrustedContent();



// Retrieve channel information using YouTube Data API

async function getChannelDetails(input) {

    const value = input.trim();

    const channelId = extractChannelId(value);
    const handle = extractChannelHandle(value);

    if (!channelId && !handle) {
        throw new Error(
            "Enter a valid channel ID, channel URL or @handle."
        );
    }

    let endpoint =
        "https://www.googleapis.com/youtube/v3/channels" +
        "?part=snippet";

    if (channelId) {
        endpoint += `&id=${encodeURIComponent(channelId)}`;
    } else {
        endpoint += `&forHandle=${encodeURIComponent(handle)}`;
    }

    endpoint += `&key=${encodeURIComponent(YOUTUBE_API_KEY)}`;

    const response = await fetch(endpoint);

    if (!response.ok) {
        throw new Error(
            "Could not retrieve channel information. Check your API key and quota."
        );
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
        throw new Error("Channel not found.");
    }

    const channel = data.items[0];

    const thumbnails = channel.snippet.thumbnails ?? {};

    return {
        id: channel.id,
        name: channel.snippet.title,
        thumbnail:
            thumbnails.high?.url ??
            thumbnails.medium?.url ??
            thumbnails.default?.url ??
            ""
    };
}



// Retrieve video information using YouTube Data API
async function getVideoDetails(input) {

    const videoId = extractVideoId(input);

    if (!videoId) {
        throw new Error("Enter a valid YouTube video URL or ID.");
    }

    const endpoint =
        "https://www.googleapis.com/youtube/v3/videos" +
        `?part=snippet&id=${encodeURIComponent(videoId)}` +
        `&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(endpoint);

    if (!response.ok) {
        throw new Error("Could not retrieve video information.");
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
        throw new Error("Video not found or unavailable.");
    }

    const video = data.items[0];

    return {
        id: video.id,
        title: video.snippet.title,
        thumbnail:
            video.snippet.thumbnails.medium?.url ??
            video.snippet.thumbnails.default?.url ??
            ""
    };
}
