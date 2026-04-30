import { TitleCard } from '../../components/TitleCard';

export function FavoritesView({ titles, onAdvance, onEdit, onFavorite }) {
  const favoriteTitles = titles.filter((title) => title.isFavorite);

  return (
    <section className="wide-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Favorites & Watchlist</p>
          <h3>Pinned titles</h3>
        </div>
      </div>
      <div className="title-grid">
        {favoriteTitles.length ? favoriteTitles.map((title) => (
          <TitleCard key={title.id} title={title} onAdvance={onAdvance} onEdit={onEdit} onFavorite={onFavorite} />
        )) : <p className="empty-state">Pin titles from the Library to build a focused watchlist.</p>}
      </div>
    </section>
  );
}
