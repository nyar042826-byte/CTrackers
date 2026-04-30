export function MangaDexSearch({
  error,
  isSearching,
  onAdd,
  query,
  results,
  setQuery,
  setType,
  type,
  onSearch,
  onSync,
  isSyncing,
}) {
  return (
    <section className="wide-card mangadex-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">MangaDex live</p>
          <h3>Fetch titles</h3>
        </div>
        <button className="ghost-button" disabled={isSyncing} onClick={onSync} type="button">
          {isSyncing ? 'Syncing...' : 'Sync tracked'}
        </button>
      </div>

      <form className="mangadex-search-form" onSubmit={onSearch}>
        <label>
          Search query
          <input
            aria-label="Search MangaDex titles"
            placeholder="Solo Leveling, tower, villainess..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          Type
          <select aria-label="MangaDex title type" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">All</option>
            <option value="manhwa">Manhwa</option>
            <option value="manga">Manga</option>
            <option value="manhua">Manhua</option>
            <option value="webtoon">Webtoon</option>
          </select>
        </label>
        <button disabled={isSearching || query.trim().length < 2} type="submit">
          {isSearching ? 'Fetching...' : 'Fetch'}
        </button>
      </form>

      {error && <p className="sync-message error">{error}</p>}
      {isSearching && <p className="sync-message">Fetching live MangaDex results...</p>}

      <div className="mangadex-results">
        {results.map((title) => (
          <article className="mangadex-result" key={title.id}>
            {title.coverUrl ? <img alt="" src={title.coverUrl} /> : <div className="cover-placeholder" />}
            <div>
              <h4>{title.title}</h4>
              <p className="muted">{title.author}</p>
              <p className="chapter-line">Latest English chapter: {title.latestChapter}</p>
              <div className="chips">{title.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
            </div>
            <button onClick={() => onAdd(title)} type="button">Add</button>
          </article>
        ))}
      </div>
    </section>
  );
}
