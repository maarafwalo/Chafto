import type { MissionEngine } from '../../engine/missionEngine';
import { LEARNING_MODES, type LearningMode } from '../../engine/types';
import { conceptById } from '../../data/concepts';
import { ConceptCard } from './ConceptCard';
import { FlowDiagram } from './FlowDiagram';
import { SKILLS } from '../../engine/types';

const MODE_ORDER: LearningMode[] = ['guided', 'practice', 'challenge'];

/**
 * The interactive tutor.
 *
 * Everything it says is derived from engine state — current step, device mode,
 * what the learner has already tried — so it can never fall out of sync with
 * the simulation next to it.
 */
export function GuidePanel({ engine: e }: { engine: MissionEngine }) {
  const { step, engine, mission, device, learningMode } = e;
  const record = step ? engine.records[step.id] : null;
  const done = !!record?.completed;
  const concept = step?.concept ? conceptById(step.concept) : undefined;
  const instruction = step ? step.devices[device].instruction : '';
  const note = step ? step.devices[device].note : undefined;
  const guided = learningMode === 'guided';

  const xpSoFar = Object.values(engine.records).reduce((a, r) => a + r.xpEarned, 0);

  if (!step) {
    return (
      <div className="guide">
        <div className="guide-body scroll">
          <div className="guide-card">
            <p className="eyebrow">Mission complete</p>
            <h3 className="guide-title">Nice work.</h3>
            <p className="guide-obj">Your results are on the right.</p>
          </div>
        </div>
      </div>
    );
  }

  const primaryLabel = done
    ? engine.awaitingContinue
      ? 'Continue'
      : 'Next step →'
    : step.actionType === 'observe'
      ? 'Finish mission'
      : 'Your move';

  const primaryEnabled = done || step.actionType === 'observe';

  return (
    <div className="guide">
      <header className="guide-head">
        <div className="guide-head-row">
          <span className="guide-badge">GUIDE</span>
          <span className="guide-mission">{mission.title}</span>
        </div>
        <div className="mode-switch" role="tablist" aria-label="Learning mode">
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
        <div className="steps-dots" aria-label={`Step ${e.stepIndex + 1} of ${e.totalSteps}`}>
          {mission.steps.map((s, i) => (
            <span
              key={s.id}
              className="dot"
              data-state={
                engine.records[s.id]?.completed ? 'done' : i === e.stepIndex ? 'current' : 'todo'
              }
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
        {engine.lastSuccess && !done && e.stepIndex > 0 && (
          <div className="ribbon ribbon-quiet">
            <span aria-hidden>✓</span> {engine.lastSuccess}
          </div>
        )}

        <div className="guide-card">
          <p className="eyebrow">
            Step {e.stepIndex + 1} of {e.totalSteps}
            {learningMode !== 'guided' && ` · ${LEARNING_MODES[learningMode].label} mode`}
          </p>
          <h3 className="guide-title">{step.title}</h3>
          <p className="guide-obj">{step.objective}</p>

          <div className="do-block" data-mode={learningMode}>
            <p className="do-label">{guided ? 'Do this' : 'Your objective'}</p>
            <p className="do-text">{guided ? instruction : step.objective}</p>
            {guided && note && <p className="do-note">{note}</p>}
            {!guided && (
              <p className="do-note">
                {learningMode === 'practice'
                  ? 'Work it out first — hints are one tap away.'
                  : 'No instructions in Challenge mode. Hints unlock if you get stuck.'}
              </p>
            )}
          </div>

          {engine.feedback && (
            <div className={`ribbon ${engine.feedback.tone === 'wrong' ? 'ribbon-warn' : 'ribbon-hint'}`}>
              <span aria-hidden>{engine.feedback.tone === 'wrong' ? '↺' : '💡'}</span>{' '}
              {engine.feedback.text}
            </div>
          )}

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

          {done && step.teach?.kind === 'flow' && (
            <div className="teach">
              <p className="teach-title">The shape of every agent workflow</p>
              <FlowDiagram nodes={step.teach.nodes} />
            </div>
          )}
          {done && step.teach?.kind === 'callout' && (
            <div className="teach">
              <p className="teach-title">{step.teach.title}</p>
              <p className="teach-body">{step.teach.body}</p>
            </div>
          )}

          <div className="why-block">
            <p className="do-label">Why?</p>
            <p className="why-text">{step.why}</p>
            {engine.revealWhy && <p className="why-more">{step.explanation}</p>}
            <button className="linkish" onClick={e.toggleWhy}>
              {engine.revealWhy ? 'Show less' : 'Tell me more'}
            </button>
          </div>

          <div className="learning">
            <p className="do-label">You are learning</p>
            <div className="chips">
              {step.learning.map((s) => (
                <span className="chip" key={s}>
                  {SKILLS[s].label}
                </span>
              ))}
              {concept && <span className="chip chip-accent">{concept.term}</span>}
            </div>
          </div>
        </div>

        {concept && (done || guided) && <ConceptCard concept={concept} defaultOpen={done} />}

        {step.actionType === 'observe' && mission.outro && done && (
          <div className="guide-card">
            <p className="eyebrow">What you now know</p>
            <ul className="takeaways">
              {mission.outro.takeaways.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <footer className="guide-foot">
        <div className="guide-actions">
          <button
            className="gbtn"
            onClick={e.showMe}
            disabled={done || !e.target || !e.hintAvailable}
            title="Demonstrates the action without completing it for you"
          >
            <span aria-hidden>☞</span> {e.hintAvailable ? 'Show me' : 'Show me (locked)'}
          </button>
          <button className="gbtn" onClick={e.askHint} disabled={done || !e.hintAvailable}>
            <span aria-hidden>💡</span> {e.hintAvailable ? 'Hint' : 'Hint locked'}
          </button>
          <button
            className="gbtn gbtn-primary"
            onClick={e.continueStep}
            disabled={!primaryEnabled}
            data-sim-id="guide-continue"
          >
            {primaryLabel}
          </button>
        </div>
        <div className="guide-meter">
          <span>{xpSoFar} XP earned</span>
          <span>·</span>
          <span>{engine.unlocked.length} concepts</span>
          <span>·</span>
          <button className="linkish" onClick={e.restart}>
            Restart mission
          </button>
        </div>
      </footer>
    </div>
  );
}
