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

  return (
    <main className="app-shell">
      <Sidebar activeView={store.activeView} onViewChange={store.setActiveView} />

      <section className="content-panel">
        <AppHeader
          theme={store.theme}
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
            query={store.query}
            setMangaDexQuery={store.setMangaDexQuery}
            setMangaDexType={store.setMangaDexType}
            setQuery={store.setQuery}
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
            onPullSupabase={store.pullSupabaseLibrary}
            onPushSupabase={store.pushSupabaseLibrary}
            onSyncSupabase={store.syncSupabaseLibrary}
            supabaseMessage={store.supabaseMessage}
            supabaseOwnerKey={store.supabaseOwnerKey}
            supabaseStatus={store.supabaseStatus}
          />
        )}
      </section>
    </main>
  );
}
