import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type {
  DeviceMode,
  SimAction,
  EngineState,
  LearningMode,
  Mission,
  MissionStep,
  ScenarioBeat,
  SimContext,
  SimEvent,
  StepRecord,
  TargetRule,
} from './types';
import { eventMatches, resolveTarget } from './matcher';
import { getEvaluator } from './evaluators';
import { eventToActions, initialSimState, resetIds, simReducer, toContext } from './simReducer';
import { scoreRun, skillGains, stepXp } from './scoring';

const AUTO_ADVANCE_MS = 1250;
const DEMO_MS = 2200;

const blankRecord = (stepId: string): StepRecord => ({
  stepId,
  attempts: 0,
  wrong: 0,
  usedHint: false,
  usedShowMe: false,
  usedWhy: false,
  xpEarned: 0,
  completed: false,
});

const initialEngine = (mission: Mission): EngineState => ({
  missionId: mission.id,
  status: 'running',
  stepIndex: 0,
  lastSuccess: null,
  feedback: null,
  records: Object.fromEntries(mission.steps.map((s) => [s.id, blankRecord(s.id)])),
  revealHint: false,
  revealWhy: false,
  demo: null,
  unlocked: [],
  startedAt: Date.now(),
  finishedAt: null,
  quizChoice: null,
  awaitingContinue: false,
});

export interface MissionEngine {
  mission: Mission;
  step: MissionStep | null;
  stepIndex: number;
  totalSteps: number;
  engine: EngineState;
  sim: ReturnType<typeof initialSimState>;
  ctx: SimContext;
  target: TargetRule | null;
  /** True when the spotlight should be painted (mode + reveal rules). */
  showTarget: boolean;
  hintAvailable: boolean;
  device: DeviceMode;
  learningMode: LearningMode;
  emit: (event: SimEvent) => void;
  /** Direct composer binding — typing is not itself a scored action. */
  setComposer: (text: string) => void;
  /** Escape hatch for presentation-only simulation changes (dismissing a toast). */
  dispatchSim: (action: SimAction) => void;
  setDevice: (d: DeviceMode) => void;
  setLearningMode: (m: LearningMode) => void;
  showMe: () => void;
  askHint: () => void;
  toggleWhy: () => void;
  continueStep: () => void;
  restart: () => void;
  score: () => ReturnType<typeof scoreRun>;
  gains: () => ReturnType<typeof skillGains>;
  elapsed: number;
}

export function useMissionEngine(
  mission: Mission,
  options: { device: DeviceMode; learningMode: LearningMode; onFinish?: () => void },
): MissionEngine {
  const [sim, dispatchSim] = useReducer(simReducer, undefined, () => ({
    ...initialSimState(),
    ...mission.initialSim,
  }));
  const [engine, setEngine] = useState<EngineState>(() => initialEngine(mission));
  const [device, setDevice] = useState<DeviceMode>(options.device);
  const [learningMode, setLearningMode] = useState<LearningMode>(options.learningMode);
  const [elapsed, setElapsed] = useState(0);

  const timers = useRef<number[]>([]);
  /**
   * The pending auto-advance is tracked apart from the scenario timers. Pressing
   * Continue must cancel the advance without killing a simulation sequence that
   * is still playing out — otherwise a fast learner freezes a tool call mid-run.
   */
  const advanceTimer = useRef(0);
  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    window.clearTimeout(advanceTimer.current);
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  /** Play a scripted sequence of simulation changes (typing pauses, tool runs). */
  const runBeats = useCallback(
    (beats: ScenarioBeat[] | undefined) => {
      if (!beats?.length) return;
      for (const beat of beats) {
        later(() => dispatchSim(beat.action), beat.delay);
      }
    },
    [later],
  );

  useEffect(() => {
    if (engine.status !== 'running') return;
    const id = window.setInterval(() => setElapsed(Math.round((Date.now() - engine.startedAt) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, [engine.status, engine.startedAt]);

  const step = engine.status === 'complete' ? null : (mission.steps[engine.stepIndex] ?? null);
  const ctx = useMemo(() => toContext(sim, device), [sim, device]);

  const target = useMemo(() => {
    if (!step) return null;
    return resolveTarget(step.devices[device].target, ctx);
  }, [step, device, ctx]);

  const record = step ? engine.records[step.id] : null;

  const showTarget = useMemo(() => {
    if (!step || !target || engine.awaitingContinue) return false;
    if (learningMode === 'guided') return true;
    if (learningMode === 'practice') return engine.revealHint;
    return engine.revealHint && (record?.wrong ?? 0) >= 1;
  }, [step, target, learningMode, engine.revealHint, engine.awaitingContinue, record]);

  const hintAvailable = useMemo(() => {
    if (learningMode !== 'challenge') return true;
    return (record?.wrong ?? 0) >= 2 || elapsed > 45;
  }, [learningMode, record, elapsed]);

  const advance = useCallback(() => {
    setEngine((prev) => {
      const next = prev.stepIndex + 1;
      if (next >= mission.steps.length) {
        return { ...prev, status: 'complete', finishedAt: Date.now(), awaitingContinue: false };
      }
      return {
        ...prev,
        stepIndex: next,
        revealHint: false,
        revealWhy: false,
        feedback: null,
        quizChoice: null,
        awaitingContinue: false,
        demo: null,
      };
    });
  }, [mission.steps.length]);

  useEffect(() => {
    if (engine.status === 'complete') options.onFinish?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.status]);

  const completeStep = useCallback(
    (current: MissionStep, quality?: number, praise?: string) => {
      const rec = engine.records[current.id] ?? blankRecord(current.id);
      const xp = stepXp(current.xp, {
        wrong: rec.wrong,
        usedHint: rec.usedHint,
        usedShowMe: rec.usedShowMe,
        mode: learningMode,
        quality,
      });
      runBeats(current.simulationResult);
      setEngine((prev) => ({
        ...prev,
        records: {
          ...prev.records,
          [current.id]: { ...rec, attempts: rec.attempts + 1, completed: true, xpEarned: xp },
        },
        lastSuccess: praise ?? current.successMessage,
        feedback: null,
        unlocked: current.concept && !prev.unlocked.includes(current.concept)
          ? [...prev.unlocked, current.concept]
          : prev.unlocked,
        awaitingContinue: current.advance === 'manual',
        demo: null,
      }));
      if (current.advance !== 'manual') {
        window.clearTimeout(advanceTimer.current);
        advanceTimer.current = window.setTimeout(advance, AUTO_ADVANCE_MS);
      }
    },
    [engine.records, learningMode, runBeats, advance],
  );

  const registerWrong = useCallback(
    (current: MissionStep, text: string) => {
      const rec = engine.records[current.id] ?? blankRecord(current.id);
      setEngine((prev) => ({
        ...prev,
        records: {
          ...prev.records,
          [current.id]: { ...rec, attempts: rec.attempts + 1, wrong: rec.wrong + 1 },
        },
        feedback: { tone: 'wrong', text },
      }));
    },
    [engine.records],
  );

  const emit = useCallback(
    (event: SimEvent) => {
      // 1. The simulation always reacts — the app must feel real even off-script.
      for (const action of eventToActions(event, sim)) dispatchSim(action);

      const current = step;
      if (!current || engine.status !== 'running' || engine.awaitingContinue) return;
      if (engine.records[current.id]?.completed) return;

      // 2. The expectation is checked first, so a broad `allow` rule can say
      //    "poking around in here is fine" without ever masking the real answer.
      if (!eventMatches(current.expect, event)) {
        // Stepping stones toward the target are neither right nor wrong. They
        // may still script a reaction (rejecting an approval, for example).
        const allowed = current.allow?.find((rule) => eventMatches(rule, event));
        if (allowed) {
          runBeats(allowed.then);
          return;
        }
        // Only interactions that could plausibly have been the answer count as
        // mistakes — idle navigation inside an already-correct screen does not.
        const navNoise = ['open-sheet', 'close-sheet', 'open-menu', 'close-menu'];
        if (navNoise.includes(event.type)) return;
        registerWrong(
          current,
          learningMode === 'guided'
            ? `Not quite. ${current.devices[device].instruction}`
            : current.hint,
        );
        return;
      }

      // 3. Free-form input goes through a local evaluator, never a model call.
      const evaluate = getEvaluator(current.expect.evaluator);
      if (evaluate) {
        const text = String((event.payload as { text?: string })?.text ?? '');
        const result = evaluate(text);
        if (!result.ok) {
          runBeats(current.weakResult);
          registerWrong(current, result.hint);
          return;
        }
        completeStep(current, result.score, result.praise);
        return;
      }

      if (current.actionType === 'quiz') {
        const optionId = String((event.payload as { optionId?: string })?.optionId ?? '');
        const option = current.quiz?.options.find((o) => o.id === optionId);
        setEngine((prev) => ({ ...prev, quizChoice: optionId }));
        if (!option?.correct) {
          registerWrong(current, option?.feedback ?? current.hint);
          return;
        }
        completeStep(current, 1, option.feedback);
        return;
      }

      completeStep(current);
    },
    [sim, step, engine.status, engine.awaitingContinue, engine.records, learningMode, device, registerWrong, completeStep, runBeats],
  );

  const showMe = useCallback(() => {
    if (!step || !target) return;
    setEngine((prev) => ({
      ...prev,
      revealHint: true,
      records: { ...prev.records, [step.id]: { ...prev.records[step.id], usedShowMe: true } },
      demo: {
        targetId: target.id,
        caption: target.caption ?? step.devices[device].instruction,
        nonce: Date.now(),
      },
    }));
    // The demo shows *where* and *how* — it never performs the action for you.
    later(() => setEngine((prev) => ({ ...prev, demo: null })), DEMO_MS);
  }, [step, target, device, later]);

  const askHint = useCallback(() => {
    if (!step) return;
    setEngine((prev) => ({
      ...prev,
      revealHint: true,
      records: { ...prev.records, [step.id]: { ...prev.records[step.id], usedHint: true } },
      feedback: { tone: 'hint', text: step.hint },
    }));
  }, [step]);

  const toggleWhy = useCallback(() => {
    if (!step) return;
    setEngine((prev) => ({
      ...prev,
      revealWhy: !prev.revealWhy,
      records: { ...prev.records, [step.id]: { ...prev.records[step.id], usedWhy: true } },
    }));
  }, [step]);

  const continueStep = useCallback(() => {
    if (!step) return;
    if (engine.awaitingContinue || engine.records[step.id]?.completed) {
      window.clearTimeout(advanceTimer.current);
      advance();
      return;
    }
    if (step.actionType === 'observe') emit({ type: 'acknowledge', payload: { stepId: step.id } });
  }, [step, engine.awaitingContinue, engine.records, advance, emit]);

  const setComposer = useCallback((text: string) => dispatchSim({ type: 'COMPOSER', text }), []);

  const restart = useCallback(() => {
    clearTimers();
    resetIds();
    dispatchSim({ type: 'RESET', state: mission.initialSim });
    setEngine(initialEngine(mission));
    setElapsed(0);
  }, [mission, clearTimers]);

  return {
    mission,
    step,
    stepIndex: engine.stepIndex,
    totalSteps: mission.steps.length,
    engine,
    sim,
    ctx,
    target,
    showTarget,
    hintAvailable,
    device,
    learningMode,
    emit,
    setComposer,
    dispatchSim,
    setDevice,
    setLearningMode,
    showMe,
    askHint,
    toggleWhy,
    continueStep,
    restart,
    score: () => scoreRun(mission, engine),
    gains: () => skillGains(mission, engine),
    elapsed,
  };
}
