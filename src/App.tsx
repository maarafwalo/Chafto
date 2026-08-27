import { useCallback, useEffect, useState } from 'react';
import { Home } from './components/Home';
import { MissionBrief } from './components/MissionBrief';
import { Studio, type RunResult } from './components/Studio';
import { Results } from './components/Results';
import { missionById } from './data/missions';
import { applyRun, loadProgress, saveProgress } from './engine/progress';
import type { DeviceMode, LearningMode, Progress } from './engine/types';

type View = 'home' | 'brief' | 'studio' | 'results';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [missionId, setMissionId] = useState('meta-ads');
  const [device, setDevice] = useState<DeviceMode>(() =>
    // A desktop shell on a 400px screen is unreadable, so start people where
    // the simulation is comfortable. They can switch at any time.
    typeof window !== 'undefined' && window.innerWidth < 900 ? 'phone' : 'desktop',
  );
  const [learningMode, setLearningMode] = useState<LearningMode>('guided');
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [result, setResult] = useState<RunResult | null>(null);
  /** Bump to force a fresh engine when replaying the same mission. */
  const [runKey, setRunKey] = useState(0);

  useEffect(() => saveProgress(progress), [progress]);
  useEffect(() => window.scrollTo({ top: 0 }), [view]);

  const mission = missionById(missionId);

  const openMission = useCallback((id: string) => {
    setMissionId(id);
    setView('brief');
  }, []);

  const startRun = useCallback(() => {
    setRunKey((k) => k + 1);
    setResult(null);
    setView('studio');
  }, []);

  const handleComplete = useCallback(
    (run: RunResult) => {
      setProgress((prev) =>
        applyRun(prev, {
          missionId: run.mission.id,
          variant: run.mission.variant ?? 'lesson',
          score: run.score,
          gains: run.gains,
          concepts: run.concepts,
        }),
      );
      setResult(run);
      setView('results');
    },
    [],
  );

  if (view === 'home' || !mission) {
    return (
      <Home
        progress={progress}
        onStart={() => openMission('meta-ads')}
        onOpenMission={openMission}
      />
    );
  }

  if (view === 'brief') {
    return (
      <MissionBrief
        mission={mission}
        device={device}
        learningMode={learningMode}
        onDevice={setDevice}
        onMode={setLearningMode}
        onStart={startRun}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'studio') {
    return (
      <Studio
        key={`${mission.id}-${runKey}`}
        mission={mission}
        device={device}
        learningMode={learningMode}
        onExit={() => setView('home')}
        onComplete={handleComplete}
      />
    );
  }

  if (view === 'results' && result) {
    const challengeId = result.mission.challengeMissionId;
    return (
      <Results
        result={result}
        progress={progress}
        onChallenge={
          challengeId
            ? () => {
                setMissionId(challengeId);
                setLearningMode('challenge');
                setRunKey((k) => k + 1);
                setResult(null);
                setView('studio');
              }
            : undefined
        }
        onReplay={() => {
          setMissionId(result.mission.id);
          startRun();
        }}
        onHome={() => setView('home')}
      />
    );
  }

  return null;
}
