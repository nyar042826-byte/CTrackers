import { TitleCard } from '../../components/TitleCard';
import { statusLabels } from '../../types/title';

export function TitleList(props) {
  const { titles, query, setQuery, statusFilter, setStatusFilter, sortBy, setSortBy, onAdvance, onEdit, onFavorite, onRemove } = props;

  return (
    <section className="wide-card library-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Library</p>
          <h3>Search, filter, sort</h3>
        </div>
      </div>
      <div className="filters">
        <input aria-label="Search titles" placeholder="Search title, creator, genre..." value={query} onChange={(event) => setQuery(event.target.value)} />
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
      <div className="title-grid">
        {titles.length ? titles.map((title) => (
          <TitleCard key={title.id} title={title} onAdvance={onAdvance} onEdit={onEdit} onFavorite={onFavorite} onRemove={onRemove} />
        )) : <p className="empty-state">No titles match these filters. Try another search or add a new series.</p>}
      </div>
    </section>
  );
}
