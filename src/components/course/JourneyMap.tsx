import type { Course, PlatformId } from '../../course/types';
import { PLATFORMS } from '../../course/types';

/**
 * The visualization the whole product hangs on: the task is not one website,
 * it is three, and here they are with your position marked.
 */
export function JourneyMap({
  course,
  stepIndex,
  compact = false,
}: {
  course: Course;
  stepIndex: number;
  compact?: boolean;
}) {
  // Group consecutive steps by platform — one leg per visit, so returning to
  // Windsor after Meta shows as a second leg, which is what actually happens.
  const legs: { platform: PlatformId; from: number; to: number }[] = [];
  course.steps.forEach((s, i) => {
    const last = legs[legs.length - 1];
    if (last && last.platform === s.platform) last.to = i;
    else legs.push({ platform: s.platform, from: i, to: i });
  });

  return (
    <ol className="map" data-compact={compact}>
      {legs.map((leg, i) => {
        const p = PLATFORMS[leg.platform];
        const state = stepIndex > leg.to ? 'done' : stepIndex >= leg.from ? 'now' : 'todo';
        const count = leg.to - leg.from + 1;
        return (
          <li className="map-leg" key={`${leg.platform}-${i}`} data-state={state}>
            <span className="map-dot" style={{ background: state === 'todo' ? undefined : p.tint }}>
              {state === 'done' ? '✓' : i + 1}
            </span>
            <span className="map-text">
              <strong>{p.name}</strong>
              {!compact && <small>{count} step{count > 1 ? 's' : ''}</small>}
            </span>
            {i < legs.length - 1 && <span className="map-arrow" aria-hidden>→</span>}
          </li>
        );
      })}
    </ol>
  );
}
