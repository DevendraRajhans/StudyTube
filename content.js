
let studyMode = false;

let distractingKeywords = [
  "gaming",
  "gameplay",
  "minecraft",
  "fortnite",
  "comedy",
  "prank",
  "funny moments",
  "reaction video"
];

let trustedChannels = [];
let trustedVideos = [];

// ==========================================
// 1. VIDEO AND CHANNEL IDENTIFICATION
// ==========================================

function extractVideoId(url) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url, location.origin);

    if (parsedUrl.pathname === "/watch") {
      const id = parsedUrl.searchParams.get("v");
      return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }

    const match = parsedUrl.pathname.match(
      /^\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})/
    );

    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function findChannelId(data, visited = new WeakSet(), depth = 0) {
  if (!data || typeof data !== "object" || depth > 15) {
    return null;
  }

  if (visited.has(data)) return null;
  visited.add(data);

  if (
    typeof data.browseId === "string" &&
    /^UC[A-Za-z0-9_-]{22}$/.test(data.browseId)
  ) {
    return data.browseId;
  }

  for (const value of Object.values(data)) {
    const result = findChannelId(value, visited, depth + 1);

    if (result) return result;
  }

  return null;
}

function getChannelId(card) {
  if (!card) return null;

  // Read YouTube renderer metadata.
  const metadata = card.data || card.__data?.data;
  const channelId = findChannelId(metadata);

  if (channelId) return channelId;

  // Fallback: direct channel URL.
  const channelLink = card.querySelector(
    'a[href*="/channel/"]'
  );

  if (channelLink) {
    const match = channelLink.href.match(
      /\/channel\/(UC[A-Za-z0-9_-]{22})/
    );

    if (match) return match[1];
  }

  return null;
}

function getVideoId(card) {
  if (!card) return null;

  const links = card.querySelectorAll(
    'a[href*="/watch?v="], a[href*="/shorts/"]'
  );

  for (const link of links) {
    const id = extractVideoId(link.href);
    if (id) return id;
  }

  return null;
}

// ==========================================
// 2. TRUSTED CONTENT CHECK
// ==========================================

function isTrustedVideo(card) {
  const videoId = getVideoId(card);

  if (
    videoId &&
    trustedVideos.some(video => video.id === videoId)
  ) {
    return true;
  }

  const channelId = getChannelId(card);

  if (
    channelId &&
    trustedChannels.some(channel => channel.id === channelId)
  ) {
    return true;
  }

  return false;
}

// ==========================================
// 3. DISTRACTING VIDEO FILTER
// ==========================================

function filterDistractingVideos() {
  const videoCards = document.querySelectorAll(
    "ytd-rich-item-renderer, " +
    "ytd-video-renderer, " +
    "ytd-grid-video-renderer, " +
    "ytd-compact-video-renderer"
  );

  videoCards.forEach(card => {
    const titleElement = card.querySelector(
      "#video-title, h3 a, a#video-title"
    );

    if (!titleElement) return;

    // Shorts are handled separately and remain blocked.
    const isShort = Boolean(
      card.querySelector('a[href*="/shorts/"]')
    );

    if (isShort) {
      if (card.dataset.studyTubeDistracting === "true") {
        card.style.removeProperty("display");
        delete card.dataset.studyTubeDistracting;
      }
      return;
    }

    const title = titleElement.textContent.trim().toLowerCase();

    // Study Mode OFF: restore previously hidden cards.
    if (!studyMode) {
      if (card.dataset.studyTubeDistracting === "true") {
        card.style.removeProperty("display");
        delete card.dataset.studyTubeDistracting;
      }
      return;
    }

    // Trusted video/channel overrides keyword filtering.
    if (isTrustedVideo(card)) {
      if (card.dataset.studyTubeDistracting === "true") {
        card.style.removeProperty("display");
        delete card.dataset.studyTubeDistracting;
      }
      return;
    }

    // Apply global distracting keywords.
    const isDistracting = distractingKeywords.some(keyword =>
      title.includes(keyword.toLowerCase())
    );

    if (isDistracting) {
      card.dataset.studyTubeDistracting = "true";
      card.style.setProperty("display", "none", "important");
    } else if (card.dataset.studyTubeDistracting === "true") {
      card.style.removeProperty("display");
      delete card.dataset.studyTubeDistracting;
    }
  });
}

// ==========================================
// 4. SHORTS BLOCKER
// ==========================================

function applyStudyMode() {
  // Block direct Shorts URLs.
  if (studyMode && location.pathname.startsWith("/shorts")) {
    location.replace("https://www.youtube.com/");
    return;
  }

  const shortsLinks = document.querySelectorAll(
    'a[href*="/shorts/"]'
  );

  shortsLinks.forEach(link => {
    const shelf = link.closest("ytd-rich-shelf-renderer");

    const card = link.closest([
      "ytd-video-renderer",
      "ytd-rich-item-renderer",
      "ytd-reel-item-renderer",
      "ytd-grid-video-renderer",
      "ytd-compact-video-renderer",
      "ytd-item-section-renderer"
    ].join(","));

    const container = shelf || card;

    if (!container) return;

    if (studyMode) {
      container.dataset.studyTubeHidden = "true";
      container.style.setProperty("display", "none", "important");
    } else if (container.dataset.studyTubeHidden === "true") {
      container.style.removeProperty("display");
      delete container.dataset.studyTubeHidden;
    }
  });

  filterDistractingVideos();
}

// ==========================================
// 5. LOAD SETTINGS FROM CHROME STORAGE
// ==========================================

function loadSettings() {
  chrome.storage.local.get(
    [
      "studyMode",
      "distractingKeywords",
      "trustedChannels",
      "trustedVideos"
    ],
    result => {
      if (chrome.runtime.lastError) {
        console.error(
          "StudyTube storage error:",
          chrome.runtime.lastError.message
        );
        return;
      }

      studyMode = result.studyMode ?? false;

      distractingKeywords =
        result.distractingKeywords ?? distractingKeywords;

      trustedChannels = result.trustedChannels ?? [];
      trustedVideos = result.trustedVideos ?? [];

      applyStudyMode();
    }
  );
}

// ==========================================
// 6. LIVE STORAGE SYNCHRONIZATION
// ==========================================

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;

  if (changes.studyMode) {
    studyMode = changes.studyMode.newValue ?? false;
  }

  if (changes.distractingKeywords) {
    distractingKeywords =
      changes.distractingKeywords.newValue ?? [];
  }

  if (changes.trustedChannels) {
    trustedChannels =
      changes.trustedChannels.newValue ?? [];
  }

  if (changes.trustedVideos) {
    trustedVideos =
      changes.trustedVideos.newValue ?? [];
  }

  applyStudyMode();
});

// ==========================================
// 7. DYNAMIC YOUTUBE CONTENT
// ==========================================

const observer = new MutationObserver(() => {
  applyStudyMode();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// ==========================================
// 8. YOUTUBE NAVIGATION
// ==========================================

document.addEventListener("yt-navigate-finish", applyStudyMode);

window.addEventListener("popstate", applyStudyMode);

// ==========================================
// 9. INITIALIZE
// ==========================================

loadSettings();
