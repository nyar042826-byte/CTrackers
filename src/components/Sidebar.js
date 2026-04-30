export const navItems = [
  ['dashboard', 'Home'],
  ['library', 'Library'],
  ['tracker', 'Tracker'],
  ['favorites', 'Favorites'],
  ['statistics', 'Stats'],
  ['settings', 'Settings'],
];

export function Sidebar({ activeView, onViewChange }) {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand-card">
        <span className="brand-mark">CT</span>
        <div>
          <p className="eyebrow">Offline PWA</p>
          <h1>CTracker</h1>
        </div>
      </div>
      <nav className="nav-list">
        {navItems.map(([key, label]) => (
          <button
            className={activeView === key ? 'nav-item active' : 'nav-item'}
            key={key}
            onClick={() => onViewChange(key)}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
