import { STORAGE_KEY, SUPABASE_OWNER_KEY, THEME_KEY } from '../app/config';
import { seedTitles } from '../types/title';

export function loadTitles() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : seedTitles;
  } catch (error) {
    return seedTitles;
  }
}

export function saveTitles(titles) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(titles));
}

export function loadTheme() {
  return window.localStorage.getItem(THEME_KEY) || 'dark';
}

export function saveTheme(theme) {
  window.localStorage.setItem(THEME_KEY, theme);
}

export function loadSupabaseOwnerKey() {
  const saved = window.localStorage.getItem(SUPABASE_OWNER_KEY);
  if (saved) return saved;

  const ownerKey = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(SUPABASE_OWNER_KEY, ownerKey);
  return ownerKey;
}
