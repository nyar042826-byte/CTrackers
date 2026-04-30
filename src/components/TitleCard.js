import { statusLabels } from '../types/title';
import { getCompletion } from '../services/titleService';
import { ProgressBar } from './ProgressBar';

export function TitleCard({ title, onAdvance, onFavorite, onRemove }) {
  const progress = getCompletion(title);

  return (
    <article className="title-card">
      <div className="card-topline">
        <span className={`status-pill ${title.status}`}>{statusLabels[title.status]}</span>
        <button aria-label={`Toggle favorite for ${title.title}`} className="icon-button" onClick={() => onFavorite(title.id)} type="button">
          {title.isFavorite ? 'Pinned' : 'Pin'}
        </button>
      </div>
      {title.coverUrl && <img className="title-cover" alt="" src={title.coverUrl} />}
      <h4>{title.title}</h4>
      <p className="muted">{title.author}</p>
      <div className="chips">{(title.genres || []).map((genre) => <span key={genre}>{genre}</span>)}</div>
      <ProgressBar value={progress} />
      <p className="chapter-line">Chapter {title.currentChapter} of {title.latestChapter} - {progress}%</p>
      {title.sourceUrl ? (
        <a className="source-link" href={title.sourceUrl} rel="noreferrer" target="_blank">
          Open on {title.source || 'source'}
        </a>
      ) : title.source && <p className="source-line">{title.source}</p>}
      {title.reminder && <p className="reminder">Reminder: {title.reminder}</p>}
      {title.notes && <p className="notes">{title.notes}</p>}
      <div className="card-actions">
        <button onClick={() => onAdvance(title.id, 1)} type="button">Read +1</button>
        <button className="ghost-button" onClick={() => onAdvance(title.id, -1)} type="button">Read -1</button>
        {onRemove && <button className="danger ghost-button" onClick={() => onRemove(title.id)} type="button">Delete</button>}
      </div>
    </article>
  );
}
