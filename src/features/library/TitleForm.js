import { statusLabels } from '../../types/title';

export function TitleForm({ form, editingId, onCancel, onChange, onSubmit }) {
  return (
    <form className="title-form" onSubmit={onSubmit}>
      <p className="eyebrow">{editingId ? 'Edit title' : 'Quick add'}</p>
      <h3>{editingId ? 'Update library entry' : 'Add a new series'}</h3>
      <label>Title<input value={form.title} onChange={(event) => onChange('title', event.target.value)} required /></label>
      <label>Author<input value={form.author} onChange={(event) => onChange('author', event.target.value)} /></label>
      <label>Genres<input placeholder="Action, Fantasy" value={form.genres} onChange={(event) => onChange('genres', event.target.value)} /></label>
      <div className="form-row">
        <label>Current<input min="0" type="number" value={form.currentChapter} onChange={(event) => onChange('currentChapter', event.target.value)} /></label>
        <label>Latest<input min="1" type="number" value={form.latestChapter} onChange={(event) => onChange('latestChapter', event.target.value)} /></label>
      </div>
      <div className="form-row">
        <label>Status<select value={form.status} onChange={(event) => onChange('status', event.target.value)}>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label>Rating<input max="5" min="0" type="number" value={form.rating} onChange={(event) => onChange('rating', event.target.value)} /></label>
      </div>
      <label>Reminder<input placeholder="Sunday morning" value={form.reminder} onChange={(event) => onChange('reminder', event.target.value)} /></label>
      <label>Notes<textarea value={form.notes} onChange={(event) => onChange('notes', event.target.value)} /></label>
      <label className="checkbox-label"><input checked={form.isFavorite} onChange={(event) => onChange('isFavorite', event.target.checked)} type="checkbox" /> Add to favorites</label>
      <div className="form-actions">
        <button type="submit">{editingId ? 'Save changes' : 'Add title'}</button>
        {editingId && <button className="ghost-button" onClick={onCancel} type="button">Cancel</button>}
      </div>
    </form>
  );
}
