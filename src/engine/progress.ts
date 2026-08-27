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

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Progress;
    if (parsed?.version !== 1) return emptyProgress();
    return { ...emptyProgress(), ...parsed, skills: { ...emptyProgress().skills, ...parsed.skills } };
  } catch {
    return emptyProgress();
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
