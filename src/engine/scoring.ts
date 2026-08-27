import type { EngineState, LearningMode, Mission, RunScore, SkillId } from './types';
import { LEARNING_MODES } from './types';

/**
 * XP for one step. Full marks for a clean first attempt; assistance and wrong
 * clicks reduce the award but never take it below a third, so exploring is
 * never punished into zero.
 */
export function stepXp(
  base: number,
  opts: { wrong: number; usedHint: boolean; usedShowMe: boolean; mode: LearningMode; quality?: number },
): number {
  let mult = 1;
  if (opts.usedShowMe) mult -= 0.3;
  if (opts.usedHint) mult -= 0.2;
  mult -= Math.min(0.3, opts.wrong * 0.1);
  mult = Math.max(0.34, mult);
  // Harder modes are worth more, because less help was on offer.
  const modeBonus = 1 + LEARNING_MODES[opts.mode].assistCost;
  const quality = opts.quality === undefined ? 1 : 0.7 + 0.3 * opts.quality;
  return Math.round(base * mult * modeBonus * quality);
}

export function scoreRun(mission: Mission, engine: EngineState): RunScore {
  const records = Object.values(engine.records);
  const xp = records.reduce((a, r) => a + r.xpEarned, 0);
  const maxXp = mission.steps.reduce((a, s) => a + s.xp, 0);
  const attempts = records.reduce((a, r) => a + r.attempts, 0);
  const wrong = records.reduce((a, r) => a + r.wrong, 0);
  const assists = records.reduce((a, r) => a + (r.usedHint ? 1 : 0) + (r.usedShowMe ? 1 : 0), 0);
  const accuracy = attempts === 0 ? 1 : Math.max(0, (attempts - wrong) / attempts);
  const seconds = Math.round(((engine.finishedAt ?? Date.now()) - engine.startedAt) / 1000);
  const ratio = maxXp === 0 ? 0 : xp / maxXp;
  const rank: RunScore['rank'] = ratio >= 0.85 && accuracy >= 0.8 ? 'Gold' : ratio >= 0.6 ? 'Silver' : 'Bronze';
  return { xp, maxXp, accuracy, attempts, wrong, assists, steps: mission.steps.length, seconds, rank };
}

/** Distribute a run's XP across the skills each step exercised. */
export function skillGains(mission: Mission, engine: EngineState): Record<SkillId, number> {
  const gains = {} as Record<SkillId, number>;
  for (const step of mission.steps) {
    const rec = engine.records[step.id];
    if (!rec?.completed) continue;
    const share = Math.max(1, Math.round(rec.xpEarned / Math.max(1, step.learning.length)));
    for (const skill of step.learning) {
      gains[skill] = (gains[skill] ?? 0) + share;
    }
  }
  return gains;
}
