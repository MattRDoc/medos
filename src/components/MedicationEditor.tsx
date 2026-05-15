import { forwardRef, useEffect, useState } from 'react';
import type { Medication, MedicationDraft, TimeOfDay } from '../types';
import { TimeWindowIcon } from './TimeWindowIcon';

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

export function MedicationTimeIcon({ option }: { option: TimeOfDay }) {
  return <TimeWindowIcon option={option} />;
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
    eyebrow = 'Medicine',
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
            <span className="field-label">Medicine name</span>
            <input
              aria-label="Medicine name"
              placeholder="Medicine name"
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
                    <TimeWindowIcon option={option} />
                  </span>
                  <strong>{option}</strong>
                </button>
              );
            })}
          </div>
        </div>

        <label className="field">
          <span className="field-label">Instructions</span>
          <textarea
            aria-label="Instructions"
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
