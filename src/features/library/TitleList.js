import { TitleCard } from '../../components/TitleCard';
import { statusLabels } from '../../types/title';

export function TitleList(props) {
  const {
    isMangaDexSearching,
    isMangaDexSyncing,
    mangaDexError,
    mangaDexQuery,
    mangaDexResults,
    mangaDexType,
    onAddMangaDexTitle,
    onAdvance,
    onEdit,
    onFavorite,
    onRemove,
    onSearchMangaDexTitles,
    onSyncMangaDexTitles,
    setMangaDexQuery,
    setMangaDexType,
    setSortBy,
    setStatusFilter,
    sortBy,
    statusFilter,
    titles,
  } = props;
  const hasSearchQuery = mangaDexQuery.trim().length >= 2;

  return (
    <section className="wide-card library-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Library</p>
          <h3>Search MangaDex, filter saved titles</h3>
        </div>
        <button className="ghost-button" disabled={isMangaDexSyncing} onClick={onSyncMangaDexTitles} type="button">
          {isMangaDexSyncing ? 'Syncing...' : 'Sync tracked'}
        </button>
      </div>
      <form className="filters" onSubmit={onSearchMangaDexTitles}>
        <input
          aria-label="Search MangaDex titles"
          placeholder="Search MangaDex title, URL, or ID..."
          value={mangaDexQuery}
          onChange={(event) => setMangaDexQuery(event.target.value)}
        />
        <select aria-label="MangaDex title type" value={mangaDexType} onChange={(event) => setMangaDexType(event.target.value)}>
          <option value="all">All types</option>
          <option value="manhwa">Manhwa</option>
          <option value="manga">Manga</option>
          <option value="manhua">Manhua</option>
          <option value="webtoon">Webtoon</option>
        </select>
        <button disabled={isMangaDexSearching || mangaDexQuery.trim().length < 2} type="submit">
          {isMangaDexSearching ? 'Fetching...' : 'Search'}
        </button>
      </form>

      {mangaDexError && <p className="sync-message error">{mangaDexError}</p>}
      {isMangaDexSearching && <p className="sync-message">Fetching live MangaDex results...</p>}

      {hasSearchQuery && !isMangaDexSearching && (
        <div className="mangadex-results">
          {mangaDexResults.length ? mangaDexResults.map((title) => (
            <article className="mangadex-result" key={title.id}>
              {title.coverUrl ? <img alt="" src={title.coverUrl} /> : <div className="cover-placeholder" />}
              <div>
                <h4>{title.title}</h4>
                <p className="muted">{title.author}</p>
                <p className="chapter-line">Latest English chapter: {title.latestChapter}</p>
                <div className="chips">{title.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
              </div>
              <button onClick={() => onAddMangaDexTitle(title)} type="button">Add</button>
            </article>
          )) : <p className="empty-state">No MangaDex results found. Try another title, URL, or ID.</p>}
        </div>
      )}

      <div className="filters library-filters">
        <select aria-label="Filter status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option>
          {Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        <select aria-label="Sort titles" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="updated">Recently updated</option>
          <option value="title">Title A-Z</option>
          <option value="progress">Progress</option>
          <option value="rating">Rating</option>
        </select>
      </div>
      <p className="source-line">Saved library</p>
      <div className="title-grid">
        {titles.length ? titles.map((title) => (
          <TitleCard key={title.id} title={title} onAdvance={onAdvance} onEdit={onEdit} onFavorite={onFavorite} onRemove={onRemove} />
        )) : <p className="empty-state">No saved titles match these filters. Add a MangaDex result or import a backup.</p>}
      </div>
    </section>
  );
}
