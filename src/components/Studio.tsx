import { useEffect, useRef, useState } from 'react';
import { useMissionEngine } from '../engine/missionEngine';
import type { DeviceMode, LearningMode, Mission, RunScore, SkillId } from '../engine/types';
import { SimApp } from './sim/SimApp';
import { GuidePanel } from './guide/GuidePanel';
import { Spotlight } from './overlay/Spotlight';
import { useMedia } from '../lib/useMedia';

export interface RunResult {
  mission: Mission;
  score: RunScore;
  gains: Record<SkillId, number>;
  concepts: string[];
}

/**
 * The two-pane learning surface: simulated app on one side, Guide on the other.
 * On narrow screens the Guide becomes a bottom sheet — the simulated device is
 * always the thing with the most room, because that is what you learn on.
 */
export function Studio({
  mission,
  device,
  learningMode,
  onExit,
  onComplete,
}: {
  mission: Mission;
  device: DeviceMode;
  learningMode: LearningMode;
  onExit: () => void;
  onComplete: (result: RunResult) => void;
}) {
  const e = useMissionEngine(mission, { device, learningMode });
  const narrow = useMedia('(max-width: 1040px)');
  const [guideOpen, setGuideOpen] = useState(false);
  const reported = useRef(false);

  // Report the finished run exactly once.
  useEffect(() => {
    if (e.engine.status === 'complete' && !reported.current) {
      reported.current = true;
      onComplete({ mission, score: e.score(), gains: e.gains(), concepts: e.engine.unlocked });
    }
  }, [e.engine.status, e, mission, onComplete]);

  // Toasts are presentation only — they clear themselves. Keyed on the toast id
  // (not the engine object) so the timer is not restarted by every re-render.
  const toastId = e.sim.toast?.id ?? null;
  const dispatchSim = e.dispatchSim;
  useEffect(() => {
    if (!toastId) return;
    const t = window.setTimeout(() => dispatchSim({ type: 'TOAST', toast: null }), 2600);
    return () => window.clearTimeout(t);
  }, [toastId, dispatchSim]);

  // When a new step arrives on a phone-sized screen, surface the Guide.
  useEffect(() => {
    if (narrow) setGuideOpen(false);
  }, [e.stepIndex, narrow]);

  const step = e.step;

  return (
    <div className="studio" data-narrow={narrow ? 'true' : 'false'}>
      <header className="studio-top">
        <button className="tbtn" onClick={onExit}>
          ← Missions
        </button>
        <div className="studio-title">
          <span className="eyebrow">
            Mission {String(mission.order).padStart(2, '0')}
            {mission.variant === 'challenge' && ' · Challenge'}
          </span>
          <h2>{mission.title}</h2>
        </div>

        <div className="device-switch" role="tablist" aria-label="Simulated device">
          <button
            role="tab"
            aria-selected={e.device === 'phone'}
            className="device-btn"
            onClick={() => e.setDevice('phone')}
          >
            <span aria-hidden>📱</span> Phone
          </button>
          <button
            role="tab"
            aria-selected={e.device === 'desktop'}
            className="device-btn"
            onClick={() => e.setDevice('desktop')}
          >
            <span aria-hidden>🖥️</span> Desktop
          </button>
        </div>

        <div className="studio-meta">
          <span className="meta-num">
            {String(Math.floor(e.elapsed / 60)).padStart(2, '0')}:
            {String(e.elapsed % 60).padStart(2, '0')}
          </span>
          <span className="meta-sep" />
          <span className="meta-num">
            {Object.values(e.engine.records).reduce((a, r) => a + r.xpEarned, 0)} XP
          </span>
        </div>
      </header>

      <div className="studio-grid">
        <section className="stage-col">
          <div className="stage-bar">
            <span className="stage-where">
              <span className="eyebrow">You are here</span>
              <strong>
                {e.device === 'phone' ? 'Phone' : 'Desktop'} ·{' '}
                {e.ctx.screen === 'connector-detail' ? 'Connector' : e.ctx.screen}
              </strong>
            </span>
            <span className="stage-next">
              <span className="eyebrow">Next</span>
              <strong>{step ? step.title : 'Finished'}</strong>
            </span>
            <span className="stage-flag">SIMULATION — no real accounts, no real spend</span>
          </div>
          <SimApp sim={e.sim} emit={e.emit} setComposer={e.setComposer} device={e.device} />
        </section>

        {!narrow && (
          <aside className="guide-col">
            <GuidePanel engine={e} />
          </aside>
        )}
      </div>

      {narrow && (
        <div className="guide-sheet" data-open={guideOpen ? 'true' : 'false'}>
          <button className="guide-handle" onClick={() => setGuideOpen((o) => !o)}>
            <span className="guide-handle-bar" aria-hidden />
            <span className="guide-handle-label">
              {guideOpen ? 'Hide Guide' : `Guide · Step ${e.stepIndex + 1} of ${e.totalSteps}`}
            </span>
          </button>
          {!guideOpen && step && (
            <div className="guide-peek">
              <span className="do-label">
                {e.learningMode === 'guided' ? 'Do this' : 'Your objective'}
              </span>
              <p>
                {e.learningMode === 'guided' ? step.devices[e.device].instruction : step.objective}
              </p>
            </div>
          )}
          <GuidePanel engine={e} />
        </div>
      )}

      <Spotlight
        targetId={e.target?.id ?? null}
        caption={e.target?.caption ?? (step ? step.devices[e.device].instruction : '')}
        stepNumber={e.stepIndex + 1}
        active={e.showTarget}
        demo={e.engine.demo}
      />
    </div>
  );
}
