import { useMemo, useReducer, useState } from 'react';
import { INTAKE } from '../engine/intake';
import { eventToActions, initialSimState, simReducer } from '../engine/simReducer';
import type { DeviceMode, IntakeAnswers, LearningMode, SimEvent } from '../engine/types';
import { SimApp } from './sim/SimApp';
import { useMedia } from '../lib/useMedia';

/**
 * The front door.
 *
 * Claude on one side, the Guide on the other — and before anything is taught,
 * the Guide asks what the learner actually wants. The simulated app is live the
 * whole time, so they can poke at it while they answer.
 */
export function Workspace({
  onReady,
  onCatalog,
}: {
  onReady: (answers: IntakeAnswers) => void;
  onCatalog: () => void;
}) {
  const [sim, dispatchSim] = useReducer(simReducer, undefined, initialSimState);
  const [device, setDevice] = useState<DeviceMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < 900 ? 'phone' : 'desktop',
  );
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState('');
  const narrow = useMedia('(max-width: 1040px)');
  const [sheetOpen, setSheetOpen] = useState(false);

  const emit = (event: SimEvent) => {
    for (const action of eventToActions(event, sim)) dispatchSim(action);
  };
  const setComposer = (text: string) => dispatchSim({ type: 'COMPOSER', text });

  const question = index < INTAKE.length ? INTAKE[index] : null;
  const done = index >= INTAKE.length;

  const answer = (value: string) => {
    const q = INTAKE[index];
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    if (q.id === 'device') setDevice(value as DeviceMode);
    setDraft('');
    setIndex((i) => i + 1);
  };

  const back = () => {
    if (index === 0) return;
    setIndex((i) => i - 1);
    setDraft('');
  };

  const plan = useMemo(() => {
    const source = answers.source;
    const usesConnector = source && source !== 'none';
    const wantsAction = answers.stakes && answers.stakes !== 'readonly';
    const items = ['See exactly what Claude can reach right now'];
    if (usesConnector) {
      items.push('Add the connector to your account and read its permissions');
      items.push('Switch it on for this conversation — the step people miss');
    }
    items.push('Write the instruction yourself, in your own words');
    if (usesConnector) {
      items.push('Answer the tool permission prompt');
      items.push('Open the tool call and see where the answer came from');
      items.push('Prove you can defend the conclusion from the data');
    }
    if (usesConnector && wantsAction) {
      items.push('Push it from an answer to a prepared action');
      if (answers.stakes === 'draft') items.push('Approve or reject it — the checkpoint you chose');
    }
    items.push('Name the shape so you can reuse it');
    return items;
  }, [answers]);

  const start = () => {
    onReady({
      goal: (answers.goal ?? 'analyse') as IntakeAnswers['goal'],
      source: answers.source ?? 'none',
      stakes: (answers.stakes ?? 'draft') as IntakeAnswers['stakes'],
      outcome: answers.outcome?.trim() || 'Get a useful answer I can act on',
      constraint: answers.constraint?.trim() ?? '',
      device,
      mode: (answers.mode ?? 'guided') as LearningMode,
    });
  };

  const panel = (
    <div className="guide">
      <header className="guide-head">
        <div className="guide-head-row">
          <span className="guide-badge">GUIDE</span>
          <span className="guide-mission">Setting up your walkthrough</span>
        </div>
        <div className="steps-dots" aria-label={`Question ${Math.min(index + 1, INTAKE.length)} of ${INTAKE.length}`}>
          {INTAKE.map((q, i) => (
            <span key={q.id} className="dot" data-state={i < index ? 'done' : i === index ? 'current' : 'todo'} />
          ))}
        </div>
      </header>

      <div className="guide-body scroll">
        {index === 0 && !answers.goal && (
          <div className="ribbon ribbon-quiet">
            <span aria-hidden>✳</span> That is a simulated Claude on the left. It is fully clickable —
            have a poke around while we talk.
          </div>
        )}

        {question && (
          <div className="guide-card">
            <p className="eyebrow">
              {question.eyebrow} · {index + 1} of {INTAKE.length}
            </p>
            <h3 className="guide-title">{question.prompt}</h3>
            {question.help && <p className="guide-obj">{question.help}</p>}

            {question.kind === 'choice' && (
              <div className="intake-options">
                {question.options?.map((o) => (
                  <button key={o.id} className="intake-option" onClick={() => answer(o.id)}>
                    <span className="intake-option-label">{o.label}</span>
                    <span className="intake-option-detail">{o.detail}</span>
                  </button>
                ))}
              </div>
            )}

            {question.kind === 'text' && (
              <div className="intake-text">
                <textarea
                  className="intake-input"
                  rows={3}
                  value={draft}
                  placeholder={question.placeholder}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && draft.trim()) {
                      e.preventDefault();
                      answer(draft);
                    }
                  }}
                />
                <div className="intake-text-actions">
                  {question.optional && (
                    <button className="gbtn" onClick={() => answer('')}>
                      Nothing comes to mind
                    </button>
                  )}
                  <button className="gbtn gbtn-primary" disabled={!draft.trim()} onClick={() => answer(draft)}>
                    Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {done && (
          <>
            <div className="guide-card">
              <p className="eyebrow">Your walkthrough</p>
              <h3 className="guide-title">Here is what we will do.</h3>
              <p className="guide-obj">
                Built from your answers — not a stock lesson. You said you wanted:{' '}
                <em>“{answers.outcome || 'a useful answer'}”</em>
              </p>
              <ol className="plan-list">
                {plan.map((p, i) => (
                  <li key={p}>
                    <span className="plan-num">{String(i + 1).padStart(2, '0')}</span>
                    {p}
                  </li>
                ))}
              </ol>
              {answers.constraint && (
                <div className="teach">
                  <p className="teach-title">Your rule</p>
                  <p className="teach-body">“{answers.constraint}” — we will hold the walkthrough to it.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <footer className="guide-foot">
        <div className="guide-actions">
          <button className="gbtn" onClick={back} disabled={index === 0}>
            ← Back
          </button>
          <button className="gbtn" onClick={onCatalog}>
            Browse missions
          </button>
          {done && (
            <button className="gbtn gbtn-primary" onClick={start}>
              Start my walkthrough →
            </button>
          )}
        </div>
        <div className="guide-meter">
          <span>Nothing here is real — no account is contacted</span>
        </div>
      </footer>
    </div>
  );

  return (
    <div className="studio" data-narrow={narrow ? 'true' : 'false'}>
      <header className="studio-top">
        <div className="studio-title">
          <span className="eyebrow">AI Skill Simulator</span>
          <h2>What do you want Claude to do?</h2>
        </div>
        <div className="device-switch" role="tablist" aria-label="Simulated device">
          <button role="tab" aria-selected={device === 'phone'} className="device-btn" onClick={() => setDevice('phone')}>
            <span aria-hidden>📱</span> Phone
          </button>
          <button role="tab" aria-selected={device === 'desktop'} className="device-btn" onClick={() => setDevice('desktop')}>
            <span aria-hidden>🖥️</span> Desktop
          </button>
        </div>
        <div className="studio-meta">
          <span className="meta-num">Setup</span>
        </div>
      </header>

      <div className="studio-grid">
        <section className="stage-col">
          <div className="stage-bar">
            <span className="stage-where">
              <span className="eyebrow">On the left</span>
              <strong>A simulated Claude — click anything</strong>
            </span>
            <span className="stage-flag">SIMULATION — no real accounts, no real spend</span>
          </div>
          <SimApp sim={sim} emit={emit} setComposer={setComposer} device={device} />
        </section>

        {!narrow && <aside className="guide-col">{panel}</aside>}
      </div>

      {narrow && (
        <div className="guide-sheet" data-open={sheetOpen ? 'true' : 'false'}>
          <button className="guide-handle" onClick={() => setSheetOpen((o) => !o)}>
            <span className="guide-handle-bar" aria-hidden />
            <span className="guide-handle-label">
              {sheetOpen ? 'Hide' : `Guide · question ${Math.min(index + 1, INTAKE.length)} of ${INTAKE.length}`}
            </span>
          </button>
          {!sheetOpen && question && (
            <div className="guide-peek">
              <span className="do-label">{question.eyebrow}</span>
              <p>{question.prompt}</p>
            </div>
          )}
          {!sheetOpen && done && (
            <div className="guide-peek">
              <span className="do-label">Ready</span>
              <p>Your walkthrough is built — open the Guide to start it.</p>
            </div>
          )}
          {panel}
        </div>
      )}
    </div>
  );
}
