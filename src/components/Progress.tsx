import type { Progress, SkillId } from '../engine/types';
import { SKILLS } from '../engine/types';

const BARS = 10;

/** Ten-segment skill meter — deliberately game-like rather than a percentage. */
export function SkillMeter({
  skill,
  value,
  delta = 0,
}: {
  skill: SkillId;
  value: number;
  delta?: number;
}) {
  const max = SKILLS[skill].max;
  const filled = Math.min(BARS, Math.round((value / max) * BARS));
  const before = Math.min(BARS, Math.round(((value - delta) / max) * BARS));
  return (
    <div className="meter">
      <span className="meter-label">{SKILLS[skill].label}</span>
      <span className="meter-bars" aria-hidden>
        {Array.from({ length: BARS }, (_, i) => (
          <span
            key={i}
            className="meter-seg"
            data-state={i < before ? 'on' : i < filled ? 'new' : 'off'}
          />
        ))}
      </span>
      <span className="meter-value">
        {delta > 0 && <span className="meter-delta">+{delta}</span>}
        {value}
      </span>
    </div>
  );
}

export function SkillPanel({
  progress,
  deltas,
}: {
  progress: Progress;
  deltas?: Record<SkillId, number>;
}) {
  return (
    <div className="skill-panel">
      {(Object.keys(SKILLS) as SkillId[]).map((s) => (
        <SkillMeter key={s} skill={s} value={progress.skills[s] ?? 0} delta={deltas?.[s] ?? 0} />
      ))}
    </div>
  );
}

export function StatRow({ progress }: { progress: Progress }) {
  const accuracy = progress.totalAttempts
    ? Math.round(((progress.totalAttempts - progress.totalWrong) / progress.totalAttempts) * 100)
    : 0;
  const stats = [
    { label: 'Total XP', value: progress.xp },
    { label: 'Missions', value: progress.missionsCompleted.length },
    { label: 'Challenges', value: progress.challengesCompleted.length },
    { label: 'Concepts', value: progress.conceptsUnlocked.length },
    { label: 'Accuracy', value: `${accuracy}%` },
    { label: 'Actions taken', value: progress.totalAttempts },
  ];
  return (
    <div className="stat-row">
      {stats.map((s) => (
        <div className="stat" key={s.label}>
          <span className="stat-value">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
