export function clampChapter(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function formatGenres(genres) {
  return genres.filter(Boolean).join(', ');
}

export function getCompletion(title) {
  if (!title.latestChapter) return 0;
  return Math.min(100, Math.round((title.currentChapter / title.latestChapter) * 100));
}

export function normalizeTitleForm(form) {
  const currentChapter = clampChapter(form.currentChapter);
  const latestChapter = Math.max(1, clampChapter(form.latestChapter));

  return {
    ...form,
    title: form.title.trim(),
    author: form.author.trim() || 'Unknown creator',
    genres: form.genres.split(',').map((genre) => genre.trim()).filter(Boolean),
    currentChapter: Math.min(currentChapter, latestChapter),
    latestChapter,
    rating: Math.min(5, clampChapter(form.rating)),
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeImportedTitle(title) {
  const normalized = normalizeTitleForm({
    title: title.title || '',
    author: title.author || '',
    genres: Array.isArray(title.genres) ? formatGenres(title.genres) : title.genres || '',
    currentChapter: title.currentChapter || 0,
    latestChapter: title.latestChapter || 1,
    status: title.status || 'planned',
    rating: title.rating || 0,
    notes: title.notes || '',
    reminder: title.reminder || '',
    isFavorite: Boolean(title.isFavorite),
    coverUrl: title.coverUrl || '',
    mangaDexId: title.mangaDexId || '',
    source: title.source || '',
    sourceUrl: title.sourceUrl || '',
  });

  return {
    ...normalized,
    id: title.id || createTitleId(normalized.title),
    createdAt: title.createdAt || new Date().toISOString(),
    updatedAt: title.updatedAt || new Date().toISOString(),
  };
}

export function createTitleId(title) {
  return `${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

export function calculateStats(titles) {
  const total = titles.length;
  const completed = titles.filter((title) => title.status === 'completed').length;
  const favorites = titles.filter((title) => title.isFavorite).length;
  const behind = titles.filter((title) => title.latestChapter > title.currentChapter).length;
  const chaptersRead = titles.reduce((sum, title) => sum + Number(title.currentChapter || 0), 0);
  const averageProgress = total
    ? Math.round(titles.reduce((sum, title) => sum + getCompletion(title), 0) / total)
    : 0;

  const activeReminders = titles.filter((title) => Boolean(title.reminder)).length;

  return { total, completed, favorites, behind, chaptersRead, averageProgress, activeReminders };
}

export function filterAndSortTitles(titles, query, statusFilter, sortBy) {
  const normalizedQuery = query.trim().toLowerCase();

  return titles
    .filter((title) => {
      const haystack = [title.title, title.author, title.status, ...(title.genres || [])]
        .join(' ')
        .toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      const matchesStatus = statusFilter === 'all' || title.status === statusFilter;
      return matchesQuery && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'progress') return getCompletion(b) - getCompletion(a);
      if (sortBy === 'rating') return Number(b.rating || 0) - Number(a.rating || 0);
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });
}
