const MANGADEX_API = 'https://api.mangadex.org';
const MANGADEX_COVERS = 'https://uploads.mangadex.org/covers';
const DEFAULT_CONTENT_RATINGS = ['safe', 'suggestive'];
const MANGADEX_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TITLE_TYPE_API_SOURCES = {
  all: MANGADEX_API,
  manhwa: MANGADEX_API,
  manga: MANGADEX_API,
  manhua: MANGADEX_API,
  webtoon: MANGADEX_API,
};
const TITLE_TYPE_LANGUAGES = {
  manhwa: ['ko'],
  manga: ['ja'],
  manhua: ['zh', 'zh-hk'],
};

let cachedTags;

function appendArrayParam(params, key, values) {
  values.forEach((value) => params.append(`${key}[]`, value));
}

function getLocalizedText(value, fallback = 'Unknown') {
  if (!value) return fallback;
  return value.en || value['ko-ro'] || value.ko || Object.values(value)[0] || fallback;
}

function getMangaDexIdFromQuery(query) {
  const trimmedQuery = query.trim();
  const directMatch = trimmedQuery.match(MANGADEX_ID_PATTERN);
  if (directMatch) return directMatch[0];

  try {
    const url = new URL(trimmedQuery);
    const titleIndex = url.pathname.split('/').findIndex((part) => part === 'title');
    const id = titleIndex >= 0 ? url.pathname.split('/')[titleIndex + 1] : '';
    return MANGADEX_ID_PATTERN.test(id) ? id : '';
  } catch (error) {
    return '';
  }
}

function getRelationship(item, type) {
  return item.relationships?.find((relationship) => relationship.type === type);
}

function getCoverUrl(manga) {
  const cover = getRelationship(manga, 'cover_art');
  const fileName = cover?.attributes?.fileName;
  return fileName ? `${MANGADEX_COVERS}/${manga.id}/${fileName}.256.jpg` : '';
}

function getCreatorName(manga) {
  const author = getRelationship(manga, 'author') || getRelationship(manga, 'artist');
  return author?.attributes?.name || 'Unknown creator';
}

function getMangaDexStatus(status) {
  if (status === 'completed') return 'completed';
  if (status === 'hiatus') return 'paused';
  if (status === 'cancelled') return 'dropped';
  return 'reading';
}

async function requestMangaDex(path, params, titleType = 'all') {
  const query = params ? `?${params.toString()}` : '';
  const apiSource = TITLE_TYPE_API_SOURCES[titleType] || MANGADEX_API;
  let response;

  try {
    response = await fetch(`${apiSource}${path}${query}`);
  } catch (error) {
    const networkError = new Error('Could not connect to MangaDex. Check your internet connection, VPN, firewall, or DNS settings.');
    networkError.userMessage = networkError.message;
    throw networkError;
  }

  if (!response.ok) {
    const error = new Error(`MangaDex request failed with ${response.status}`);
    if (response.status === 403) error.userMessage = 'MangaDex blocked this request. Try again later or disable VPN/proxy filtering.';
    if (response.status === 429) error.userMessage = 'MangaDex rate limit reached. Wait a minute, then search again.';
    if (response.status >= 500) error.userMessage = 'MangaDex is having server trouble. Try again later.';
    throw error;
  }

  try {
    return await response.json();
  } catch (error) {
    const parseError = new Error('MangaDex returned an unexpected response.');
    parseError.userMessage = parseError.message;
    throw parseError;
  }
}

async function getMangaDexTags() {
  if (cachedTags) return cachedTags;

  const payload = await requestMangaDex('/manga/tag');
  cachedTags = payload.data || [];
  return cachedTags;
}

async function getTagIdByName(name) {
  const tags = await getMangaDexTags();
  return tags.find((tag) => getLocalizedText(tag.attributes?.name, '').toLowerCase() === name.toLowerCase())?.id;
}

function buildMangaSearchParams(titleType) {
  const params = new URLSearchParams({
    limit: '12',
    hasAvailableChapters: 'true',
    'order[followedCount]': 'desc',
    'order[relevance]': 'desc',
  });

  const originalLanguages = TITLE_TYPE_LANGUAGES[titleType] || [];
  appendArrayParam(params, 'originalLanguage', originalLanguages);
  params.append('availableTranslatedLanguage[]', 'en');
  appendMangaIncludes(params);
  appendArrayParam(params, 'contentRating', DEFAULT_CONTENT_RATINGS);
  return params;
}

function buildMangaDetailParams() {
  const params = new URLSearchParams();
  appendMangaIncludes(params);
  return params;
}

function appendMangaIncludes(params) {
  params.append('includes[]', 'cover_art');
  params.append('includes[]', 'author');
  params.append('includes[]', 'artist');
}

async function enrichMangaDexTitle(manga) {
  const latestChapter = await fetchLatestMangaDexChapter(manga.id).catch(() => 1);
  const attributes = manga.attributes || {};

  return {
    id: manga.id,
    title: getLocalizedText(attributes.title, 'Untitled title'),
    author: getCreatorName(manga),
    description: getLocalizedText(attributes.description, ''),
    genres: (attributes.tags || [])
      .map((tag) => getLocalizedText(tag.attributes?.name, ''))
      .filter(Boolean)
      .slice(0, 4),
    latestChapter,
    status: getMangaDexStatus(attributes.status),
    coverUrl: getCoverUrl(manga),
    updatedAt: attributes.updatedAt || attributes.createdAt || new Date().toISOString(),
    sourceUrl: `https://mangadex.org/title/${manga.id}`,
  };
}

export async function fetchLatestMangaDexChapter(mangaId, translatedLanguage = 'en') {
  const params = new URLSearchParams({
    limit: '1',
    'order[chapter]': 'desc',
    'order[readableAt]': 'desc',
    includeFutureUpdates: '0',
  });
  params.append('manga', mangaId);
  params.append('translatedLanguage[]', translatedLanguage);
  appendArrayParam(params, 'contentRating', DEFAULT_CONTENT_RATINGS);

  const payload = await requestMangaDex('/chapter', params);
  const chapter = payload.data?.[0]?.attributes?.chapter;
  const parsedChapter = Number.parseFloat(chapter);
  return Number.isFinite(parsedChapter) ? parsedChapter : 1;
}

export async function searchMangaDexTitles(query, titleType = 'all') {
  const mangaDexId = getMangaDexIdFromQuery(query);
  const params = buildMangaSearchParams(titleType);

  if (mangaDexId) {
    const payload = await requestMangaDex(`/manga/${mangaDexId}`, buildMangaDetailParams(), titleType);
    return payload.data ? [await enrichMangaDexTitle(payload.data)] : [];
  }

  params.set('title', query.trim());

  if (titleType === 'webtoon') {
    const longStripTagId = await getTagIdByName('Long Strip');
    if (longStripTagId) params.append('includedTags[]', longStripTagId);
  }

  const payload = await requestMangaDex('/manga', params, titleType);
  const items = payload.data || [];
  return Promise.all(items.map(enrichMangaDexTitle));
}
