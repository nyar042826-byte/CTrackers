import { ProgressBar } from '../../components/ProgressBar';
import { StatCard } from '../../components/StatCard';
import { statusLabels } from '../../types/title';

function ProgressLine({ label, value, count }) {
  return (
    <div className="progress-line">
      <div><strong>{label}</strong><span>{count} titles</span></div>
      <ProgressBar value={value} />
      <b>{value}%</b>
    </div>
  );
}

export function StatisticsView({ titles, stats }) {
  return (
    <section className="view-grid">
      <StatCard label="Completed" value={stats.completed} detail="Finished stories" />
      <StatCard label="Favorites" value={stats.favorites} detail="Pinned watchlist" />
      <StatCard label="Completion rate" value={`${stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%`} detail="Titles marked complete" />
      <section className="wide-card">
        <p className="eyebrow">Analytics</p>
        <h3>Status breakdown</h3>
        <div className="status-bars">
          {Object.keys(statusLabels).map((status) => {
            const count = titles.filter((title) => title.status === status).length;
            const percent = stats.total ? Math.round((count / stats.total) * 100) : 0;
            return <ProgressLine key={status} label={statusLabels[status]} value={percent} count={count} />;
          })}
        </div>
      </section>
    </section>
  );
}
