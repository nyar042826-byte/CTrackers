import { useEffect, useMemo, useState } from 'react';
import { blankTitleForm, seedTitles } from '../types/title';
import { fetchLatestMangaDexChapter, searchMangaDexTitles as searchMangaDexTitlesApi } from '../services/mangadexService';
import { loadTheme, loadTitles, saveTheme, saveTitles } from '../services/storageService';
import {
  calculateStats,
  createTitleId,
  filterAndSortTitles,
  formatGenres,
  normalizeImportedTitle,
  normalizeTitleForm,
} from '../services/titleService';

export function useCTrackerStore() {
  const [titles, setTitles] = useState(loadTitles);
  const [activeView, setActiveView] = useState('dashboard');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankTitleForm);
  const [theme, setTheme] = useState(loadTheme);
  const [mangaDexQuery, setMangaDexQuery] = useState('');
  const [mangaDexType, setMangaDexType] = useState('all');
  const [mangaDexResults, setMangaDexResults] = useState([]);
  const [mangaDexError, setMangaDexError] = useState('');
  const [isMangaDexSearching, setIsMangaDexSearching] = useState(false);
  const [isMangaDexSyncing, setIsMangaDexSyncing] = useState(false);

  useEffect(() => {
    saveTitles(titles);
  }, [titles]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  async function fetchMangaDexResults(searchQuery) {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 2) {
      setMangaDexResults([]);
      setMangaDexError('');
      setIsMangaDexSearching(false);
      return;
    }

    setIsMangaDexSearching(true);
    setMangaDexError('');

    try {
      const results = await searchMangaDexTitlesApi(trimmedQuery, mangaDexType);
      setMangaDexResults(results);
    } catch (error) {
      setMangaDexResults([]);
      setMangaDexError(error.userMessage || 'MangaDex could not be reached. Check your connection and try again.');
    } finally {
      setIsMangaDexSearching(false);
    }
  }

  useEffect(() => {
    const trimmedQuery = mangaDexQuery.trim();

    if (trimmedQuery.length < 2) {
      setMangaDexResults([]);
      setMangaDexError('');
      setIsMangaDexSearching(false);
      return undefined;
    }

    let isCurrent = true;
    setIsMangaDexSearching(true);
    setMangaDexError('');

    const timeoutId = window.setTimeout(() => {
      searchMangaDexTitlesApi(trimmedQuery, mangaDexType)
        .then((results) => {
          if (isCurrent) setMangaDexResults(results);
        })
        .catch((error) => {
          if (isCurrent) {
            setMangaDexResults([]);
            setMangaDexError(error.userMessage || 'MangaDex could not be reached. Check your connection and try again.');
          }
        })
        .finally(() => {
          if (isCurrent) setIsMangaDexSearching(false);
        });
    }, 450);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [mangaDexQuery, mangaDexType]);

  const stats = useMemo(() => calculateStats(titles), [titles]);

  const filteredTitles = useMemo(
    () => filterAndSortTitles(titles, '', statusFilter, sortBy),
    [sortBy, statusFilter, titles]
  );

  const continueReading = useMemo(
    () => titles.filter((title) => title.status === 'reading' && title.currentChapter < title.latestChapter).slice(0, 3),
    [titles]
  );

  const reminderTitles = useMemo(
    () => titles.filter((title) => title.reminder).sort((a, b) => a.title.localeCompare(b.title)).slice(0, 4),
    [titles]
  );

  const behindTitles = useMemo(
    () =>
      titles
        .filter((title) => title.latestChapter > title.currentChapter)
        .sort((a, b) => b.latestChapter - b.currentChapter - (a.latestChapter - a.currentChapter))
        .slice(0, 4),
    [titles]
  );

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(blankTitleForm);
  }

  function submitTitle(event) {
    event.preventDefault();
    if (!form.title.trim()) return;

    const payload = normalizeTitleForm(form);

    if (editingId) {
      setTitles((current) => current.map((title) => (title.id === editingId ? { ...title, ...payload } : title)));
    } else {
      setTitles((current) => [
        {
          ...payload,
          id: createTitleId(payload.title),
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
    }

    resetForm();
  }

  function editTitle(title) {
    setActiveView('library');
    setEditingId(title.id);
    setForm({
      ...title,
      genres: formatGenres(title.genres || []),
      rating: title.rating || 0,
      reminder: title.reminder || '',
      notes: title.notes || '',
    });
  }

  function removeTitle(id) {
    setTitles((current) => current.filter((title) => title.id !== id));
    if (editingId === id) resetForm();
  }

  function toggleFavorite(id) {
    setTitles((current) =>
      current.map((title) =>
        title.id === id ? { ...title, isFavorite: !title.isFavorite, updatedAt: new Date().toISOString() } : title
      )
    );
  }

  function advanceChapter(id, amount) {
    setTitles((current) =>
      current.map((title) => {
        if (title.id !== id) return title;
        const nextChapter = Math.min(title.latestChapter, Math.max(0, title.currentChapter + amount));
        const nextStatus = nextChapter >= title.latestChapter ? 'completed' : title.status === 'completed' ? 'reading' : title.status;
        return { ...title, currentChapter: nextChapter, status: nextStatus, updatedAt: new Date().toISOString() };
      })
    );
  }

  function updateLatestChapter(id, value) {
    setTitles((current) =>
      current.map((title) => {
        if (title.id !== id) return title;
        const latestChapter = Math.max(1, Number(value) || 1);
        return {
          ...title,
          latestChapter,
          currentChapter: Math.min(title.currentChapter, latestChapter),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }

  async function addMangaDexTitle(mangaDexTitle) {
    const existingTitle = titles.find((title) => title.mangaDexId === mangaDexTitle.id);
    const payload = {
      title: mangaDexTitle.title,
      author: mangaDexTitle.author,
      genres: mangaDexTitle.genres,
      currentChapter: existingTitle?.currentChapter || 0,
      latestChapter: mangaDexTitle.latestChapter,
      status: mangaDexTitle.status,
      rating: existingTitle?.rating || 0,
      notes: existingTitle?.notes || `Imported from MangaDex: ${mangaDexTitle.sourceUrl}`,
      reminder: existingTitle?.reminder || '',
      isFavorite: existingTitle?.isFavorite || false,
      coverUrl: mangaDexTitle.coverUrl,
      mangaDexId: mangaDexTitle.id,
      source: 'MangaDex',
      sourceUrl: mangaDexTitle.sourceUrl,
      updatedAt: new Date().toISOString(),
    };
    const nextTitle = existingTitle
      ? { ...existingTitle, ...payload }
      : {
          ...payload,
          id: createTitleId(payload.title),
          createdAt: new Date().toISOString(),
        };

    setTitles((current) => {
      if (existingTitle) return current.map((title) => (title.id === existingTitle.id ? nextTitle : title));
      return [nextTitle, ...current];
    });
    setMangaDexResults([]);

  }

  function searchMangaDexTitles(event) {
    event.preventDefault();
    fetchMangaDexResults(mangaDexQuery);
  }

  async function syncMangaDexTitles() {
    const trackedTitles = titles.filter((title) => title.mangaDexId);
    if (!trackedTitles.length) return;

    setIsMangaDexSyncing(true);
    setMangaDexError('');

    try {
      const latestChapters = await Promise.all(
        trackedTitles.map(async (title) => ({
          id: title.id,
          latestChapter: await fetchLatestMangaDexChapter(title.mangaDexId),
        }))
      );
      const latestById = new Map(latestChapters.map((item) => [item.id, item.latestChapter]));

      setTitles((current) =>
        current.map((title) => {
          const latestChapter = latestById.get(title.id);
          if (!latestChapter) return title;
          return {
            ...title,
            latestChapter,
            currentChapter: Math.min(title.currentChapter, latestChapter),
            updatedAt: new Date().toISOString(),
          };
        })
      );
    } catch (error) {
      setMangaDexError('MangaDex sync failed. Try again in a moment.');
    } finally {
      setIsMangaDexSyncing(false);
    }
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(titles, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ctracker-backup.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result));
        if (!Array.isArray(imported)) throw new Error('Expected an array of titles.');
        setTitles(imported.filter((title) => title && title.title).map(normalizeImportedTitle));
      } catch (error) {
        window.alert('That backup could not be imported. Please choose a valid CTracker JSON file.');
      }
    };
    reader.readAsText(file);
  }

  return {
    activeView,
    advanceChapter,
    behindTitles,
    continueReading,
    editTitle,
    editingId,
    exportData,
    filteredTitles,
    form,
    importData,
    isMangaDexSearching,
    isMangaDexSyncing,
    mangaDexError,
    mangaDexQuery,
    mangaDexResults,
    mangaDexType,
    reminderTitles,
    removeTitle,
    resetForm,
    setActiveView,
    setMangaDexQuery,
    setMangaDexType,
    setSortBy,
    setStatusFilter,
    setTheme,
    setTitles,
    sortBy,
    stats,
    statusFilter,
    submitTitle,
    searchMangaDexTitles,
    syncMangaDexTitles,
    theme,
    titles,
    toggleFavorite,
    updateLatestChapter,
    updateForm,
    addMangaDexTitle,
    loadSamples: () => setTitles(seedTitles),
    clearLibrary: () => {
      if (window.confirm('Clear every title from this browser?')) setTitles([]);
    },
  };
}
