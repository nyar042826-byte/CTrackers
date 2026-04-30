import { MangaDexSearch } from './MangaDexSearch';
import { TitleList } from './TitleList';

export function LibraryView(props) {
  return (
    <section className="library-layout">
      <div className="library-main">
        <MangaDexSearch
          error={props.mangaDexError}
          isSearching={props.isMangaDexSearching}
          isSyncing={props.isMangaDexSyncing}
          onAdd={props.onAddMangaDexTitle}
          onSearch={props.onSearchMangaDexTitles}
          onSync={props.onSyncMangaDexTitles}
          query={props.mangaDexQuery}
          results={props.mangaDexResults}
          setQuery={props.setMangaDexQuery}
          setType={props.setMangaDexType}
          type={props.mangaDexType}
        />
        <TitleList {...props} />
      </div>
    </section>
  );
}
