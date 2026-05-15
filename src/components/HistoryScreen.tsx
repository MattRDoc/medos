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

interface HistoryScreenProps {
  state: AppState;
  today: string;
  onToggle: (date: string, medicationId: string) => void;
}

function getCalendarStatusLabel(kind: 'complete' | 'partial' | 'missed' | 'none') {
  if (kind === 'complete') return 'Taken';
  if (kind === 'partial') return 'Some taken';
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
  const trackedDays = monthDates.filter((item) => item.status.kind !== 'none').length;
  const completedDays = monthDates.filter((item) => item.status.kind === 'complete').length;
  const currentStreak = getCurrentStreak(state, today);

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
          <p className="screen-helper-copy">
            Review taken days, spot gaps, and correct anything that needs a cleaner record.
          </p>
        </div>
      </header>

      <section className="history-summary-inline" aria-label="Monthly adherence summary">
        <span>{currentStreak} day{currentStreak === 1 ? '' : 's'} streak</span>
        <span aria-hidden="true">·</span>
        <span>{completedDays} fully taken</span>
        <span aria-hidden="true">·</span>
        <span>{trackedDays} tracked day{trackedDays === 1 ? '' : 's'}</span>
      </section>

      <section className="panel stack-md native-section-panel history-calendar-shell">
        <div className="history-calendar-toolbar">
          <div className="stack-sm">
            <p className="eyebrow">Monthly view</p>
            <div className="history-month-control">
              <button
                className="ghost-button small"
                type="button"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                aria-label="Previous month"
              >
                &lt;
              </button>
              <h2>{formatMonthLabel(month)}</h2>
              <button
                className="ghost-button small"
                type="button"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                aria-label="Next month"
              >
                &gt;
              </button>
            </div>
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
            const isSelectableDay = !item.isFuture;
            const statusLabel = getCalendarStatusLabel(item.status.kind);
            const dayLabel = formatTodayLabel(item.date).full;
            const className = `calendar-day ${item.status.kind}${item.date === today ? ' today' : ''}${item.isFuture ? ' future' : ''}${selectedDate === item.date ? ' selected' : ''}${isSelectableDay ? ' interactive' : ''}`;

            if (!isSelectableDay) {
              return (
                <article key={item.date} className={className}>
                  <span>{item.value.getDate()}</span>
                  <small>{item.isFuture ? '' : statusLabel}</small>
                </article>
              );
            }

            return (
              <button
                key={item.date}
                className={className}
                type="button"
                onClick={() => setSelectedDate(item.date)}
                aria-label={`${dayLabel}. ${item.status.kind === 'none' ? 'No medicines scheduled.' : `${statusLabel}.`} Tap to review or update.`}
              >
                <span>{item.value.getDate()}</span>
                <small>{statusLabel}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section ref={selectedDayRef} className="panel stack-md native-section-panel history-detail-shell">
        {!selectedDate || !selectedStatus ? (
          <div className="history-detail-placeholder">
            <p className="eyebrow">Editable history</p>
            <h2>Tap a day to review it</h2>
            <p className="history-helper-copy">
              Choose a day in the calendar to mark medicines taken, fix a missed dose, or check what was scheduled.
            </p>
          </div>
        ) : (
          <>
          <div className="section-head">
            <div className="stack-sm">
              <p className="eyebrow">Editable history</p>
              <h2>{selectedLabel?.full}</h2>
            </div>
            <span className="muted">
              {selectedStatus.completed} of {selectedStatus.total} taken
            </span>
          </div>

          {selectedGroups.length === 0 ? (
            <div className="empty-panel">
              <h3>No routine for this date</h3>
              <p>There were no medicines scheduled on this day.</p>
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
                      <article key={medication.id} className={`medicine-row history-medicine-row${complete ? ' taken' : ' missed'}`}>
                        <div className="med-card-main">
                          <div className="med-card-title">
                            <div className="med-card-copy">
                              <h3>{medication.name}</h3>
                              <p className="med-meta">{medication.dose} · {group.slot}</p>
                              <div className="med-card-status-row">
                                <span className={`med-card-status-pill ${complete ? 'taken' : 'missed'}`}>
                                  {complete ? 'Taken' : 'Missed'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            className={`toggle-button log-toggle${complete ? ' complete' : ''}`}
                            type="button"
                            aria-label={`${complete ? 'Mark not taken' : 'Mark taken'} for ${medication.name} on ${selectedDate}`}
                            onClick={() => onToggle(selectedDate, medication.id)}
                          >
                            <LogIcon complete={complete} />
                            <span className="log-toggle-text">{complete ? 'Taken' : 'Take'}</span>
                          </button>
                        </div>
                        {medication.notes && (
                          <div className="med-card-support">
                            <p className="medicine-note">{medication.notes}</p>
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
          </>
        )}
      </section>
    </div>
  );
}
