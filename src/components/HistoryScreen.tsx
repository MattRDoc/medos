import { useEffect, useMemo, useRef, useState } from 'react';
import { buildMonthGrid, formatMonthLabel, formatTodayLabel, toDateInput } from '../lib/date';
import {
  getCompletedMedicationIdsForDate,
  getCurrentStreak,
  getDayStatus,
  getScheduledMedicationsForDate,
  groupMedicationsByTime,
} from '../lib/medications';
import type { AppState } from '../types';
import { MedicationTimeIcon } from './MedicationEditor';

interface HistoryScreenProps {
  state: AppState;
  today: string;
  onToggle: (date: string, medicationId: string) => void;
}

function getCalendarStatusLabel(kind: 'complete' | 'partial' | 'missed' | 'none') {
  if (kind === 'complete') return 'Done';
  if (kind === 'partial') return 'Some';
  if (kind === 'missed') return 'Missed';
  return '';
}

function LogIcon({ complete }: { complete: boolean }) {
  if (!complete) {
    return null;
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.7 12.2 2.2 2.3 4.5-5" />
    </svg>
  );
}

export function HistoryScreen({ state, today, onToggle }: HistoryScreenProps) {
  const [month, setMonth] = useState(() => {
    const current = new Date();
    return new Date(current.getFullYear(), current.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedDayRef = useRef<HTMLElement | null>(null);

  const monthDates = useMemo(() => {
    const grid = buildMonthGrid(month);
    const inMonth = grid.filter((value) => value.getMonth() === month.getMonth());
    return inMonth.map((value) => {
      const date = toDateInput(value);
      const isFuture = date > today;
      return {
        value,
        date,
        isFuture,
        status: isFuture ? { kind: 'none' as const, completed: 0, total: 0 } : getDayStatus(state, date),
      };
    });
  }, [month, state, today]);

  const leadingEmptyDays = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    return (firstDay.getDay() + 6) % 7;
  }, [month]);

  const selectedStatus = selectedDate ? getDayStatus(state, selectedDate) : null;
  const selectedMedications = selectedDate ? getScheduledMedicationsForDate(state.medications, selectedDate) : [];
  const selectedGroups = groupMedicationsByTime(selectedMedications);
  const selectedLabel = selectedDate ? formatTodayLabel(selectedDate) : null;
  const selectedCompletedMedicationIds = useMemo(
    () => (selectedDate ? getCompletedMedicationIdsForDate(state.logs, selectedDate) : new Set<string>()),
    [selectedDate, state.logs],
  );

  useEffect(() => {
    if (!selectedDate || !selectedStatus || selectedStatus.kind === 'none') return;

    requestAnimationFrame(() => {
      selectedDayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [selectedDate, selectedStatus]);

  return (
    <div className="screen-stack">
      <header className="topbar native-header-card">
        <div>
          <p className="eyebrow">History</p>
          <h1>Tracking archive</h1>
        </div>
      </header>

      <section className="history-streak-section">
        <article className="panel native-stat-card history-streak-card">
          <strong>Current streak</strong>
          <span>{getCurrentStreak(state, today)} days</span>
          <small className="history-streak-note">Fully completed days in a row</small>
        </article>
      </section>

      <section className="panel stack-md native-section-panel">
        <div className="section-head">
          <h2>{formatMonthLabel(month)}</h2>
          <div className="button-row compact">
            <button
              className="ghost-button"
              type="button"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            >
              Prev
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            >
              Next
            </button>
          </div>
        </div>

        <div className="calendar-grid calendar-head">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {Array.from({ length: leadingEmptyDays }, (_, index) => (
            <div key={`spacer-${index}`} className="calendar-spacer" aria-hidden="true" />
          ))}
          {monthDates.map((item) => {
            const isTrackedDay = !item.isFuture && item.status.kind !== 'none';
            const className = `calendar-day ${item.status.kind}${item.isFuture ? ' future' : ''}${selectedDate === item.date ? ' selected' : ''}${isTrackedDay ? ' interactive' : ''}`;

            if (!isTrackedDay) {
              return (
                <article key={item.date} className={className}>
                  <span>{item.value.getDate()}</span>
                  <small>{item.isFuture ? '' : getCalendarStatusLabel(item.status.kind)}</small>
                </article>
              );
            }

            return (
              <button
                key={item.date}
                className={className}
                type="button"
                onClick={() => setSelectedDate(item.date)}
              >
                <span>{item.value.getDate()}</span>
                <small>{getCalendarStatusLabel(item.status.kind)}</small>
              </button>
            );
          })}
        </div>
      </section>

      {selectedDate && selectedStatus && selectedStatus.kind !== 'none' && (
        <section ref={selectedDayRef} className="panel stack-md native-section-panel">
          <div className="section-head">
            <div className="stack-sm">
              <p className="eyebrow">Editable history</p>
              <h2>{selectedLabel?.full}</h2>
            </div>
            <span className="muted">
              {selectedStatus.completed} of {selectedStatus.total}
            </span>
          </div>

          {selectedGroups.length === 0 ? (
            <div className="empty-panel">
              <h3>No routine for this date</h3>
              <p>There were no scheduled medications on this day.</p>
            </div>
          ) : (
            <>
              <p className="history-helper-copy">Update anything you took so your record stays accurate.</p>
              {selectedGroups.map((group) => (
              <section key={group.slot} className="stack-md history-day-group">
                <div className="section-head">
                  <h2>{group.slot}</h2>
                  <span className="muted">
                    {
                      group.medications.filter((medication) => selectedCompletedMedicationIds.has(medication.id)).length
                    }{' '}
                    of {group.medications.length}
                  </span>
                </div>

                <div className="stack-md">
                  {group.medications.map((medication) => {
                    const complete = selectedCompletedMedicationIds.has(medication.id);
                    return (
                      <article key={medication.id} className={`med-card native-med-card${complete ? ' completed' : ''}`}>
                        <div className="med-card-main">
                          <div className="med-card-title">
                            <div className="med-card-time-icon" aria-hidden="true">
                              <MedicationTimeIcon option={medication.timeOfDay} />
                            </div>
                            <div className="med-card-copy">
                              <p className="eyebrow">{group.slot}</p>
                              <h3>{medication.name}</h3>
                              <p className="med-meta">{medication.dose}</p>
                            </div>
                          </div>
                          <button
                            className={`toggle-button log-toggle${complete ? ' complete' : ''}`}
                            type="button"
                            aria-label={`${complete ? 'Mark incomplete' : 'Mark complete'} for ${medication.name} on ${selectedDate}`}
                            onClick={() => onToggle(selectedDate, medication.id)}
                          >
                            <LogIcon complete={complete} />
                          </button>
                        </div>
                        {medication.notes && (
                          <div className="med-card-support">
                            <div className="med-note-block">
                              <p className="eyebrow">Note</p>
                              <p className="med-note">{medication.notes}</p>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
              ))}
            </>
          )}
        </section>
      )}
    </div>
  );
}
