import { useEffect, useMemo, useRef, useState } from 'react';
import { blankTitleForm, seedTitles } from '../types/title';
import { fetchLatestMangaDexChapter, searchMangaDexTitles as searchMangaDexTitlesApi } from '../services/mangadexService';
import { loadSupabaseOwnerKey, loadTheme, loadTitles, saveTheme, saveTitles } from '../services/storageService';
import {
  isSupabaseConfigured,
  loadSupabaseTitles,
  saveSupabaseTitles,
  syncSupabaseTitles,
} from '../services/supabaseService';
import {
  calculateStats,
  createTitleId,
  filterAndSortTitles,
  formatGenres,
  normalizeImportedTitle,
  normalizeTitleForm,
} from '../services/titleService';

export function useCTrackerStore() {
  const isSupabaseEnabled = isSupabaseConfigured();
  const hasCheckedSupabaseRef = useRef(!isSupabaseEnabled);
  const [titles, setTitles] = useState(loadTitles);
  const initialTitlesRef = useRef(titles);
  const [activeView, setActiveView] = useState('dashboard');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankTitleForm);
  const [theme, setTheme] = useState(loadTheme);
  const [supabaseOwnerKey] = useState(loadSupabaseOwnerKey);
  const [supabaseStatus, setSupabaseStatus] = useState(isSupabaseEnabled ? 'ready' : 'missing-config');
  const [supabaseMessage, setSupabaseMessage] = useState(
    isSupabaseEnabled ? 'Supabase is configured.' : 'Add Supabase env values to enable cloud sync.'
  );
  const [mangaDexQuery, setMangaDexQuery] = useState('');
  const [mangaDexType, setMangaDexType] = useState('all');
  const [mangaDexResults, setMangaDexResults] = useState([]);
  const [mangaDexError, setMangaDexError] = useState('');
  const [isMangaDexSearching, setIsMangaDexSearching] = useState(false);
  const [isMangaDexSyncing, setIsMangaDexSyncing] = useState(false);

  useEffect(() => {
    saveTitles(titles);

    if (!isSupabaseEnabled || !hasCheckedSupabaseRef.current) return undefined;

    setSupabaseStatus('syncing');
    setSupabaseMessage('Saving live changes to Supabase...');

    const timeoutId = window.setTimeout(() => {
      syncSupabaseTitles(supabaseOwnerKey, titles)
        .then(() => {
          setSupabaseStatus('ready');
          setSupabaseMessage(`Live synced ${titles.length} title${titles.length === 1 ? '' : 's'} to Supabase.`);
        })
        .catch(() => {
          setSupabaseStatus('error');
          setSupabaseMessage('Live Supabase sync failed. Check your connection and table policies.');
        });
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [isSupabaseEnabled, supabaseOwnerKey, titles]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!isSupabaseEnabled) return undefined;

    let isCurrent = true;
    setSupabaseStatus('syncing');
    setSupabaseMessage('Checking Supabase for saved library data...');

    loadSupabaseTitles(supabaseOwnerKey)
      .then((remoteTitles) => {
        if (!isCurrent) return;
        if (remoteTitles.length) {
          setTitles(remoteTitles.filter((title) => title && title.title).map(normalizeImportedTitle));
          setSupabaseMessage(`Loaded ${remoteTitles.length} title${remoteTitles.length === 1 ? '' : 's'} from Supabase.`);
        } else {
          syncSupabaseTitles(supabaseOwnerKey, initialTitlesRef.current)
            .then(() => {
              if (isCurrent) setSupabaseMessage('Supabase is connected. Local library was uploaded to cloud.');
            })
            .catch(() => {
              if (isCurrent) setSupabaseMessage('Supabase is connected, but the initial local upload failed.');
            });
        }
        hasCheckedSupabaseRef.current = true;
        setSupabaseStatus('ready');
      })
      .catch(() => {
        if (!isCurrent) return;
        hasCheckedSupabaseRef.current = true;
        setSupabaseStatus('error');
        setSupabaseMessage('Supabase connection failed. Check your env values and table schema.');
      });

    return () => {
      isCurrent = false;
    };
  }, [isSupabaseEnabled, supabaseOwnerKey]);

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
      setMangaDexError('MangaDex could not be reached. Check your connection and try again.');
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
        .catch(() => {
          if (isCurrent) {
            setMangaDexResults([]);
            setMangaDexError('MangaDex could not be reached. Check your connection and try again.');
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
    () => filterAndSortTitles(titles, query, statusFilter, sortBy),
    [query, sortBy, statusFilter, titles]
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

    if (!isSupabaseEnabled) return;

    setSupabaseStatus('syncing');
    setSupabaseMessage(`Saving ${nextTitle.title} to Supabase...`);

    try {
      await saveSupabaseTitles(supabaseOwnerKey, [nextTitle]);
      setSupabaseStatus('ready');
      setSupabaseMessage(`${nextTitle.title} was saved to Supabase.`);
    } catch (error) {
      setSupabaseStatus('error');
      setSupabaseMessage(`${nextTitle.title} was added locally, but Supabase save failed.`);
    }
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

  async function pullSupabaseLibrary() {
    if (!isSupabaseConfigured()) return;

    setSupabaseStatus('syncing');
    setSupabaseMessage('Pulling titles from Supabase...');

    try {
      const remoteTitles = await loadSupabaseTitles(supabaseOwnerKey);
      setTitles(remoteTitles.filter((title) => title && title.title).map(normalizeImportedTitle));
      setSupabaseStatus('ready');
      setSupabaseMessage(`Pulled ${remoteTitles.length} title${remoteTitles.length === 1 ? '' : 's'} from Supabase.`);
    } catch (error) {
      setSupabaseStatus('error');
      setSupabaseMessage('Could not pull from Supabase. Check your connection and table policies.');
    }
  }

  async function pushSupabaseLibrary() {
    if (!isSupabaseConfigured()) return;

    setSupabaseStatus('syncing');
    setSupabaseMessage('Pushing local titles to Supabase...');

    try {
      await saveSupabaseTitles(supabaseOwnerKey, titles);
      setSupabaseStatus('ready');
      setSupabaseMessage(`Pushed ${titles.length} title${titles.length === 1 ? '' : 's'} to Supabase.`);
    } catch (error) {
      setSupabaseStatus('error');
      setSupabaseMessage('Could not push to Supabase. Check your connection and table policies.');
    }
  }

  async function syncSupabaseLibrary() {
    if (!isSupabaseConfigured()) return;

    setSupabaseStatus('syncing');
    setSupabaseMessage('Syncing local library to Supabase...');

    try {
      await syncSupabaseTitles(supabaseOwnerKey, titles);
      setSupabaseStatus('ready');
      setSupabaseMessage('Supabase now matches this local library.');
    } catch (error) {
      setSupabaseStatus('error');
      setSupabaseMessage('Could not sync Supabase. Check your connection and table policies.');
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
    query,
    reminderTitles,
    removeTitle,
    resetForm,
    setActiveView,
    setMangaDexQuery,
    setMangaDexType,
    setQuery,
    setSortBy,
    setStatusFilter,
    setTheme,
    setTitles,
    sortBy,
    stats,
    statusFilter,
    submitTitle,
    supabaseMessage,
    supabaseOwnerKey,
    supabaseStatus,
    searchMangaDexTitles,
    syncMangaDexTitles,
    pullSupabaseLibrary,
    pushSupabaseLibrary,
    syncSupabaseLibrary,
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
