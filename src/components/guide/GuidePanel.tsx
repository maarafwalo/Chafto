import { useState } from 'react';
import type { MissionEngine } from '../../engine/missionEngine';
import { LEARNING_MODES, SKILLS, type LearningMode } from '../../engine/types';
import { conceptById } from '../../data/concepts';
import { FlowDiagram } from './FlowDiagram';
import { DeepDive } from './DeepDive';

const MODE_ORDER: LearningMode[] = ['guided', 'practice', 'challenge'];

/**
 * The Guide.
 *
 * One instruction at a time, and nothing else competing with it. Everything
 * that explains, teaches or configures sits behind a single "Why?" toggle —
 * available the moment it is wanted, invisible until then.
 */
export function GuidePanel({ engine: e }: { engine: MissionEngine }) {
  const { step, engine, mission, device, learningMode } = e;
  const [more, setMore] = useState(false);

  const record = step ? engine.records[step.id] : null;
  const done = !!record?.completed;
  const concept = step?.concept ? conceptById(step.concept) : undefined;
  const guided = learningMode === 'guided';
  const selected = e.sim.brief.find((f) => f.id === e.sim.openField);

  if (!step) {
    return (
      <div className="guide">
        <div className="guide-body scroll">
          <div className="guide-card">
            <h3 className="guide-title">Done.</h3>
            <p className="guide-obj">Your results are on the way.</p>
          </div>
        </div>
      </div>
    );
  }

  const primaryLabel = done
    ? engine.awaitingContinue
      ? 'Continue'
      : 'Next →'
    : step.actionType === 'observe'
      ? 'Finish'
      : 'Your move';

  return (
    <div className="guide">
      <header className="guide-head">
        <div className="guide-head-row">
          <span className="guide-badge">GUIDE</span>
          <span className="guide-mission">{mission.title}</span>
        </div>
        <div className="steps-dots" aria-label={`Step ${e.stepIndex + 1} of ${e.totalSteps}`}>
          {mission.steps.map((s, i) => (
            <span
              key={s.id}
              className="dot"
              data-state={engine.records[s.id]?.completed ? 'done' : i === e.stepIndex ? 'current' : 'todo'}
            />
          ))}
        </div>
      </header>

      <div className="guide-body scroll">
        {engine.lastSuccess && done && (
          <div className="ribbon ribbon-ok">
            <span aria-hidden>✓</span> {engine.lastSuccess}
          </div>
        )}
        {engine.feedback && (
          <div className={`ribbon ${engine.feedback.tone === 'wrong' ? 'ribbon-warn' : 'ribbon-hint'}`}>
            <span aria-hidden>{engine.feedback.tone === 'wrong' ? '↺' : '💡'}</span> {engine.feedback.text}
          </div>
        )}

        <div className="guide-card">
          <p className="eyebrow">
            Step {e.stepIndex + 1} of {e.totalSteps}
          </p>
          <h3 className="guide-title">{step.title}</h3>

          <div className="do-block" data-mode={learningMode}>
            <p className="do-text">{guided ? step.devices[device].instruction : step.objective}</p>
          </div>

          {step.actionType === 'quiz' && step.quiz && (
            <div className="quiz" data-sim-id="guide-quiz">
              <p className="quiz-prompt">{step.quiz.prompt}</p>
              {step.quiz.options.map((o) => {
                const picked = engine.quizChoice === o.id;
                return (
                  <button
                    key={o.id}
                    className="quiz-option"
                    data-state={picked ? (o.correct ? 'right' : 'wrong') : 'idle'}
                    disabled={done}
                    onClick={() => e.emit({ type: 'quiz-answer', payload: { optionId: o.id } })}
                  >
                    <span className="quiz-marker" aria-hidden>
                      {picked ? (o.correct ? '✓' : '✕') : ''}
                    </span>
                    {o.label}
                  </button>
                );
              })}
            </div>
          )}

          <button className="linkish why-link" onClick={() => setMore((m) => !m)}>
            {more ? 'Less' : 'Why?'}
          </button>

          {more && (
            <div className="more">
              <p className="why-text">{step.why}</p>
              <p className="why-more">{step.explanation}</p>

              {step.realWorld && (
                <p className="do-real">
                  <span className="do-real-tag">IN THE REAL APP</span>
                  {step.realWorld}
                </p>
              )}

              {concept && (
                <p className="more-concept">
                  <strong>{concept.term}</strong> — {concept.short}
                </p>
              )}

              {step.teach?.kind === 'flow' && <FlowDiagram nodes={step.teach.nodes} />}
              {step.teach?.kind === 'callout' && (
                <div className="teach">
                  <p className="teach-title">{step.teach.title}</p>
                  <p className="teach-body">{step.teach.body}</p>
                </div>
              )}

              {step.deepDive && step.deepDive.length > 0 && <DeepDive items={step.deepDive} />}

              <div className="chips">
                {step.learning.map((s) => (
                  <span className="chip" key={s}>
                    {SKILLS[s].label}
                  </span>
                ))}
              </div>

              <div className="mode-switch" role="tablist" aria-label="How much help">
                {MODE_ORDER.map((m) => (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={learningMode === m}
                    className="mode-btn"
                    onClick={() => e.setLearningMode(m)}
                    title={LEARNING_MODES[m].blurb}
                  >
                    {LEARNING_MODES[m].label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {selected && (
          <div className="annot">
            <p className="annot-name">{selected.label}</p>
            <p className="annot-sub">{selected.value ?? 'Not decided yet'}</p>
            <div className="annot-block">
              <span className="annot-k">Why it exists</span>
              <p>{selected.why}</p>
            </div>
            <div className="annot-block">
              <span className="annot-k">What goes wrong</span>
              <p className="annot-risk">{selected.risk}</p>
            </div>
          </div>
        )}
      </div>

      <footer className="guide-foot">
        <div className="guide-actions">
          <button className="gbtn" onClick={e.showMe} disabled={done || !e.target || !e.hintAvailable}>
            Show me
          </button>
          <button className="gbtn" onClick={e.askHint} disabled={done || !e.hintAvailable}>
            Hint
          </button>
          <button
            className="gbtn gbtn-primary"
            onClick={e.continueStep}
            disabled={!(done || step.actionType === 'observe')}
            data-sim-id="guide-continue"
          >
            {primaryLabel}
          </button>
        </div>
        <div className="guide-meter">
          <span>{Object.values(engine.records).reduce((a, r) => a + r.xpEarned, 0)} XP</span>
          <span>·</span>
          <button className="linkish" onClick={e.restart}>
            Restart
          </button>
        </div>
      </footer>
    </div>
  );
}
