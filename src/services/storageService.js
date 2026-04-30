import { STORAGE_KEY, THEME_KEY } from '../app/config';
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
