import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { BottomNav } from './components/BottomNav';
import { HistoryScreen } from './components/HistoryScreen';
import { Onboarding } from './components/Onboarding';
import { RoutineScreen } from './components/RoutineScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { TodayScreen } from './components/TodayScreen';
import { getTodayDate } from './lib/date';
import { defaultState, loadState, sanitizeState, saveState } from './lib/storage';
import type { AppState, Medication, MedicationDraft } from './types';
import { toggleMedicationLog } from './lib/medications';

type Screen = 'today' | 'history' | 'routine' | 'settings';

function buildMedication(draft: MedicationDraft, previous?: Medication, sortOrder = 0): Medication {
  return {
    id: previous?.id ?? crypto.randomUUID(),
    name: draft.name.trim(),
    dose: draft.dose.trim(),
    timeOfDay: draft.timeOfDay,
    customTimeLabel: undefined,
    frequency: 'Once daily',
    notes: draft.notes.trim() || undefined,
    spacingReminder: undefined,
    startDate: undefined,
    endDate: undefined,
    active: previous?.active ?? true,
    sortOrder: previous?.sortOrder ?? sortOrder,
  };
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [now, setNow] = useState(() => new Date());
  const [screen, setScreen] = useState<Screen>(() => {
    const hash = window.location.hash.replace('#/', '');
    return hash === 'history' || hash === 'routine' || hash === 'settings' ? hash : 'today';
  });
  const today = getTodayDate(now);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const theme = state.settings.themePreference === 'System'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'Aura'
        : 'Daylight'
      : state.settings.themePreference;
    document.documentElement.dataset.theme = theme.toLowerCase();
  }, [state.settings.themePreference]);

  useEffect(() => {
    const hash = `#/${screen}`;
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
  }, [screen]);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (hash === 'history' || hash === 'routine' || hash === 'settings' || hash === 'today') {
        setScreen(hash);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const sortedMedications = useMemo(
    () => [...state.medications].sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name)),
    [state.medications],
  );

  const addMedication = (draft: MedicationDraft) => {
    setState((current) => ({
      ...current,
      medications: current.medications.concat(buildMedication(draft, undefined, current.medications.length)),
    }));
  };

  const editMedication = (id: string, draft: MedicationDraft) => {
    setState((current) => ({
      ...current,
      medications: current.medications.map((medication) =>
        medication.id === id ? buildMedication(draft, medication) : medication,
      ),
    }));
  };

  const deleteMedication = (id: string) => {
    if (!window.confirm('Delete this medication from your routine?')) return;
    setState((current) => ({
      ...current,
      medications: current.medications.filter((medication) => medication.id !== id),
      logs: current.logs.filter((log) => log.medicationId !== id),
    }));
  };

  const moveMedication = (id: string, direction: -1 | 1) => {
    setState((current) => {
      const ordered = [...current.medications].sort((left, right) => left.sortOrder - right.sortOrder);
      const currentMedication = ordered.find((medication) => medication.id === id);
      if (!currentMedication) return current;

      const sameSlot = ordered.filter((medication) => medication.timeOfDay === currentMedication.timeOfDay);
      const slotIndex = sameSlot.findIndex((medication) => medication.id === id);
      const target = sameSlot[slotIndex + direction];
      if (slotIndex < 0 || !target) return current;

      const sortOrderById = new Map<string, number>([
        [currentMedication.id, target.sortOrder],
        [target.id, currentMedication.sortOrder],
      ]);

      return {
        ...current,
        medications: current.medications.map((medication) =>
          sortOrderById.has(medication.id)
            ? { ...medication, sortOrder: sortOrderById.get(medication.id)! }
            : medication,
        ),
      };
    });
  };

  const exportBackup = () => {
    const payload = {
      ...state,
      settings: {
        ...state.settings,
        lastBackupDate: new Date().toISOString(),
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medos-backup-${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setState(payload);
  };

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const parsed = JSON.parse(text) as unknown;
      const sanitized = sanitizeState(parsed);
      if (!sanitized) {
        window.alert('That file does not match the MedOS backup format.');
        return;
      }
      if (!window.confirm('Import this backup and replace your current local data?')) {
        return;
      }
      setState(sanitized);
    } catch {
      window.alert('The selected file could not be read.');
    } finally {
      event.target.value = '';
    }
  };

  const resetData = () => {
    if (!window.confirm('Reset MedOS and remove local medications, logs, and settings?')) return;
    setState(defaultState);
    setScreen('today');
  };

  const content = !state.settings.onboardingComplete ? (
    <Onboarding
      medications={sortedMedications}
      onAddMedication={addMedication}
      onEditMedication={editMedication}
      onDeleteMedication={deleteMedication}
      onActivateRoutine={() =>
        setState((current) => ({
          ...current,
          settings: {
            ...current.settings,
            onboardingComplete: true,
            trackingStartDate: current.settings.trackingStartDate ?? today,
          },
        }))
      }
    />
  ) : screen === 'history' ? (
    <HistoryScreen
      state={{ ...state, medications: sortedMedications }}
      today={today}
      onToggle={(date, medicationId) =>
        setState((current) => toggleMedicationLog(current, medicationId, date))
      }
    />
  ) : screen === 'routine' ? (
    <RoutineScreen
      medications={sortedMedications}
      onAddMedication={addMedication}
      onEditMedication={editMedication}
      onDeleteMedication={deleteMedication}
      onToggleActive={(id) =>
        setState((current) => ({
          ...current,
          medications: current.medications.map((medication) =>
            medication.id === id ? { ...medication, active: !medication.active } : medication,
          ),
        }))
      }
      onMoveMedication={moveMedication}
    />
  ) : screen === 'settings' ? (
    <SettingsScreen
      state={state}
      onThemeChange={(themePreference) =>
        setState((current) => ({
          ...current,
          settings: { ...current.settings, themePreference },
        }))
      }
      onExport={exportBackup}
      onImport={importBackup}
      onReset={resetData}
    />
  ) : (
    <TodayScreen
      state={{ ...state, medications: sortedMedications }}
      today={today}
      now={now}
      onToggle={(medicationId) => setState((current) => toggleMedicationLog(current, medicationId, today))}
    />
  );

  return (
    <div className={`app-shell${state.settings.onboardingComplete ? '' : ' onboarding-shell-mode'}`}>
      <main className={`phone-frame${state.settings.onboardingComplete ? '' : ' onboarding-mode'}`}>
        {content}
      </main>
      {state.settings.onboardingComplete && <BottomNav current={screen} onSelect={setScreen} />}
    </div>
  );
}
