import type { ChangeEvent } from 'react';
import type { AppState, ThemePreference } from '../types';

const themeOptions: Array<{
  value: Exclude<ThemePreference, 'System'>;
  label: string;
  description: string;
}> = [
  { value: 'Aura', label: 'Aura', description: 'Cyan glow on deep graphite.' },
  { value: 'Graphite', label: 'Graphite', description: 'Quiet contrast with a cooler edge.' },
  { value: 'Daylight', label: 'Daylight', description: 'Bright and calm for daytime use.' },
  { value: 'Bloom', label: 'Bloom', description: 'Soft rose accents with a warm glow.' },
];

interface SettingsScreenProps {
  state: AppState;
  onThemeChange: (theme: Exclude<ThemePreference, 'System'>) => void;
  onExport: () => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
}

export function SettingsScreen({
  state,
  onThemeChange,
  onExport,
  onImport,
  onReset,
}: SettingsScreenProps) {
  const selectedTheme = state.settings.themePreference === 'System'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Aura' : 'Daylight')
    : state.settings.themePreference;

  return (
    <div className="screen-stack">
      <header className="topbar native-header-card">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Local controls</h1>
        </div>
      </header>

      <p className="screen-helper-copy">
        Manage backups and device-only settings for this copy of MedOS.
      </p>

      <section className="panel stack-md native-section-panel">
        <div className="stack-sm">
          <p className="eyebrow">Privacy</p>
          <h2>Stored on this device</h2>
        </div>
        <p className="muted">Your logs are stored locally in this browser on this device.</p>
        <div className="feature-grid">
          <article className="mini-card native-stat-card">
            <strong>No account required</strong>
            <span>Open the app and track your routine.</span>
          </article>
          <article className="mini-card native-stat-card">
            <strong>No cloud sync</strong>
            <span>Your routine and logs stay in this browser unless you export them.</span>
          </article>
          <article className="mini-card native-stat-card">
            <strong>Backups recommended</strong>
            <span>Local browser data can be cleared.</span>
          </article>
        </div>
      </section>

      <section className="panel stack-md native-section-panel">
        <div className="stack-sm">
          <p className="eyebrow">Appearance</p>
          <h2>Choose your palette</h2>
        </div>
        <p className="muted">Pick the visual tone that feels best for your routine.</p>
        <div className="theme-grid">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              className={`theme-card${selectedTheme === option.value ? ' active' : ''}`}
              type="button"
              onClick={() => onThemeChange(option.value)}
              aria-pressed={selectedTheme === option.value}
            >
              <span className="theme-swatch" data-theme-preview={option.value.toLowerCase()} aria-hidden="true" />
              <span className="theme-copy">
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel stack-md native-section-panel">
        <div className="stack-sm">
          <p className="eyebrow">Backup</p>
          <h2>Keep a copy of your routine</h2>
        </div>
        <p className="muted">
          Backups help protect against device changes or browser data being cleared.
        </p>
        <div className="button-row settings-action-row">
          <button className="primary-button" type="button" onClick={onExport}>
            Export backup
          </button>
          <label className="ghost-button file-button">
            Import backup
            <input accept="application/json" type="file" onChange={onImport} />
          </label>
        </div>
        <p className="supporting-copy">
          Last backup: {state.settings.lastBackupDate ? new Date(state.settings.lastBackupDate).toLocaleString() : 'Not yet exported'}
        </p>
      </section>

      <section className="panel stack-md native-section-panel">
        <div className="stack-sm">
          <p className="eyebrow">Reset</p>
          <h2>Clear this device</h2>
        </div>
        <p className="muted">This removes medications, logs, and settings from this browser.</p>
        <button className="ghost-button danger" type="button" onClick={onReset}>
          Reset data
        </button>
      </section>

      <section className="notice-card">
        This app is for personal tracking only and does not provide medical advice.
      </section>

      <p className="version-label">MedOS v1.0</p>
    </div>
  );
}
