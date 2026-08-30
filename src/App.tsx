import { useState } from 'react';
import { metaAdsCourse } from './course/metaAds';
import { Overview } from './components/course/Overview';
import { Player } from './components/course/Player';

type View = 'overview' | 'player' | 'done';

export default function App() {
  const [view, setView] = useState<View>('overview');
  const [runKey, setRunKey] = useState(0);
  const course = metaAdsCourse;

  if (view === 'player') {
    return (
      <Player
        key={runKey}
        course={course}
        onExit={() => setView('overview')}
        onDone={() => setView('done')}
      />
    );
  }

  if (view === 'done') {
    return (
      <div className="ov">
        <div className="ov-inner ov-done">
          <span className="ov-eyebrow">Finished</span>
          <h1>{course.done.headline}</h1>
          <ul className="ov-points">
            {course.done.points.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <p className="ov-note">
            You can now do this for real. The buttons are in the same places — this was the same
            path, on the same three websites.
          </p>
          <div className="ov-actions">
            <button
              className="ov-start"
              onClick={() => {
                setRunKey((k) => k + 1);
                setView('player');
              }}
            >
              Run it again
            </button>
            <button className="ov-plain" onClick={() => setView('overview')}>Back to the steps</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Overview
      course={course}
      onStart={() => {
        setRunKey((k) => k + 1);
        setView('player');
      }}
    />
  );
}
