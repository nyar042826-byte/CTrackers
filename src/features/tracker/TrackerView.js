import { ProgressBar } from '../../components/ProgressBar';
import { getCompletion } from '../../services/titleService';

export function TrackerView({ titles, onAdvance, onLatestChange }) {
  return (
    <section className="wide-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Chapter Tracker</p>
          <h3>Current vs latest chapters</h3>
        </div>
      </div>
      <div className="tracker-list">
        {titles.length ? titles.map((title) => (
          <article className="tracker-row" key={title.id}>
            <div>
              <strong>{title.title}</strong>
              <span>{title.currentChapter} / {title.latestChapter} chapters</span>
            </div>
            <ProgressBar value={getCompletion(title)} />
            <label className="latest-input">
              Latest
              <input
                min="1"
                type="number"
                value={title.latestChapter}
                onChange={(event) => onLatestChange(title.id, event.target.value)}
              />
            </label>
            <div className="row-actions">
              <button onClick={() => onAdvance(title.id, -1)} type="button">-1</button>
              <button onClick={() => onAdvance(title.id, 1)} type="button">+1</button>
            </div>
          </article>
        )) : <p className="empty-state">Add titles in the Library to start tracking chapters.</p>}
      </div>
    </section>
  );
}
