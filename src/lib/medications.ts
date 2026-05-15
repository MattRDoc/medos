import { addDays } from './date';
import type { AppState, DailyLog, DayStatus, Medication } from '../types';

export const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Bedtime', 'Custom'] as const;

export function isMedicationScheduledOnDate(medication: Medication, date: string) {
  if (!medication.active) return false;
  if (medication.startDate && medication.startDate > date) return false;
  if (medication.endDate && medication.endDate < date) return false;
  return true;
}

export function getScheduledMedicationsForDate(medications: Medication[], date: string) {
  return medications
    .filter((medication) => isMedicationScheduledOnDate(medication, date))
    .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name));
}

export function getLogsForDate(logs: DailyLog[], date: string) {
  return logs.filter((log) => log.date === date);
}

export function getCompletedMedicationIdsForDate(logs: DailyLog[], date: string) {
  return new Set(
    logs
      .filter((log) => log.date === date && log.completed)
      .map((log) => log.medicationId),
  );
}

export function isMedicationCompleteForDate(logs: DailyLog[], medicationId: string, date: string) {
  return logs.some((log) => log.date === date && log.medicationId === medicationId && log.completed);
}

export function toggleMedicationLog(state: AppState, medicationId: string, date: string): AppState {
  const existing = state.logs.find((log) => log.date === date && log.medicationId === medicationId);
  const nextLogs = existing
    ? state.logs.map((log) =>
        log === existing
          ? {
              ...log,
              completed: !log.completed,
              completedAt: !log.completed ? new Date().toISOString() : undefined,
            }
          : log,
      )
    : state.logs.concat({
        date,
        medicationId,
        completed: true,
        completedAt: new Date().toISOString(),
      });

  return {
    ...state,
    logs: nextLogs,
  };
}

function getTrackingStartDate(state: AppState) {
  if (state.settings.trackingStartDate) {
    return state.settings.trackingStartDate;
  }

  if (state.logs.length > 0) {
    return [...state.logs].map((log) => log.date).sort()[0];
  }

  return undefined;
}

export function getDayStatus(state: AppState, date: string): DayStatus {
  const trackingStartDate = getTrackingStartDate(state);
  if (trackingStartDate && date < trackingStartDate) {
    return { kind: 'none', completed: 0, total: 0 };
  }

  const medications = getScheduledMedicationsForDate(state.medications, date);
  const total = medications.length;
  if (!total) {
    return { kind: 'none', completed: 0, total: 0 };
  }

  const completedMedicationIds = getCompletedMedicationIdsForDate(state.logs, date);
  const completed = medications.filter((medication) => completedMedicationIds.has(medication.id)).length;

  if (completed === total) return { kind: 'complete', completed, total };
  if (completed === 0) return { kind: 'missed', completed, total };
  return { kind: 'partial', completed, total };
}

export function getWeeklyStatuses(state: AppState, today: string) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6);
    return {
      date,
      status: getDayStatus(state, date),
    };
  });
}

export function getCurrentStreak(state: AppState, today: string) {
  let streak = 0;
  let cursor = today;

  while (true) {
    const status = getDayStatus(state, cursor);
    if (status.kind !== 'complete') {
      break;
    }
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function groupMedicationsByTime(medications: Medication[]) {
  const grouped = new Map(timeSlots.map((slot) => [slot, [] as Medication[]]));

  medications.forEach((medication) => {
    grouped.get(medication.timeOfDay)?.push(medication);
  });

  return timeSlots
    .map((slot) => ({
      slot,
      medications: grouped.get(slot) ?? [],
    }))
    .filter((group) => group.medications.length > 0);
}
