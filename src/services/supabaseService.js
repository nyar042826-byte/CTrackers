import { SUPABASE_TITLES_TABLE } from '../app/config';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

function getHeaders(prefer) {
  const headers = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
  };

  if (prefer) headers.Prefer = prefer;
  return headers;
}

function getTableUrl(query = '') {
  return `${supabaseUrl}/rest/v1/${SUPABASE_TITLES_TABLE}${query}`;
}

async function requestSupabase(path, options = {}) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  const response = await fetch(path, options);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed with ${response.status}`);
  }

  const body = await response.text();
  return body ? JSON.parse(body) : null;
}

export async function loadSupabaseTitles(ownerKey) {
  const query = `?owner_key=eq.${encodeURIComponent(ownerKey)}&select=payload&order=updated_at.desc`;
  const rows = await requestSupabase(getTableUrl(query), { headers: getHeaders() });
  return rows.map((row) => row.payload).filter(Boolean);
}

export async function saveSupabaseTitles(ownerKey, titles) {
  const rows = titles.map((title) => ({
    id: title.id,
    owner_key: ownerKey,
    payload: title,
    updated_at: title.updatedAt || new Date().toISOString(),
  }));

  if (!rows.length) return;

  await requestSupabase(getTableUrl('?on_conflict=id'), {
    method: 'POST',
    headers: getHeaders('resolution=merge-duplicates,return=minimal'),
    body: JSON.stringify(rows),
  });
}

export async function deleteSupabaseTitles(ownerKey, ids) {
  if (!ids.length) return;

  const escapedIds = ids.map((id) => encodeURIComponent(id)).join(',');
  const query = `?owner_key=eq.${encodeURIComponent(ownerKey)}&id=in.(${escapedIds})`;

  await requestSupabase(getTableUrl(query), {
    method: 'DELETE',
    headers: getHeaders(),
  });
}

export async function syncSupabaseTitles(ownerKey, titles) {
  const remoteTitles = await loadSupabaseTitles(ownerKey);
  const localIds = new Set(titles.map((title) => title.id));
  const remoteIdsToDelete = remoteTitles.map((title) => title.id).filter((id) => !localIds.has(id));

  await deleteSupabaseTitles(ownerKey, remoteIdsToDelete);
  await saveSupabaseTitles(ownerKey, titles);

  return titles;
}
