import type { AppState } from '../types';

const STORAGE_KEY = 'medos.app.v1';
const VALID_TIME_OF_DAY = new Set(['Morning', 'Afternoon', 'Evening', 'Bedtime', 'Custom']);
const VALID_FREQUENCY = new Set(['Once daily', 'Twice daily', 'Custom']);

function normalizeThemePreference(value: unknown): AppState['settings']['themePreference'] {
  return value === 'Aura' || value === 'Graphite' || value === 'Daylight' || value === 'Bloom' || value === 'System'
    ? value
    : 'Aura';
}

function asOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function sanitizeMedication(value: unknown, index: number): AppState['medications'][number] | null {
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Record<string, unknown>;
  if (typeof candidate.id !== 'string' || typeof candidate.name !== 'string' || typeof candidate.dose !== 'string') {
    return null;
  }

  return {
    id: candidate.id,
    name: candidate.name.trim(),
    dose: candidate.dose.trim(),
    timeOfDay: VALID_TIME_OF_DAY.has(String(candidate.timeOfDay)) ? (candidate.timeOfDay as AppState['medications'][number]['timeOfDay']) : 'Morning',
    customTimeLabel: asOptionalString(candidate.customTimeLabel),
    frequency: VALID_FREQUENCY.has(String(candidate.frequency)) ? (candidate.frequency as AppState['medications'][number]['frequency']) : 'Once daily',
    notes: asOptionalString(candidate.notes),
    spacingReminder: asOptionalString(candidate.spacingReminder),
    startDate: asOptionalString(candidate.startDate),
    endDate: asOptionalString(candidate.endDate),
    active: typeof candidate.active === 'boolean' ? candidate.active : true,
    sortOrder: Number.isFinite(candidate.sortOrder) ? Number(candidate.sortOrder) : index,
  };
}

function sanitizeLog(value: unknown): AppState['logs'][number] | null {
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.date !== 'string' ||
    typeof candidate.medicationId !== 'string' ||
    typeof candidate.completed !== 'boolean'
  ) {
    return null;
  }

  return {
    date: candidate.date,
    medicationId: candidate.medicationId,
    completed: candidate.completed,
    completedAt: asOptionalString(candidate.completedAt),
    note: asOptionalString(candidate.note),
  };
}

export function sanitizeState(value: unknown): AppState | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<AppState>;
  if (!Array.isArray(candidate.medications) || !Array.isArray(candidate.logs) || !candidate.settings) {
    return null;
  }

  const medications = candidate.medications
    .map((medication, index) => sanitizeMedication(medication, index))
    .filter((medication): medication is AppState['medications'][number] => medication !== null)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name))
    .map((medication, index) => ({ ...medication, sortOrder: index }));

  const medicationIds = new Set(medications.map((medication) => medication.id));
  const logs = candidate.logs
    .map((log) => sanitizeLog(log))
    .filter((log): log is AppState['logs'][number] => log !== null && medicationIds.has(log.medicationId));

  return {
    medications,
    logs,
    settings: {
      onboardingComplete: Boolean(candidate.settings?.onboardingComplete),
      themePreference: normalizeThemePreference(candidate.settings?.themePreference),
      trackingStartDate: asOptionalString(candidate.settings?.trackingStartDate),
      lastBackupDate: asOptionalString(candidate.settings?.lastBackupDate),
    },
  };
}

export const defaultState: AppState = {
  medications: [],
  logs: [],
  settings: {
    onboardingComplete: false,
    themePreference: 'Aura',
    trackingStartDate: undefined,
  },
};

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw) as unknown;
    return sanitizeState(parsed) ?? defaultState;
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
