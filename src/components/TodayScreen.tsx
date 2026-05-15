import { useEffect, useMemo, useRef, useState } from 'react';
import { formatTodayLabel, getGreeting } from '../lib/date';
import {
  getCompletedMedicationIdsForDate,
  getDayStatus,
  getScheduledMedicationsForDate,
  groupMedicationsByTime,
} from '../lib/medications';
import { WindowHeader } from './WindowHeader';
import type { AppState } from '../types';

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

interface TodayScreenProps {
  state: AppState;
  today: string;
  now: Date;
  onToggle: (medicationId: string) => void;
}

function findNextGroup(medications: AppState['medications'], completedMedicationIds: Set<string>) {
  return groupMedicationsByTime(medications).find((group) =>
    group.medications.some((medication) => !completedMedicationIds.has(medication.id)),
  );
}

export function TodayScreen({ state, today, now, onToggle }: TodayScreenProps) {
  const todayLabel = formatTodayLabel(today);
  const scheduled = getScheduledMedicationsForDate(state.medications, today);
  const dayStatus = getDayStatus(state, today);
  const progress = dayStatus.total ? Math.round((dayStatus.completed / dayStatus.total) * 100) : 0;
  const completedMedicationIds = useMemo(() => getCompletedMedicationIdsForDate(state.logs, today), [state.logs, today]);
  const nextGroup = findNextGroup(scheduled, completedMedicationIds);
  const nextMedication = nextGroup?.medications.find((medication) => !completedMedicationIds.has(medication.id));
  const nextActionCopy = nextMedication
    ? `${nextMedication.dose} · ${nextMedication.timeOfDay}`
    : dayStatus.total === 0
      ? 'Add medicines in Routine when you are ready to track.'
      : 'You are clear for the rest of the day.';
  const grouped = groupMedicationsByTime(scheduled);
  const [showCelebration, setShowCelebration] = useState(false);
  const previousCompletionRef = useRef({ completed: dayStatus.completed, total: dayStatus.total, date: today });
  const heroRef = useRef<HTMLElement | null>(null);

  const scrollHeroIntoView = () => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const targetTop = window.scrollY + rect.top - 18;
    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const previous = previousCompletionRef.current;
    const justCompleted =
      dayStatus.total > 0 &&
      dayStatus.completed === dayStatus.total &&
      (previous.date !== today || previous.total === 0 || previous.completed < previous.total);

    if (justCompleted) {
      setShowCelebration(true);
      requestAnimationFrame(() => {
        scrollHeroIntoView();
        window.setTimeout(() => scrollHeroIntoView(), 220);
      });
      const timeout = window.setTimeout(() => setShowCelebration(false), 4200);
      previousCompletionRef.current = { completed: dayStatus.completed, total: dayStatus.total, date: today };
      return () => window.clearTimeout(timeout);
    }

    previousCompletionRef.current = { completed: dayStatus.completed, total: dayStatus.total, date: today };
    return undefined;
  }, [dayStatus.completed, dayStatus.total, today]);

  return (
    <div className="screen-stack">
      <header className="topbar native-header-card today-header">
        <div className="today-header-copy today-header-animated">
          <p className="eyebrow">{todayLabel.full}</p>
          <h1>{getGreeting(now)}</h1>
          <p className="screen-helper-copy today-intro-copy">
            {nextGroup
              ? 'Your next medicine is due now.'
              : dayStatus.total === 0
                ? 'There is nothing scheduled for today.'
                : 'Everything for today is taken.'}
          </p>
        </div>
      </header>

      <section
        ref={heroRef}
        className={`today-flow${dayStatus.total > 0 && dayStatus.completed === dayStatus.total ? ' complete' : ''}`}
      >
        <div className="today-flow-header">
          <div>
            <p className="eyebrow">Today</p>
            <h2>{dayStatus.completed} of {dayStatus.total} taken</h2>
          </div>
          <span className="today-progress-value">{progress}%</span>
        </div>
        <div className="today-progress-track" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>

        {showCelebration ? (
          <div className="today-complete-state">
            <div className="today-complete-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8.5" />
                <path d="m8.7 12.2 2.2 2.3 4.5-5" />
              </svg>
            </div>
            <div>
              <p className="eyebrow">Routine complete</p>
              <h2>Everything is taken</h2>
              <p className="muted">Nice work. Today&apos;s routine is fully taken.</p>
            </div>
          </div>
        ) : (
          <div className="today-next-action">
            <div className="today-next-body">
              <div className="today-next-copy">
                <p className="eyebrow">Next action</p>
                <h2>{nextMedication ? nextMedication.name : dayStatus.total === 0 ? 'No medicines today' : 'All caught up'}</h2>
                <p className="muted">
                  {nextActionCopy}
                </p>
              </div>
            </div>
            <span className={`today-track-pill${nextGroup ? ' due' : ' calm'}`}>
              {nextGroup ? 'Due now' : dayStatus.total === 0 ? 'No schedule' : 'On track'}
            </span>
          </div>
        )}
      </section>

      {grouped.length === 0 ? (
        <div className="empty-panel">
          <h3>No routine yet</h3>
          <p>Add medicines in Routine to start tracking your day.</p>
        </div>
      ) : (
        grouped.map((group) => {
          const completed = group.medications.filter((medication) => completedMedicationIds.has(medication.id)).length;
          const isWindowComplete = completed === group.medications.length;

          return (
            <section
              key={group.slot}
              className={`window-group today-window-group${isWindowComplete ? ' complete' : ''}${nextGroup?.slot === group.slot ? ' current' : ''}`}
            >
              <WindowHeader
                slot={group.slot}
                primary={`${completed} of ${group.medications.length} taken`}
                secondary={isWindowComplete ? 'Taken' : undefined}
              />

              <div className="window-medicine-list">
                {group.medications.map((medication) => {
                  const complete = completedMedicationIds.has(medication.id);
                  const status = complete ? 'Taken' : nextGroup?.slot === group.slot ? 'Due now' : 'Later';

                  return (
                    <article key={medication.id} className={`medicine-row today-medicine-row${complete ? ' taken' : ''}`}>
                      <div className="med-card-main">
                        <div className="med-card-title">
                          <div className="med-card-copy">
                            <h3>{medication.name}</h3>
                            <p className="med-meta">{medication.dose}</p>
                            <div className="med-card-status-row">
                              <span className={`med-card-status-pill ${status.toLowerCase().replace(' ', '-')}`}>
                                {status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          className={`toggle-button log-toggle${complete ? ' complete' : ''}`}
                          type="button"
                          aria-label={`${complete ? 'Mark not taken' : 'Mark taken'} for ${medication.name}`}
                          onClick={() => onToggle(medication.id)}
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
          );
        })
      )}
    </div>
  );
}
