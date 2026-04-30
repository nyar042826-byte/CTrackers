import { TitleList } from './TitleList';

export function LibraryView(props) {
  return (
    <section className="library-layout">
      <div className="library-main">
        <TitleList {...props} />
      </div>
    </section>
  );
}
