import type { RunResult } from './Studio';
import type { Progress } from '../engine/types';
import { SkillPanel } from './Progress';
import { conceptById } from '../data/concepts';
import { ConceptCard } from './guide/ConceptCard';

const RANK_GLYPH: Record<string, string> = { Gold: '◆', Silver: '◇', Bronze: '◈' };

export function Results({
  result,
  progress,
  onChallenge,
  onReplay,
  onHome,
}: {
  result: RunResult;
  progress: Progress;
  onChallenge?: () => void;
  onReplay: () => void;
  onHome: () => void;
}) {
  const { score, mission } = result;
  const mins = Math.floor(score.seconds / 60);
  const secs = score.seconds % 60;

  return (
    <div className="page">
      <nav className="topnav">
        <button className="tbtn" onClick={onHome}>
          ← Missions
        </button>
        <span className="topnav-title">Mission debrief</span>
        <div className="topnav-right">
          <span className="xp-chip">{progress.xp} XP total</span>
        </div>
      </nav>
      <div className="results">
        <header className="results-head">
          <span className={`rank rank-${score.rank.toLowerCase()}`}>
            <span aria-hidden>{RANK_GLYPH[score.rank]}</span>
            {score.rank}
          </span>
          <h1 className="display">
            {mission.variant === 'challenge' ? 'Challenge cleared.' : mission.outro?.headline}
          </h1>
          <p className="lede">
            {mission.variant === 'challenge'
              ? 'No instructions, no highlight, and you still got there. That is the whole point of the product.'
              : 'You did not read about an AI workflow. You ran one.'}
          </p>
        </header>

        <div className="score-grid">
          <div className="score-cell score-cell-xp">
            <span className="score-value">{score.xp}</span>
            <span className="score-label">XP earned</span>
            <span className="score-sub">of {score.maxXp} possible</span>
          </div>
          <div className="score-cell">
            <span className="score-value">{Math.round(score.accuracy * 100)}%</span>
            <span className="score-label">Accuracy</span>
            <span className="score-sub">
              {score.attempts - score.wrong}/{score.attempts} actions correct
            </span>
          </div>
          <div className="score-cell">
            <span className="score-value">
              {mins}:{String(secs).padStart(2, '0')}
            </span>
            <span className="score-label">Time</span>
            <span className="score-sub">{score.steps} steps completed</span>
          </div>
          <div className="score-cell">
            <span className="score-value">{score.assists}</span>
            <span className="score-label">Assists used</span>
            <span className="score-sub">hints and demonstrations</span>
          </div>
        </div>

        <section className="results-section">
          <h2 className="section-h">Skills you moved</h2>
          <SkillPanel progress={progress} deltas={result.gains} />
        </section>

        {mission.outro && (
          <section className="results-section">
            <h2 className="section-h">What you can now explain to someone else</h2>
            <ul className="takeaways takeaways-lg">
              {mission.outro.takeaways.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        )}

        {result.concepts.length > 0 && (
          <section className="results-section">
            <h2 className="section-h">Concepts unlocked</h2>
            <div className="concept-grid">
              {result.concepts.map((id) => {
                const c = conceptById(id);
                return c ? <ConceptCard key={id} concept={c} /> : null;
              })}
            </div>
          </section>
        )}

        <div className="results-actions">
          {onChallenge && (
            <button className="btn btn-primary btn-lg" onClick={onChallenge}>
              Take the challenge →
            </button>
          )}
          <button className="btn btn-lg" onClick={onReplay}>
            Replay this mission
          </button>
          <button className="btn btn-ghost btn-lg" onClick={onHome}>
            Back to missions
          </button>
        </div>

        {onChallenge && (
          <p className="results-note">
            The challenge is the same world with the Guide switched off. It is where you find out
            whether you learned the workflow or just followed the arrows.
          </p>
        )}
      </div>
    </div>
  );
}
