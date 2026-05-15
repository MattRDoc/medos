import { forwardRef, useEffect, useState } from 'react';
import type { Medication, MedicationDraft, TimeOfDay } from '../types';

const timeOptions: TimeOfDay[] = ['Morning', 'Afternoon', 'Evening', 'Bedtime'];
export const blankDraft: MedicationDraft = {
  name: '',
  dose: '',
  timeOfDay: 'Morning',
  customTimeLabel: '',
  frequency: 'Once daily',
  notes: '',
  spacingReminder: '',
  startDate: '',
  endDate: '',
};

function toDraft(medication?: Medication): MedicationDraft {
  if (!medication) return blankDraft;
  return {
    name: medication.name,
    dose: medication.dose,
    timeOfDay: medication.timeOfDay === 'Custom' ? 'Morning' : medication.timeOfDay,
    customTimeLabel: '',
    frequency: 'Once daily',
    notes: medication.notes ?? '',
    spacingReminder: '',
    startDate: '',
    endDate: '',
  };
}

function TimeIcon({ option }: { option: TimeOfDay }) {
  if (option === 'Morning') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4.25" />
        <path d="M12 2.75v3.1M12 18.15v3.1M21.25 12h-3.1M5.85 12h-3.1M18.54 5.46l-2.2 2.2M7.66 16.34l-2.2 2.2M18.54 18.54l-2.2-2.2M7.66 7.66l-2.2-2.2" />
      </svg>
    );
  }

  if (option === 'Afternoon') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4.25a7.75 7.75 0 1 1 0 15.5Z" />
        <path d="M12 4.25a7.75 7.75 0 0 0 0 15.5" fill="none" />
      </svg>
    );
  }

  if (option === 'Evening') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 14.25h16" />
        <path d="M8 14.25a4 4 0 1 1 8 0" />
        <path d="M7 18.25h10" />
      </svg>
    );
  }

  if (option === 'Bedtime') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15.8 4.5a6.9 6.9 0 1 0 3.7 12.75A7.6 7.6 0 1 1 15.8 4.5Z" />
      </svg>
    );
  }

  return null;
}

export function MedicationTimeIcon({ option }: { option: TimeOfDay }) {
  return <TimeIcon option={option} />;
}

interface MedicationEditorProps {
  eyebrow?: string;
  title: string;
  submitLabel: string;
  initialMedication?: Medication;
  onSubmit: (draft: MedicationDraft) => void;
  onCancel?: () => void;
  showHeader?: boolean;
}

export const MedicationEditor = forwardRef<HTMLElement, MedicationEditorProps>(function MedicationEditor(
  {
    eyebrow = 'Medication',
    title,
    submitLabel,
    initialMedication,
    onSubmit,
    onCancel,
    showHeader = true,
  },
  ref,
) {
  const [draft, setDraft] = useState<MedicationDraft>(toDraft(initialMedication));

  useEffect(() => {
    setDraft(toDraft(initialMedication));
  }, [initialMedication]);

  return (
    <section ref={ref} className="panel panel-strong stack-lg">
      {showHeader && (
        <div className="stack-sm">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      )}

      <form
        className="stack-md"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(draft);
          setDraft(blankDraft);
        }}
      >
          <label className="field">
            <span className="field-label">Medication name</span>
            <input
              aria-label="Medication name"
              placeholder="Medication name"
            required
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
        </label>

        <label className="field">
          <span className="field-label">Dose</span>
          <input
            aria-label="Dose"
            placeholder="e.g. 5mg"
            required
            value={draft.dose}
            onChange={(event) => setDraft({ ...draft, dose: event.target.value })}
          />
        </label>

        <div className="stack-sm">
          <span className="field-label">Time of day</span>
          <div className="pill-grid" role="radiogroup" aria-label="Time of day">
            {timeOptions.map((option) => {
              return (
                <button
                  key={option}
                  className={`time-pill${draft.timeOfDay === option ? ' active' : ''}`}
                  type="button"
                  onClick={() => setDraft({ ...draft, timeOfDay: option })}
                >
                  <span className="time-pill-icon" aria-hidden="true">
                    <TimeIcon option={option} />
                  </span>
                  <strong>{option}</strong>
                </button>
              );
            })}
          </div>
        </div>

        <label className="field">
          <span className="field-label">Optional notes or instructions</span>
          <textarea
            aria-label="Optional notes or instructions"
            placeholder="e.g. Take on an empty stomach"
            rows={3}
            value={draft.notes}
            onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
          />
        </label>

        <div className="button-row editor-actions">
          {onCancel && (
            <button className="ghost-button" type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button className="primary-button" type="submit">
            {submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
});
