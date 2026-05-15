import { useEffect, useRef, useState } from 'react';
import { groupMedicationsByTime } from '../lib/medications';
import { MedicationEditor, MedicationTimeIcon } from './MedicationEditor';
import type { Medication, MedicationDraft } from '../types';

interface RoutineScreenProps {
  medications: Medication[];
  onAddMedication: (draft: MedicationDraft) => void;
  onEditMedication: (id: string, draft: MedicationDraft) => void;
  onDeleteMedication: (id: string) => void;
  onToggleActive: (id: string) => void;
  onMoveMedication: (id: string, direction: -1 | 1) => void;
}

export function RoutineScreen({
  medications,
  onAddMedication,
  onEditMedication,
  onDeleteMedication,
  onToggleActive,
  onMoveMedication,
}: RoutineScreenProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(medications.length === 0);
  const editingMedication = medications.find((medication) => medication.id === editingId);
  const groups = groupMedicationsByTime(medications);
  const activeCount = medications.filter((medication) => medication.active).length;
  const editorRef = useRef<HTMLElement | null>(null);
  const editorBodyRef = useRef<HTMLDivElement | null>(null);

  const scrollToComposer = () => {
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      editorBodyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const handleEditMedication = (medicationId: string) => {
    setIsComposerOpen(true);
    setEditingId(medicationId);
    scrollToComposer();
  };

  useEffect(() => {
    if (!editingMedication) return;
    scrollToComposer();
  }, [editingMedication]);

  return (
    <div className="screen-stack">
      <header className="topbar native-header-card">
        <div>
          <p className="eyebrow">Routine</p>
          <h1>Medication schedule</h1>
          <p className="screen-helper-copy">
            Build once, then keep the schedule tidy with quick edits and lightweight controls.
          </p>
        </div>
      </header>

      <section className="split-grid routine-summary">
        <article className="mini-card native-stat-card">
          <p className="eyebrow">Active</p>
          <strong>{activeCount}</strong>
          <span>{activeCount === 1 ? 'Medication live' : 'Medications live'}</span>
        </article>
        <article className="mini-card native-stat-card">
          <p className="eyebrow">Windows</p>
          <strong>{groups.length}</strong>
          <span>{groups.length === 1 ? 'Time slot configured' : 'Time slots configured'}</span>
        </article>
      </section>

      {groups.length === 0 ? (
        <div className="empty-panel">
          <h3>No routine yet</h3>
          <p>Add medication entries to create your schedule.</p>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.slot} className="panel stack-md native-section-panel">
            <div className="section-head">
              <h2>{group.slot}</h2>
              <span className="muted">{group.medications.length} items</span>
            </div>
            <div className="stack-md">
              {group.medications.map((medication, index) => (
                <article key={medication.id} className={`med-card native-med-card med-card-modern${medication.active ? '' : ' inactive'}`}>
                  <div className="med-card-main">
                    <div className="med-card-title">
                      <div className="med-card-time-icon" aria-hidden="true">
                        <MedicationTimeIcon option={medication.timeOfDay === 'Custom' ? 'Morning' : medication.timeOfDay} />
                      </div>
                      <div className="med-card-copy">
                        <p className="eyebrow">{medication.timeOfDay}</p>
                        <h3>{medication.name}</h3>
                        <p className="med-meta">{medication.dose}</p>
                        <div className="med-card-status-row">
                          <span className={`med-card-status-pill${medication.active ? ' live' : ' paused'}`}>
                            {medication.active ? 'Active' : 'Paused'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className={`toggle-button routine-live-toggle${medication.active ? ' complete' : ''}`}
                      type="button"
                      onClick={() => onToggleActive(medication.id)}
                    >
                      {medication.active ? 'Live' : 'Paused'}
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
                  <div className="button-row compact routine-card-actions">
                    <div className="button-row compact">
                      <button className="ghost-button small" type="button" onClick={() => handleEditMedication(medication.id)}>
                        Edit
                      </button>
                      <button className="ghost-button danger small" type="button" onClick={() => onDeleteMedication(medication.id)}>
                        Delete
                      </button>
                    </div>
                    <div className="button-row compact">
                      <button
                        className="ghost-button small"
                        type="button"
                        disabled={index === 0}
                        onClick={() => onMoveMedication(medication.id, -1)}
                      >
                        Move up
                      </button>
                      <button
                        className="ghost-button small"
                        type="button"
                        disabled={index === group.medications.length - 1}
                        onClick={() => onMoveMedication(medication.id, 1)}
                      >
                        Move down
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}

      <section
        ref={editorRef}
        className={`stack-md native-section-panel routine-composer-section${isComposerOpen ? ' open' : ''}`}
      >
        <button
          className={`routine-composer-toggle${isComposerOpen ? ' open' : ''}`}
          type="button"
          onClick={() => {
            setEditingId(null);
            setIsComposerOpen((current) => !current);
          }}
          aria-expanded={isComposerOpen}
        >
          <div>
            <p className="eyebrow">Medication</p>
            <h2>{editingMedication ? 'Edit medication' : 'Add medication'}</h2>
            {!editingMedication && <p className="routine-composer-subcopy">Keep the routine lean, readable, and easy to update.</p>}
          </div>
          <span className="routine-composer-toggle-icon" aria-hidden="true">
            {isComposerOpen ? '−' : '+'}
          </span>
        </button>

        {isComposerOpen && (
          <div ref={editorBodyRef} className="panel native-section-panel routine-editor-panel">
            <MedicationEditor
              title={editingMedication ? 'Edit medication' : 'Add medication'}
              submitLabel={editingMedication ? 'Save changes' : 'Add medication'}
              initialMedication={editingMedication}
              showHeader={false}
              onSubmit={(draft) => {
                if (editingMedication) {
                  onEditMedication(editingMedication.id, draft);
                  setEditingId(null);
                  setIsComposerOpen(false);
                  return;
                }
                onAddMedication(draft);
                setIsComposerOpen(false);
              }}
              onCancel={
                editingMedication
                  ? () => {
                      setEditingId(null);
                      setIsComposerOpen(false);
                    }
                  : undefined
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}
