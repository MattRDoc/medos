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
                <h1>Your medicine routine, made simple</h1>
                <p className="lead">
                  Track daily doses, review your routine, and keep everything on this device.
                </p>
              </div>
            </header>

            <div className="welcome-visual" aria-hidden="true">
              <div className="welcome-preview-card">
                <div className="welcome-preview-top">
                  <span className="visual-kicker">Today&apos;s routine</span>
                  <span className="local-chip compact">Private on this device</span>
                </div>
                <div className="welcome-preview-main">
                  <div className="welcome-preview-title">
                    <strong>Morning</strong>
                    <span>2 medicines due next</span>
                  </div>
                  <div className="welcome-preview-metric">
                    <strong>25%</strong>
                    <span>Taken today</span>
                  </div>
                </div>
                <div className="welcome-preview-progress" role="presentation">
                  <span style={{ width: '25%' }} />
                </div>
                <div className="welcome-preview-list">
                  <div className="welcome-preview-row">
                    <div className="welcome-preview-row-main">
                      <span className="welcome-preview-icon" aria-hidden="true">
                        <MedicationTimeIcon option="Morning" />
                      </span>
                      <div className="welcome-preview-copy">
                        <strong>Morning</strong>
                        <span>2 medicines due now</span>
                      </div>
                    </div>
                    <span className="visual-status-pill">Due now</span>
                  </div>
                  <div className="welcome-preview-row quiet">
                    <div className="welcome-preview-row-main">
                      <span className="welcome-preview-icon" aria-hidden="true">
                        <MedicationTimeIcon option="Bedtime" />
                      </span>
                      <div className="welcome-preview-copy">
                        <strong>Bedtime</strong>
                        <span>1 medicine coming later</span>
                      </div>
                    </div>
                    <span className="visual-status-pill quiet">Later</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="welcome-value-list" aria-label="Why MedOS">
              <div className="welcome-value-item">
                <span className="welcome-value-dot" aria-hidden="true" />
                <span>One-tap daily tracking</span>
              </div>
              <div className="welcome-value-item">
                <span className="welcome-value-dot" aria-hidden="true" />
                <span>Private on this device</span>
              </div>
              <div className="welcome-value-item">
                <span className="welcome-value-dot" aria-hidden="true" />
                <span>Backup anytime</span>
              </div>
            </div>

            <footer className="welcome-footer">
              <p className="welcome-reassurance">
                No account. No cloud sync.
              </p>
              <button className="primary-button welcome-cta activate-button" type="button" onClick={() => setStep(1)}>
                Set up my routine
              </button>
              <p className="welcome-disclaimer">Personal tracking only. Not medical advice.</p>
            </footer>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="panel onboarding-detail-screen">
          <div className="onboarding-detail-body">
            <div className="stack-sm onboarding-detail-header">
              <p className="eyebrow">Setup 1 of 2</p>
              <h2>Local-first tracking</h2>
              <p className="muted">
                MedOS stores your medicine routine and logs in this browser on this device. There
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
                <span>Your medicines and logs stay in this browser.</span>
              </article>
              <article className="mini-card onboarding-info-card">
                <strong>Back up anytime</strong>
                <span>Keep a portable copy of your routine and history whenever you need it.</span>
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
              eyebrow="Setup 2 of 2"
              title="Add your first medicine"
              submitLabel={editingMedication ? 'Save changes' : 'Add medicine'}
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
                  <p className="eyebrow">Added medicines</p>
                  <h3>Your routine so far</h3>
                </div>
              </div>
              {medications.length === 0 ? (
                <div className="empty-panel">
                  <h3>No routine yet</h3>
                  <p>Add your first medicine to start building your daily routine.</p>
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
              {medications.length === 0 ? 'Add one medicine to continue' : 'Continue to Today'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
