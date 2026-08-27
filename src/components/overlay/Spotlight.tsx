import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Follow a `data-sim-id` element's position on screen.
 *
 * The simulated app scrolls, re-lays out and re-renders constantly, and the
 * device frame can be CSS-scaled — so rather than measuring once, this polls
 * getBoundingClientRect on an animation frame. It is a handful of reads per
 * frame and it is what makes the highlight feel welded to the element.
 */
const toRect = (r: DOMRect): Rect => ({ top: r.top, left: r.left, width: r.width, height: r.height });

const same = (a: Rect | null, b: Rect | null) =>
  a === b ||
  (!!a &&
    !!b &&
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5);

function useTargetRect(targetId: string | null): { target: Rect | null; stage: Rect | null } {
  const [rects, setRects] = useState<{ target: Rect | null; stage: Rect | null }>({
    target: null,
    stage: null,
  });
  const raf = useRef(0);

  useLayoutEffect(() => {
    let alive = true;
    const tick = () => {
      if (!alive) return;
      const stageEl = document.getElementById('sim-stage');
      const stage = stageEl ? toRect(stageEl.getBoundingClientRect()) : null;

      let target: Rect | null = null;
      if (targetId) {
        const el = document.querySelector<HTMLElement>(`[data-sim-id="${CSS.escape(targetId)}"]`);
        if (el) {
          const r = toRect(el.getBoundingClientRect());
          // Ignore a target scrolled out of the visible device area.
          const visible =
            r.width > 0 &&
            r.height > 0 &&
            (!stage || (r.top + r.height > stage.top + 4 && r.top < stage.top + stage.height - 4));
          if (visible) target = r;
        }
      }
      setRects((prev) => (same(prev.target, target) && same(prev.stage, stage) ? prev : { target, stage }));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf.current);
    };
  }, [targetId]);

  return rects;
}

export interface SpotlightProps {
  targetId: string | null;
  caption: string;
  stepNumber: number;
  /** Paint the dim + ring. When false only the demo pointer can appear. */
  active: boolean;
  /** Set while "Show me" is playing — animates a pointer to the target. */
  demo: { targetId: string; caption: string; nonce: number } | null;
}

export function Spotlight({ targetId, caption, stepNumber, active, demo }: SpotlightProps) {
  const { target: rect, stage } = useTargetRect(demo ? demo.targetId : targetId);
  const [vw, setVw] = useState(() => window.innerWidth);
  const [vh, setVh] = useState(() => window.innerHeight);

  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!rect || (!active && !demo)) return null;

  // Dim only the simulated app — never the Guide the learner is reading.
  const dim = stage ?? { top: 0, left: 0, width: vw, height: vh };

  const pad = 6;
  const x = rect.left - pad;
  const y = rect.top - pad;
  const w = rect.width + pad * 2;
  const h = rect.height + pad * 2;

  // Bubble below the target where there is room, otherwise above.
  const below = y + h + 96 < vh;
  const bubbleTop = below ? y + h + 12 : Math.max(10, y - 12);
  const bubbleLeft = Math.min(Math.max(12, x + w / 2), vw - 12);

  const text = demo ? demo.caption : caption;

  return (
    <div className="spot" aria-hidden>
      {active && (
        <svg
          className="spot-dim"
          width={dim.width}
          height={dim.height}
          viewBox={`0 0 ${dim.width} ${dim.height}`}
          style={{ top: dim.top, left: dim.left }}
        >
          <defs>
            <mask id="spot-mask">
              <rect x="0" y="0" width={dim.width} height={dim.height} fill="#fff" />
              <rect x={x - dim.left} y={y - dim.top} width={w} height={h} rx="12" fill="#000" />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width={dim.width}
            height={dim.height}
            fill="rgba(12,10,9,0.55)"
            mask="url(#spot-mask)"
          />
        </svg>
      )}

      <div
        className="spot-ring"
        data-demo={demo ? 'true' : 'false'}
        style={{ top: y, left: x, width: w, height: h }}
      >
        <span className="spot-num">{stepNumber}</span>
      </div>

      <div
        className="spot-bubble"
        data-below={below ? 'true' : 'false'}
        style={{ top: bubbleTop, left: bubbleLeft }}
      >
        <span className="spot-bubble-arrow" />
        {text}
      </div>

      {demo && (
        <span
          key={demo.nonce}
          className="spot-pointer"
          style={{ top: rect.top + rect.height / 2, left: rect.left + rect.width / 2 }}
        >
          <svg viewBox="0 0 24 24" width="26" height="26">
            <path
              d="M5 3l14 8.5-6.2 1.4L9.6 19 5 3z"
              fill="#fff"
              stroke="#17130f"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </div>
  );
}
