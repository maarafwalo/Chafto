import type { Course } from '../../course/types';
import { PLATFORMS } from '../../course/types';
import { JourneyMap } from './JourneyMap';

/** The course outline: every step, grouped by the website it happens on. */
export function Overview({ course, onStart }: { course: Course; onStart: () => void }) {
  const legs = course.steps.reduce<{ platform: string; steps: typeof course.steps }[]>((acc, s) => {
    const last = acc[acc.length - 1];
    if (last && last.platform === s.platform) last.steps.push(s);
    else acc.push({ platform: s.platform, steps: [s] });
    return acc;
  }, []);

  let n = 0;

  return (
    <div className="ov">
      <div className="ov-inner">
        <header className="ov-head">
          <span className="ov-eyebrow">Step-by-step</span>
          <h1>{course.task}</h1>
          <p className="ov-lede">{course.summary}</p>
          <JourneyMap course={course} stepIndex={-1} />
          <div className="ov-meta">
            <span>{course.steps.length} steps</span>
            <span>·</span>
            <span>{course.minutes}</span>
            <span>·</span>
            <span>3 websites</span>
          </div>
          <button className="ov-start" onClick={onStart}>Start →</button>
        </header>

        <section className="ov-needs">
          <h2>Before you start</h2>
          <ul>
            {course.needs.map((x) => <li key={x}>{x}</li>)}
          </ul>
          <p className="ov-note">
            Everything here is simulated. You can follow along without any of it — nothing you click
            touches a real account.
          </p>
        </section>

        <section className="ov-steps">
          <h2>The path</h2>
          {legs.map((leg, i) => {
            const p = PLATFORMS[leg.platform as keyof typeof PLATFORMS];
            return (
              <div className="ov-leg" key={i}>
                <div className="ov-leg-head">
                  <span className="ov-leg-dot" style={{ background: p.tint }} />
                  <strong>{p.name}</strong>
                  <span className="ov-leg-role">{p.role}</span>
                </div>
                <ol className="ov-list">
                  {leg.steps.map((s) => {
                    n += 1;
                    return (
                      <li key={s.id}>
                        <span className="ov-num">{String(n).padStart(2, '0')}</span>
                        <span>
                          <strong>{s.title}</strong>
                          {s.why && <small>{s.why}</small>}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })}
        </section>

        <button className="ov-start ov-start-end" onClick={onStart}>Start →</button>
      </div>
    </div>
  );
}
