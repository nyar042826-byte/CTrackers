export const navItems = [
  ['dashboard', 'Home'],
  ['library', 'Library'],
  ['tracker', 'Tracker'],
  ['favorites', 'Favorites'],
  ['statistics', 'Stats'],
  ['settings', 'Settings'],
];

export function Sidebar({ activeView, isOpen, onClose, onViewChange }) {
  return (
    <aside className={isOpen ? 'sidebar open' : 'sidebar'} aria-label="Primary navigation">
      <div className="brand-card">
        <span className="brand-mark">CT</span>
        <div>
          <p className="eyebrow">Offline PWA</p>
          <h1>CTracker</h1>
        </div>
        <button aria-label="Close menu" className="mobile-menu-close" onClick={onClose} type="button">
          <span aria-hidden="true">×</span>
        </button>
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
