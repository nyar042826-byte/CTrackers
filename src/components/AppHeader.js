export function AppHeader({ isMenuOpen, theme, onMenuToggle, onThemeToggle }) {
  return (
    <header className="hero-panel">
      <button
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        className="mobile-menu-toggle"
        onClick={onMenuToggle}
        type="button"
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <div>
        <p className="eyebrow">Manga, manhwa, manhua, webtoons</p>
        <h2>Your reading command center</h2>
        <p className="hero-copy">
          Track chapters, favorites, notes, reminders, and progress in a fast local-first library.
        </p>
      </div>
      <button className="theme-toggle" onClick={onThemeToggle} type="button">
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>
    </header>
  );
}
