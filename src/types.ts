export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime' | 'Custom';
export type Frequency = 'Once daily' | 'Twice daily' | 'Custom';
export type ThemePreference = 'Aura' | 'Graphite' | 'Daylight' | 'Bloom' | 'System';

export interface Medication {
  id: string;
  name: string;
  dose: string;
  timeOfDay: TimeOfDay;
  customTimeLabel?: string;
  frequency: Frequency;
  notes?: string;
  spacingReminder?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  sortOrder: number;
}

export interface DailyLog {
  date: string;
  medicationId: string;
  completed: boolean;
  completedAt?: string;
  note?: string;
}

export interface Settings {
  onboardingComplete: boolean;
  themePreference: ThemePreference;
  trackingStartDate?: string;
  lastBackupDate?: string;
}

export interface AppState {
  medications: Medication[];
  logs: DailyLog[];
  settings: Settings;
}

export interface MedicationDraft {
  name: string;
  dose: string;
  timeOfDay: TimeOfDay;
  customTimeLabel: string;
  frequency: Frequency;
  notes: string;
  spacingReminder: string;
  startDate: string;
  endDate: string;
}

export interface DayStatus {
  kind: 'complete' | 'partial' | 'missed' | 'none';
  completed: number;
  total: number;
}
