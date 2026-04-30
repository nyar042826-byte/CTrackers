import { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { Sidebar } from '../components/Sidebar';
import { DashboardView } from '../features/dashboard/DashboardView';
import { FavoritesView } from '../features/favorites/FavoritesView';
import { LibraryView } from '../features/library/LibraryView';
import { SettingsView } from '../features/settings/SettingsView';
import { StatisticsView } from '../features/statistics/StatisticsView';
import { TrackerView } from '../features/tracker/TrackerView';
import { useCTrackerStore } from '../stores/useCTrackerStore';

export function CTrackerApp() {
  const store = useCTrackerStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleViewChange(view) {
    store.setActiveView(view);
    setIsMenuOpen(false);
  }

  return (
    <main className="app-shell">
      <button
        aria-label="Close menu"
        className={isMenuOpen ? 'menu-backdrop open' : 'menu-backdrop'}
        onClick={() => setIsMenuOpen(false)}
        type="button"
      />
      <Sidebar
        activeView={store.activeView}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onViewChange={handleViewChange}
      />

      <section className="content-panel">
        <AppHeader
          isMenuOpen={isMenuOpen}
          theme={store.theme}
          onMenuToggle={() => setIsMenuOpen((current) => !current)}
          onThemeToggle={() => store.setTheme(store.theme === 'dark' ? 'light' : 'dark')}
        />

        {store.activeView === 'dashboard' && (
          <DashboardView
            behindTitles={store.behindTitles}
            reminderTitles={store.reminderTitles}
            stats={store.stats}
            continueReading={store.continueReading}
            onAdvance={store.advanceChapter}
            onEdit={store.editTitle}
            onFavorite={store.toggleFavorite}
            onQuickAdd={() => store.setActiveView('library')}
          />
        )}

        {store.activeView === 'library' && (
          <LibraryView
            editingId={store.editingId}
            form={store.form}
            isMangaDexSearching={store.isMangaDexSearching}
            isMangaDexSyncing={store.isMangaDexSyncing}
            mangaDexError={store.mangaDexError}
            mangaDexQuery={store.mangaDexQuery}
            mangaDexResults={store.mangaDexResults}
            mangaDexType={store.mangaDexType}
            onAdvance={store.advanceChapter}
            onAddMangaDexTitle={store.addMangaDexTitle}
            onCancel={store.resetForm}
            onChange={store.updateForm}
            onEdit={store.editTitle}
            onFavorite={store.toggleFavorite}
            onRemove={store.removeTitle}
            onSearchMangaDexTitles={store.searchMangaDexTitles}
            onSyncMangaDexTitles={store.syncMangaDexTitles}
            onSubmit={store.submitTitle}
            setMangaDexQuery={store.setMangaDexQuery}
            setMangaDexType={store.setMangaDexType}
            setSortBy={store.setSortBy}
            setStatusFilter={store.setStatusFilter}
            sortBy={store.sortBy}
            statusFilter={store.statusFilter}
            titles={store.filteredTitles}
          />
        )}

        {store.activeView === 'tracker' && (
          <TrackerView
            titles={store.titles}
            onAdvance={store.advanceChapter}
            onLatestChange={store.updateLatestChapter}
          />
        )}

        {store.activeView === 'favorites' && (
          <FavoritesView
            titles={store.titles}
            onAdvance={store.advanceChapter}
            onEdit={store.editTitle}
            onFavorite={store.toggleFavorite}
          />
        )}

        {store.activeView === 'statistics' && <StatisticsView titles={store.titles} stats={store.stats} />}

        {store.activeView === 'settings' && (
          <SettingsView
            onClear={store.clearLibrary}
            onExport={store.exportData}
            onImport={store.importData}
            onLoadSamples={store.loadSamples}
          />
        )}
      </section>
    </main>
  );
}
