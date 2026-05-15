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
          <p className="screen-helper-copy">
            Backups, appearance, and device-only controls for this copy of MedOS.
          </p>
        </div>
      </header>

      <section className="panel stack-md native-section-panel">
        <div className="stack-sm">
          <p className="eyebrow">Data</p>
          <h2>Stored on this device</h2>
        </div>
        <p className="muted">Nothing is synced automatically. Export a backup if you want a portable copy of your routine and history.</p>
        <div className="detail-chip">
          <span className="detail-chip-label">Storage model</span>
          <span>Private, local-first, and browser-based. Clear your browser data and MedOS is cleared too.</span>
        </div>
      </section>

      <section className="panel stack-md native-section-panel">
        <div className="stack-sm">
          <p className="eyebrow">Appearance</p>
          <h2>Choose a mood</h2>
        </div>
        <p className="muted">Each theme keeps the interface calm, but shifts the tone from bright utility to softer evening focus.</p>
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
