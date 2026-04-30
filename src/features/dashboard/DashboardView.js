import { StatCard } from '../../components/StatCard';
import { TitleCard } from '../../components/TitleCard';

export function DashboardView({
  behindTitles,
  continueReading,
  onAdvance,
  onEdit,
  onFavorite,
  onQuickAdd,
  reminderTitles,
  stats,
}) {
  return (
    <section className="view-grid">
      <StatCard label="Total titles" value={stats.total} detail="Stored locally" />
      <StatCard label="Chapters read" value={stats.chaptersRead} detail="Across your library" />
      <StatCard label="Need updates" value={stats.behind} detail="Current below latest" />
      <StatCard label="Reminders" value={stats.activeReminders} detail="Reading nudges set" />

      <section className="wide-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Continue Reading</p>
            <h3>Pick up where you left off</h3>
          </div>
          <button className="ghost-button" onClick={onQuickAdd} type="button">Quick add</button>
        </div>
        {continueReading.length ? (
          <div className="title-grid compact">
            {continueReading.map((title) => (
              <TitleCard key={title.id} title={title} onAdvance={onAdvance} onEdit={onEdit} onFavorite={onFavorite} />
            ))}
          </div>
        ) : (
          <p className="empty-state">No in-progress titles are waiting. Add a title or update latest chapters to build your queue.</p>
        )}
      </section>

      <section className="wide-card dashboard-split">
        <div>
          <p className="eyebrow">Watchlist</p>
          <h3>Largest chapter gaps</h3>
          <div className="mini-list">
            {behindTitles.length ? behindTitles.map((title) => (
              <button className="mini-row" key={title.id} onClick={() => onEdit(title)} type="button">
                <span>{title.title}</span>
                <strong>{title.latestChapter - title.currentChapter} behind</strong>
              </button>
            )) : <p className="empty-state">Everything is caught up.</p>}
          </div>
        </div>
        <div>
          <p className="eyebrow">Reminders</p>
          <h3>Reading nudges</h3>
          <div className="mini-list">
            {reminderTitles.length ? reminderTitles.map((title) => (
              <button className="mini-row" key={title.id} onClick={() => onEdit(title)} type="button">
                <span>{title.title}</span>
                <strong>{title.reminder}</strong>
              </button>
            )) : <p className="empty-state">No reminders set yet.</p>}
          </div>
        </div>
      </section>
    </section>
  );
}
