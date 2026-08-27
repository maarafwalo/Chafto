import type { DeviceMode, LearningMode, Mission } from '../engine/types';
import { LEARNING_MODES, SKILLS } from '../engine/types';
import { conceptById } from '../data/concepts';

const MODES: LearningMode[] = ['guided', 'practice', 'challenge'];

/**
 * The pre-flight screen. It states the learner's own goal in their words, then
 * makes them choose how much help they want — which is the first teaching move
 * the product makes.
 */
export function MissionBrief({
  mission,
  device,
  learningMode,
  onDevice,
  onMode,
  onStart,
  onBack,
}: {
  mission: Mission;
  device: DeviceMode;
  learningMode: LearningMode;
  onDevice: (d: DeviceMode) => void;
  onMode: (m: LearningMode) => void;
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <div className="page">
      <nav className="topnav">
        <button className="tbtn" onClick={onBack}>
          ← Missions
        </button>
        <span className="topnav-title">Mission {String(mission.order).padStart(2, '0')}</span>
      </nav>

      <div className="brief">
        <span className="hero-tag">
          {mission.difficulty} · {mission.minutes}
        </span>
        <h1 className="display display-l">{mission.title}</h1>

        <blockquote className="premise">
          <span className="premise-mark" aria-hidden>
            “
          </span>
          {mission.premise}
          <cite>— you, at the start of this mission</cite>
        </blockquote>

        <p className="lede">{mission.summary}</p>

        <div className="brief-grid">
          <div className="brief-cell">
            <span className="eyebrow">Goal</span>
            <p>{mission.goal}</p>
          </div>
          <div className="brief-cell">
            <span className="eyebrow">Skills</span>
            <div className="chips">
              {mission.skills.map((s) => (
                <span className="chip" key={s}>
                  {SKILLS[s].label}
                </span>
              ))}
            </div>
          </div>
          <div className="brief-cell">
            <span className="eyebrow">Concepts you will meet</span>
            <div className="chips">
              {mission.concepts.map((c) => (
                <span className="chip chip-accent" key={c}>
                  {conceptById(c)?.term ?? c}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="choose">
          <div className="choose-block">
            <span className="eyebrow">How much help do you want?</span>
            <div className="choose-row">
              {MODES.map((m) => (
                <button
                  key={m}
                  className="choice"
                  aria-pressed={learningMode === m}
                  onClick={() => onMode(m)}
                >
                  <strong>{LEARNING_MODES[m].label}</strong>
                  <span>{LEARNING_MODES[m].blurb}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="choose-block">
            <span className="eyebrow">Which device do you want to practise on?</span>
            <div className="choose-row">
              <button className="choice" aria-pressed={device === 'phone'} onClick={() => onDevice('phone')}>
                <strong>📱 Phone</strong>
                <span>Mobile app layout — menus behind a + button.</span>
              </button>
              <button className="choice" aria-pressed={device === 'desktop'} onClick={() => onDevice('desktop')}>
                <strong>🖥️ Desktop</strong>
                <span>Web app layout — sidebar navigation.</span>
              </button>
            </div>
            <p className="choose-note">
              You can switch at any point during the mission. The Guide rewrites its instructions to
              match.
            </p>
          </div>
        </div>

        <div className="brief-actions">
          <button className="btn btn-primary btn-lg" onClick={onStart}>
            Enter the simulation →
          </button>
          <span className="brief-flag">SIMULATION — no real accounts, no real spend, no AI model called</span>
        </div>
      </div>
    </div>
  );
}
