const MANGADEX_API = 'https://api.mangadex.org';
const ALLOWED_PATHS = new Set(['/manga', '/manga/tag', '/chapter']);
const MANGA_ID_PATH = /^\/manga\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isAllowedPath(path) {
  return ALLOWED_PATHS.has(path) || MANGA_ID_PATH.test(path);
}

module.exports = async function handler(request, response) {
  const incomingUrl = new URL(request.url, `https://${request.headers.host || 'localhost'}`);
  const path = incomingUrl.searchParams.get('path');

  if (!path || !isAllowedPath(path)) {
    response.status(400).json({ error: 'Unsupported MangaDex path.' });
    return;
  }

  incomingUrl.searchParams.delete('path');
  const mangaDexUrl = new URL(`${MANGADEX_API}${path}`);
  incomingUrl.searchParams.forEach((value, key) => {
    mangaDexUrl.searchParams.append(key, value);
  });

  try {
    const mangaDexResponse = await fetch(mangaDexUrl, {
      headers: {
        accept: 'application/json',
        'user-agent': 'CTrackers/1.0 (+https://c-trackers.vercel.app)',
      },
    });
    const body = await mangaDexResponse.text();

    response.status(mangaDexResponse.status);
    response.setHeader('content-type', mangaDexResponse.headers.get('content-type') || 'application/json');
    response.send(body);
  } catch (error) {
    response.status(502).json({ error: 'Could not connect to MangaDex.' });
  }
};
