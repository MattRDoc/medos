import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { formatTodayLabel, getGreeting } from '../lib/date';
import {
  getCompletedMedicationIdsForDate,
  getCurrentStreak,
  getDayStatus,
  getScheduledMedicationsForDate,
  groupMedicationsByTime,
} from '../lib/medications';
import type { AppState } from '../types';
import { MedicationTimeIcon } from './MedicationEditor';

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
  const streak = getCurrentStreak(state, today);
  const completedMedicationIds = useMemo(() => getCompletedMedicationIdsForDate(state.logs, today), [state.logs, today]);
  const nextGroup = findNextGroup(scheduled, completedMedicationIds);
  const grouped = groupMedicationsByTime(scheduled);
  const [showCelebration, setShowCelebration] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const previousCompletionRef = useRef({ completed: dayStatus.completed, total: dayStatus.total, date: today });
  const previousDateRef = useRef(today);
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
    if (previousDateRef.current !== today) {
      previousDateRef.current = today;
      setAnimatedProgress(0);
      const frame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setAnimatedProgress(progress));
      });
      return () => window.cancelAnimationFrame(frame);
    }

    const frame = window.requestAnimationFrame(() => setAnimatedProgress(progress));
    return () => window.cancelAnimationFrame(frame);
  }, [progress, today]);

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
              ? 'Your next dose window is ready to review.'
              : dayStatus.total === 0
                ? 'There is nothing scheduled for today.'
                : 'You are clear for the rest of the day.'}
          </p>
        </div>
      </header>

      <section
        ref={heroRef}
        className={`hero-progress panel panel-strong today-hero-panel${dayStatus.total > 0 && dayStatus.completed === dayStatus.total ? ' complete' : ''}${showCelebration ? ' celebrating' : ''}`}
      >
        {showCelebration ? (
          <div className="today-hero-complete">
            <div className="today-hero-complete-core" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8.5" />
                <path d="m8.7 12.2 2.2 2.3 4.5-5" />
              </svg>
            </div>
            <div className="today-hero-complete-copy">
              <p className="eyebrow">Routine complete</p>
              <h2>Everything is logged</h2>
              <p className="muted">Nice work. Today&apos;s routine is fully complete.</p>
            </div>
          </div>
        ) : (
          <div className="today-hero-grid">
            <div className="today-hero-copy">
              <p className="eyebrow">Up next</p>
              <h2>
                {nextGroup ? nextGroup.slot : dayStatus.total === 0 ? 'No doses today' : 'All caught up'}
              </h2>
              <p className="muted">
                {nextGroup
                  ? `${nextGroup.medications.filter((medication) => !completedMedicationIds.has(medication.id)).length} medication${nextGroup.medications.filter((medication) => !completedMedicationIds.has(medication.id)).length === 1 ? '' : 's'} still waiting in this window.`
                  : dayStatus.total === 0
                    ? 'No active medications are scheduled for this date.'
                    : 'Everything scheduled for today has already been logged.'}
              </p>
            </div>
            <div
              className="progress-ring progress-ring-compact"
              style={{ '--progress': `${animatedProgress}` } as CSSProperties}
            >
              <svg className="progress-ring-svg" viewBox="0 0 120 120" aria-hidden="true">
                <circle className="progress-ring-track" cx="60" cy="60" r="44" />
                <circle
                  className="progress-ring-value"
                  cx="60"
                  cy="60"
                  r="44"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 44}`,
                    strokeDashoffset: `${2 * Math.PI * 44 * (1 - animatedProgress / 100)}`,
                  }}
                />
              </svg>
              <div>
                <p className="eyebrow">Today</p>
                <h3>{progress}%</h3>
                <p className="muted">
                  {dayStatus.completed} of {dayStatus.total}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="split-grid today-metrics-grid">
        <article className="mini-card native-stat-card today-stat-card">
          <p className="eyebrow">Completion</p>
          <strong>{dayStatus.completed} of {dayStatus.total}</strong>
          <span className="today-next-up-copy">
            {dayStatus.total === 0 ? 'Nothing scheduled' : progress === 100 ? 'Routine complete' : `${progress}% of today logged`}
          </span>
        </article>
        <article className="mini-card native-stat-card today-stat-card">
          <p className="eyebrow">Streak</p>
          <strong>{streak} days</strong>
          <span className="today-next-up-copy">Fully completed days in a row</span>
        </article>
      </section>

      {grouped.length === 0 ? (
        <div className="empty-panel">
          <h3>No routine yet</h3>
          <p>Add medications in Routine to start tracking your day.</p>
        </div>
      ) : (
        grouped.map((group) => {
          const completed = group.medications.filter((medication) => completedMedicationIds.has(medication.id)).length;

          return (
            <section key={group.slot} className="stack-md today-med-group">
              <div className="section-head">
                <h2>{group.slot}</h2>
                <span className="muted">
                  {completed} of {group.medications.length}
                </span>
              </div>

              <div className="stack-md">
                {group.medications.map((medication) => {
                  const complete = completedMedicationIds.has(medication.id);

                  return (
                    <article key={medication.id} className={`med-card native-med-card med-card-modern${complete ? ' completed' : ''}`}>
                      <div className="med-card-main">
                        <div className="med-card-title">
                          <div className="med-card-time-icon" aria-hidden="true">
                            <MedicationTimeIcon option={medication.timeOfDay} />
                          </div>
                          <div className="med-card-copy">
                            <p className="eyebrow">{medication.timeOfDay}</p>
                            <h3>{medication.name}</h3>
                            <p className="med-meta">{medication.dose}</p>
                            <div className="med-card-status-row">
                              <span className={`med-card-status-pill${complete ? ' complete' : ''}`}>
                                {complete ? 'Logged' : 'Ready'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          className={`toggle-button log-toggle${complete ? ' complete' : ''}`}
                          type="button"
                          aria-label={`${complete ? 'Mark incomplete' : 'Mark complete'} for ${medication.name}`}
                          onClick={() => onToggle(medication.id)}
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
          );
        })
      )}
    </div>
  );
}
