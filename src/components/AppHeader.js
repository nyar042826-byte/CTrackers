export function AppHeader({ theme, onThemeToggle }) {
  return (
    <header className="hero-panel">
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
