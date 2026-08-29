import { useReducer, useState } from 'react';
import { eventToActions, initialSimState, simReducer } from '../engine/simReducer';
import { inferAnswers } from '../engine/infer';
import type { DeviceMode, IntakeAnswers, SimEvent } from '../engine/types';
import { SimApp } from './sim/SimApp';
import { useMedia } from '../lib/useMedia';

const EXAMPLES = [
  'Tell me which of my ad campaigns to stop',
  'Find the emails actually waiting on me',
  'Why are my trial users churning?',
  'Which version of my document is the current one?',
];

/**
 * The front door: Claude on the left, a short Guide on the right.
 *
 * It asks one thing — what you want — and works the rest out from the answer.
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
  const [draft, setDraft] = useState('');
  const narrow = useMedia('(max-width: 1040px)');
  const [sheetOpen, setSheetOpen] = useState(false);

  const emit = (event: SimEvent) => {
    for (const action of eventToActions(event, sim)) dispatchSim(action);
  };

  const start = (text: string) => {
    const outcome = text.trim();
    if (!outcome) return;
    onReady(inferAnswers(outcome, device));
  };

  const panel = (
    <div className="guide">
      <header className="guide-head">
        <div className="guide-head-row">
          <span className="guide-badge">GUIDE</span>
          <span className="guide-mission">Start here</span>
        </div>
      </header>

      <div className="guide-body scroll">
        <div className="guide-card">
          <h3 className="guide-title">What do you want Claude to do?</h3>
          <p className="guide-obj">
            Say it in your own words. I will set the rest up and walk you through it.
          </p>

          <textarea
            className="intake-input"
            rows={3}
            autoFocus
            value={draft}
            placeholder="e.g. Tell me which of my ad campaigns to stop"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                start(draft);
              }
            }}
          />
          <button className="gbtn gbtn-primary" disabled={!draft.trim()} onClick={() => start(draft)}>
            Start →
          </button>

          <div className="ex">
            <p className="do-label">Or try one of these</p>
            {EXAMPLES.map((e) => (
              <button key={e} className="ex-chip" onClick={() => start(e)}>
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      <footer className="guide-foot">
        <div className="guide-meter">
          <span>Simulated — nothing real is touched</span>
          <span>·</span>
          <button className="linkish" onClick={onCatalog}>
            Browse missions
          </button>
        </div>
      </footer>
    </div>
  );

  return (
    <div className="studio" data-narrow={narrow ? 'true' : 'false'}>
      <header className="studio-top">
        <div className="studio-title">
          <h2>AI Skill Simulator</h2>
        </div>
        <div className="device-switch" role="tablist" aria-label="Simulated device">
          <button role="tab" aria-selected={device === 'phone'} className="device-btn" onClick={() => setDevice('phone')}>
            <span aria-hidden>📱</span> Phone
          </button>
          <button role="tab" aria-selected={device === 'desktop'} className="device-btn" onClick={() => setDevice('desktop')}>
            <span aria-hidden>🖥️</span> Desktop
          </button>
        </div>
      </header>

      <div className="studio-grid">
        <section className="stage-col">
          <SimApp sim={sim} emit={emit} setComposer={(t) => dispatchSim({ type: 'COMPOSER', text: t })} device={device} />
        </section>
        {!narrow && <aside className="guide-col">{panel}</aside>}
      </div>

      {narrow && (
        <div className="guide-sheet" data-open={sheetOpen ? 'true' : 'false'}>
          <button className="guide-handle" onClick={() => setSheetOpen((o) => !o)}>
            <span className="guide-handle-bar" aria-hidden />
            <span className="guide-handle-label">{sheetOpen ? 'Hide' : 'What do you want Claude to do?'}</span>
          </button>
          {panel}
        </div>
      )}
    </div>
  );
}
