const MANGADEX_API = 'https://api.mangadex.org';
const MANGADEX_COVERS = 'https://uploads.mangadex.org/covers';
const DEFAULT_CONTENT_RATINGS = ['safe', 'suggestive'];
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

async function requestMangaDex(path, params) {
  const query = params ? `?${params.toString()}` : '';
  const response = await fetch(`${MANGADEX_API}${path}${query}`);

  if (!response.ok) {
    throw new Error(`MangaDex request failed with ${response.status}`);
  }

  return response.json();
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
  const params = new URLSearchParams({
    title: query,
    limit: '12',
    'order[followedCount]': 'desc',
  });

  const originalLanguages = TITLE_TYPE_LANGUAGES[titleType] || [];
  appendArrayParam(params, 'originalLanguage', originalLanguages);
  params.append('availableTranslatedLanguage[]', 'en');
  params.append('includes[]', 'cover_art');
  params.append('includes[]', 'author');
  params.append('includes[]', 'artist');
  appendArrayParam(params, 'contentRating', DEFAULT_CONTENT_RATINGS);

  if (titleType === 'webtoon') {
    const longStripTagId = await getTagIdByName('Long Strip');
    if (longStripTagId) params.append('includedTags[]', longStripTagId);
  }

  const payload = await requestMangaDex('/manga', params);
  const items = payload.data || [];

  const results = await Promise.all(
    items.map(async (manga) => {
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
    })
  );

  return results;
}
