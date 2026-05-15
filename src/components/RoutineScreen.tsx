import { useEffect, useRef, useState } from 'react';
import { groupMedicationsByTime } from '../lib/medications';
import { MedicationEditor } from './MedicationEditor';
import { WindowHeader } from './WindowHeader';
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const editingMedication = medications.find((medication) => medication.id === editingId);
  const groups = groupMedicationsByTime(medications);
  const activeCount = medications.filter((medication) => medication.active).length;
  const activeSummary = `${activeCount} active medicine${activeCount === 1 ? '' : 's'}`;
  const windowSummary = `${groups.length} time window${groups.length === 1 ? '' : 's'}`;
  const editorRef = useRef<HTMLElement | null>(null);
  const editorBodyRef = useRef<HTMLDivElement | null>(null);
  const openMenuRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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

  useEffect(() => {
    if (!openMenuId) return undefined;

    const closeMenu = () => setOpenMenuId(null);

    const handlePointerDown = (event: PointerEvent) => {
      if (!openMenuRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      const trigger = triggerRefs.current[openMenuId];
      closeMenu();
      window.setTimeout(() => trigger?.focus(), 0);
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuId]);

  return (
    <div className="screen-stack">
      <header className="topbar native-header-card">
        <div>
          <p className="eyebrow">Routine</p>
          <h1>Your routine</h1>
          <p className="screen-helper-copy">
            Manage medicines, doses, and daily windows.
          </p>
        </div>
      </header>

      <section className="routine-summary-line" aria-label="Routine overview">
        <span>{activeSummary}</span>
        <span aria-hidden="true">·</span>
        <span>{windowSummary}</span>
      </section>

      {groups.length === 0 ? (
        <div className="empty-panel">
          <h3>No routine yet</h3>
          <p>Add medicines to create your routine.</p>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.slot} className="window-group routine-window-group">
            <WindowHeader
              slot={group.slot}
              primary={`${group.medications.length} medicine${group.medications.length === 1 ? '' : 's'}`}
            />
            <div className="window-medicine-list">
              {group.medications.map((medication, index) => (
                <article key={medication.id} className={`medicine-row routine-medicine-row${medication.active ? '' : ' inactive'}`}>
                  <div className="med-card-main">
                    <div className="med-card-title routine-row-title">
                      <div className="med-card-copy">
                        <h3>{medication.name}</h3>
                        <p className="med-meta">{medication.dose}{medication.active ? '' : ' · Paused'}</p>
                      </div>
                    </div>
                    <div className="routine-primary-actions">
                      <button className="ghost-button small" type="button" onClick={() => handleEditMedication(medication.id)}>
                        Edit
                      </button>
                      <div
                        ref={openMenuId === medication.id ? openMenuRef : undefined}
                        className={`routine-overflow-menu${openMenuId === medication.id ? ' open' : ''}`}
                      >
                        <button
                          ref={(node) => {
                            triggerRefs.current[medication.id] = node;
                          }}
                          className="routine-overflow-trigger"
                          type="button"
                          aria-label={`More actions for ${medication.name}`}
                          aria-haspopup="menu"
                          aria-expanded={openMenuId === medication.id}
                          aria-controls={`routine-menu-${medication.id}`}
                          onClick={() =>
                            setOpenMenuId((current) => (current === medication.id ? null : medication.id))
                          }
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="6.5" cy="12" r="1.2" />
                            <circle cx="12" cy="12" r="1.2" />
                            <circle cx="17.5" cy="12" r="1.2" />
                          </svg>
                        </button>
                        {openMenuId === medication.id && (
                          <div
                            id={`routine-menu-${medication.id}`}
                            className={`routine-overflow-list${index === group.medications.length - 1 ? ' open-up' : ''}`}
                            role="menu"
                            aria-label={`Actions for ${medication.name}`}
                          >
                            <button
                              className="ghost-button small"
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setOpenMenuId(null);
                                onToggleActive(medication.id);
                              }}
                            >
                              {medication.active ? 'Pause' : 'Resume'}
                            </button>
                            {group.medications.length > 1 && index > 0 && (
                              <button
                                className="ghost-button small"
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onMoveMedication(medication.id, -1);
                                }}
                              >
                                Move up
                              </button>
                            )}
                            {group.medications.length > 1 && index < group.medications.length - 1 && (
                              <button
                                className="ghost-button small"
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onMoveMedication(medication.id, 1);
                                }}
                              >
                                Move down
                              </button>
                            )}
                            <button
                              className="ghost-button danger small"
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setOpenMenuId(null);
                                onDeleteMedication(medication.id);
                              }}
                            >
                              Delete medicine
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {medication.notes && (
                    <div className="med-card-support">
                      <p className="medicine-note">{medication.notes}</p>
                    </div>
                  )}
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
            <p className="eyebrow">Medicine</p>
            <h2>{editingMedication ? 'Edit medicine' : 'Add medicine'}</h2>
            {!editingMedication && <p className="routine-composer-subcopy">Keep the routine lean, readable, and easy to update.</p>}
          </div>
          <span className="routine-composer-toggle-icon" aria-hidden="true">
            {isComposerOpen ? '−' : '+'}
          </span>
        </button>

        {isComposerOpen && (
          <div ref={editorBodyRef} className="panel native-section-panel routine-editor-panel">
            <MedicationEditor
              title={editingMedication ? 'Edit medicine' : 'Add medicine'}
              submitLabel={editingMedication ? 'Save changes' : 'Add medicine'}
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
