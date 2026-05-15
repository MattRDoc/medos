import { useEffect, useRef, useState } from 'react';
import { groupMedicationsByTime } from '../lib/medications';
import { MedicationEditor, MedicationTimeIcon } from './MedicationEditor';
import type { Medication, MedicationDraft } from '../types';

interface OnboardingProps {
  medications: Medication[];
  onAddMedication: (draft: MedicationDraft) => void;
  onEditMedication: (id: string, draft: MedicationDraft) => void;
  onDeleteMedication: (id: string) => void;
  onActivateRoutine: () => void;
}

export function Onboarding({
  medications,
  onAddMedication,
  onEditMedication,
  onDeleteMedication,
  onActivateRoutine,
}: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const groups = groupMedicationsByTime(medications);
  const editingMedication = medications.find((medication) => medication.id === editingId);
  const editorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!editingMedication || !editorRef.current) return;

    editorRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [editingMedication]);

  return (
    <div className="onboarding-shell">
      {step === 0 && (
        <section className="hero-panel welcome-hero">
          <div className="welcome-frame">
            <header className="welcome-header">
              <div className="welcome-app-id">
                <div className="brand-mark" aria-hidden="true">
                  <span>+</span>
                </div>
                <span className="welcome-app-name">MedOS</span>
              </div>
              <p className="eyebrow">Private by design</p>
              <div className="welcome-title-block">
                <h1>Your medication routine, under control</h1>
                <p className="lead">
                  Track daily doses, stay consistent, and keep your logs local to this device.
                </p>
              </div>
            </header>

            <div className="welcome-visual" aria-hidden="true">
              <div className="visual-grid" />
              <div className="visual-pulse visual-pulse-a" />
              <div className="visual-pulse visual-pulse-b" />
              <div className="visual-orbit orbit-a" />
              <div className="visual-orbit orbit-b" />
              <div className="visual-hero-card">
                <div className="visual-card-top">
                  <span className="visual-kicker">Today&apos;s routine</span>
                  <span className="local-chip compact">Local only</span>
                </div>
                <div className="visual-ring-shell">
                  <div className="visual-ring">
                    <div className="visual-ring-core">
                      <div className="visual-ring-label">
                        <strong>1 of 4</strong>
                        <span>logged</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="visual-card-body">
                  <strong>One-tap logging</strong>
                  <p>Build your medication schedule once, then log each dose in seconds.</p>
                </div>
                <div className="visual-card-footer">
                  <span className="visual-footer-pill">
                    <span className="visual-footer-pill-icon" aria-hidden="true">
                      <MedicationTimeIcon option="Morning" />
                    </span>
                    <span>Morning</span>
                  </span>
                  <span className="visual-footer-pill">
                    <span className="visual-footer-pill-icon" aria-hidden="true">
                      <MedicationTimeIcon option="Afternoon" />
                    </span>
                    <span>Afternoon</span>
                  </span>
                  <span className="visual-footer-pill">
                    <span className="visual-footer-pill-icon" aria-hidden="true">
                      <MedicationTimeIcon option="Evening" />
                    </span>
                    <span>Evening</span>
                  </span>
                </div>
              </div>
            </div>

            <footer className="welcome-footer">
              <p className="welcome-reassurance">
                No account. No cloud sync. Backup anytime.
              </p>
              <p className="welcome-disclaimer">Personal tracking only. Not medical advice.</p>
              <button className="primary-button welcome-cta activate-button" type="button" onClick={() => setStep(1)}>
                Set up MedOS <span aria-hidden="true">→</span>
              </button>
            </footer>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="panel onboarding-detail-screen">
          <div className="onboarding-detail-body">
            <div className="stack-sm onboarding-detail-header">
              <p className="eyebrow">Step 2 of 3</p>
              <h2>Local-first tracking</h2>
              <p className="muted">
                MedOS stores your medication routine and logs in this browser on this device. There
                is no account, no backend server, and no cloud sync.
              </p>
            </div>

            <div className="feature-grid onboarding-detail-cards">
              <article className="mini-card onboarding-info-card">
                <strong>No account required</strong>
                <span>Open the app and start building your routine.</span>
              </article>
              <article className="mini-card onboarding-info-card">
                <strong>Stored locally</strong>
                <span>Your medications and logs stay in this browser.</span>
              </article>
              <article className="mini-card onboarding-info-card">
                <strong>Back up anytime</strong>
                <span>Export your routine and history as a JSON backup.</span>
              </article>
            </div>

            <div className="notice-card onboarding-inline-note">
              <div className="onboarding-inline-note-icon" aria-hidden="true">
                i
              </div>
              <p>Local browser data can be cleared, so backups are recommended.</p>
            </div>
          </div>

          <div className="button-row onboarding-detail-actions">
            <button className="ghost-button" type="button" onClick={() => setStep(0)}>
              Back
            </button>
            <button className="primary-button" type="button" onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="panel onboarding-detail-screen onboarding-medication-screen">
          <div className="onboarding-detail-body onboarding-medication-body">
            <MedicationEditor
              ref={editorRef}
              eyebrow="Step 3 of 3"
              title="Add medication"
              submitLabel={editingMedication ? 'Save changes' : 'Add medication'}
              initialMedication={editingMedication}
              onSubmit={(draft) => {
                if (editingMedication) {
                  onEditMedication(editingMedication.id, draft);
                  setEditingId(null);
                  return;
                }
                onAddMedication(draft);
              }}
              onCancel={editingMedication ? () => setEditingId(null) : undefined}
            />

            <section className="stack-md onboarding-added-list">
              <div className="onboarding-added-header">
                <div className="onboarding-added-header-mark" aria-hidden="true">
                  ✓
                </div>
                <div className="stack-sm">
                  <p className="eyebrow">Added medications</p>
                  <h3>Your routine so far</h3>
                </div>
              </div>
              {medications.length === 0 ? (
                <div className="empty-panel">
                  <h3>No routine yet</h3>
                  <p>Add your first medication to start building your daily routine.</p>
                </div>
              ) : (
                groups.map((group) => (
                  <div key={group.slot} className="stack-md onboarding-review-group onboarding-added-group">
                    <div className="summary-head onboarding-review-group-head">
                      <strong>{group.slot}</strong>
                    </div>
                    {group.medications.map((medication) => (
                      <article key={medication.id} className="med-card">
                        <div className="med-card-main">
                          <div className="med-card-title">
                            <div className="med-card-time-icon" aria-hidden="true">
                              <MedicationTimeIcon
                                option={
                                  medication.timeOfDay === 'Custom' ? 'Morning' : medication.timeOfDay
                                }
                              />
                            </div>
                            <div className="med-card-copy">
                              <p className="eyebrow">{medication.timeOfDay}</p>
                              <h3>{medication.name}</h3>
                              <p className="med-meta">{medication.dose}</p>
                            </div>
                          </div>
                          <div className="button-row compact">
                            <button
                              className="ghost-button small"
                              type="button"
                              onClick={() => setEditingId(medication.id)}
                            >
                              Edit
                            </button>
                            <button
                              className="ghost-button danger small"
                              type="button"
                              onClick={() => onDeleteMedication(medication.id)}
                            >
                              Delete
                            </button>
                          </div>
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
                    ))}
                  </div>
                ))
              )}
            </section>
          </div>

          <div className="button-row onboarding-detail-actions onboarding-medication-actions">
            <button className="ghost-button" type="button" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              className="primary-button activate-button"
              type="button"
              disabled={medications.length === 0}
              onClick={onActivateRoutine}
            >
              Activate routine
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
