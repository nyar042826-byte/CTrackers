export function SettingsView({
  onExport,
  onImport,
  onLoadSamples,
  onClear,
  onPullSupabase,
  onPushSupabase,
  onSyncSupabase,
  supabaseMessage,
  supabaseOwnerKey,
  supabaseStatus,
}) {
  const isSupabaseBusy = supabaseStatus === 'syncing';
  const isSupabaseConfigured = supabaseStatus !== 'missing-config';

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
      <div className="cloud-panel">
        <div>
          <p className="eyebrow">Supabase backend</p>
          <h4>Cloud library sync</h4>
          <p className={`sync-message ${supabaseStatus === 'error' ? 'error' : ''}`}>{supabaseMessage}</p>
          <p className="muted">Owner key: {supabaseOwnerKey}</p>
        </div>
        <div className="settings-actions">
          <button disabled={!isSupabaseConfigured || isSupabaseBusy} onClick={onPullSupabase} type="button">Pull cloud</button>
          <button disabled={!isSupabaseConfigured || isSupabaseBusy} onClick={onPushSupabase} type="button">Push local</button>
          <button disabled={!isSupabaseConfigured || isSupabaseBusy} onClick={onSyncSupabase} type="button">Sync cloud</button>
        </div>
      </div>
      <p className="muted">CTracker keeps a local browser copy and can sync to Supabase when backend environment values are configured.</p>
    </section>
  );
}
