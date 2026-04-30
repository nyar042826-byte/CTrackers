export function SettingsView({
  onExport,
  onImport,
  onLoadSamples,
  onClear,
}) {
  return (
    <section className="wide-card settings-card">
      <p className="eyebrow">Settings</p>
      <h3>Backup, import, export, and theme</h3>
      <div className="settings-actions">
        <button onClick={onExport} type="button">Export backup</button>
        <label className="file-button">
          Import backup
          <input accept="application/json" onChange={onImport} type="file" />
        </label>
        <button onClick={onLoadSamples} type="button">Load sample data</button>
        <button className="danger" onClick={onClear} type="button">Clear library</button>
      </div>
      <p className="muted">Your library is saved locally in this browser. Export a backup before clearing site data.</p>
    </section>
  );
}
