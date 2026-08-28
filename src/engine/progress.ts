import type { Progress, RunScore, SkillId } from './types';
import { SKILLS } from './types';

const KEY = 'ai-skill-simulator.progress.v1';

export const emptyProgress = (): Progress => ({
  version: 1,
  xp: 0,
  skills: Object.fromEntries(Object.keys(SKILLS).map((k) => [k, 0])) as Record<SkillId, number>,
  missionsCompleted: [],
  challengesCompleted: [],
  conceptsUnlocked: [],
  totalAttempts: 0,
  totalWrong: 0,
  bestAccuracy: 0,
  runs: [],
});

const strArray = (v: unknown, fallback: string[]): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : fallback;

const num = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback;

/**
 * Stored progress is untrusted input: it can be from an older shape of the app,
 * hand-edited, or truncated. Every field is coerced back to its expected type,
 * because a bad value here would otherwise take down the whole app on load.
 */
export function loadProgress(): Progress {
  const base = emptyProgress();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<Progress> | null;
    if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) return base;

    const skills = { ...base.skills };
    if (parsed.skills && typeof parsed.skills === 'object') {
      for (const key of Object.keys(skills) as SkillId[]) {
        skills[key] = Math.max(0, num(parsed.skills[key], 0));
      }
    }

    return {
      version: 1,
      xp: Math.max(0, num(parsed.xp, 0)),
      skills,
      missionsCompleted: strArray(parsed.missionsCompleted, base.missionsCompleted),
      challengesCompleted: strArray(parsed.challengesCompleted, base.challengesCompleted),
      conceptsUnlocked: strArray(parsed.conceptsUnlocked, base.conceptsUnlocked),
      totalAttempts: Math.max(0, num(parsed.totalAttempts, 0)),
      totalWrong: Math.max(0, num(parsed.totalWrong, 0)),
      bestAccuracy: Math.min(1, Math.max(0, num(parsed.bestAccuracy, 0))),
      runs: Array.isArray(parsed.runs) ? parsed.runs.slice(-20) : [],
    };
  } catch {
    return base;
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage can be unavailable (private mode); progress is then session-only */
  }
}

export function applyRun(
  prev: Progress,
  input: {
    missionId: string;
    variant: 'lesson' | 'challenge';
    score: RunScore;
    gains: Record<SkillId, number>;
    concepts: string[];
  },
): Progress {
  const skills = { ...prev.skills };
  for (const [k, v] of Object.entries(input.gains)) {
    const id = k as SkillId;
    skills[id] = Math.min(SKILLS[id].max, (skills[id] ?? 0) + v);
  }
  const listKey = input.variant === 'challenge' ? 'challengesCompleted' : 'missionsCompleted';
  const list = prev[listKey].includes(input.missionId)
    ? prev[listKey]
    : [...prev[listKey], input.missionId];

  return {
    ...prev,
    xp: prev.xp + input.score.xp,
    skills,
    [listKey]: list,
    conceptsUnlocked: Array.from(new Set([...prev.conceptsUnlocked, ...input.concepts])),
    totalAttempts: prev.totalAttempts + input.score.attempts,
    totalWrong: prev.totalWrong + input.score.wrong,
    bestAccuracy: Math.max(prev.bestAccuracy, input.score.accuracy),
    runs: [...prev.runs, { missionId: input.missionId, at: Date.now(), score: input.score }].slice(-20),
  };
}
