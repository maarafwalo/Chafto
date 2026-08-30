import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { Course } from '../../course/types';
import { PLATFORMS } from '../../course/types';
import { initialState, reduce, type Event } from '../../course/state';
import { Windsor } from '../platforms/Windsor';
import { Meta } from '../platforms/Meta';
import { Claude } from '../platforms/Claude';
import { JourneyMap } from './JourneyMap';
import { Spotlight } from '../overlay/Spotlight';

/** Claude's reply, once the tool has run. Timed so it reads like it is working. */
const RESULT_BEATS: { at: number; e: Event }[] = [
  { at: 300, e: { type: 'busy', busy: true } },
  {
    at: 1200,
    e: {
      type: 'push',
      message: {
        id: 't1',
        role: 'assistant',
        kind: 'tool',
        tool: 'windsor.get_campaign_performance()',
        args: '{\n  "platform": "meta",\n  "date_range": "last_14_days"\n}',
        running: true,
      },
    },
  },
  {
    at: 2600,
    e: {
      type: 'patch',
      id: 't1',
      patch: {
        running: false,
        columns: ['Campaign', 'Spend', 'CPA', 'ROAS'],
        rows: [
          ['Retargeting — broad', '$4,180', '$14.20', '1.8'],
          ['Lookalike 1% — video', '$3,940', '$6.40', '3.9'],
          ['Interest — carousel', '$2,610', '$19.80', '1.2'],
        ],
        note: '3 active campaigns · last 14 days · simulated data',
      },
    },
  },
  {
    at: 3200,
    e: {
      type: 'push',
      message: {
        id: 'a1',
        role: 'assistant',
        kind: 'text',
        text: 'Stop the Interest — carousel campaign. It has spent $2,610 to return 1.2x, which is the only one of the three losing money once you count cost per action. The Lookalike video campaign is doing the work at 3.9x.',
        evidence: ['ROAS 1.2 vs 3.9', 'CPA $19.80'],
      },
    },
  },
  { at: 3400, e: { type: 'busy', busy: false } },
];

export function Player({
  course,
  onExit,
  onDone,
}: {
  course: Course;
  onExit: () => void;
  onDone: () => void;
}) {
  const [state, dispatch] = useReducer(reduce, undefined, initialState);
  const [i, setI] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  const step = course.steps[i];

  const go = useCallback(
    (e: Event) => {
      dispatch(e);

      const current = course.steps[i];
      if (!current || e.type !== current.expect) return;
      if (current.match && !Object.entries(current.match).every(([k, v]) => e[k] === v)) return;

      // The permission prompt appears after the question is sent; the answer
      // arrives after the tool is allowed to run.
      if (e.type === 'c-send') {
        timers.current.push(
          window.setTimeout(
            () =>
              dispatch({
                type: 'push',
                message: {
                  id: 'p1',
                  role: 'assistant',
                  kind: 'permission',
                  tool: 'windsor.get_campaign_performance()',
                  decided: false,
                },
              }),
            700,
          ),
        );
      }
      if (e.type === 'c-allow') {
        for (const b of RESULT_BEATS) {
          timers.current.push(window.setTimeout(() => dispatch(b.e), b.at));
        }
      }

      if (i + 1 >= course.steps.length) onDone();
      else setI(i + 1);
    },
    [course.steps, i, onDone],
  );

  // Moving to a step on another platform switches the browser to that site.
  useEffect(() => {
    if (step && state.platform !== step.platform) {
      dispatch({ type: step.platform === 'claude' ? 'go-claude' : 'noop' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  if (!step) return null;
  const platform = PLATFORMS[step.platform];
  const onRightSite = state.platform === step.platform;

  return (
    <div className="pl">
      <header className="pl-top">
        <button className="pl-back" onClick={onExit}>← Steps</button>
        <JourneyMap course={course} stepIndex={i} compact />
        <span className="pl-count">{i + 1} / {course.steps.length}</span>
      </header>

      <div className="pl-body">
        <div className="pl-stage" id="pl-stage">
          <div className="pl-browser">
            <div className="pl-chrome">
              <span className="pl-dot" /><span className="pl-dot" /><span className="pl-dot" />
              <span className="pl-url mono">{platform.url}</span>
              <span className="pl-sim">SIMULATED</span>
            </div>
            <div className="pl-screen">
              {state.platform === 'windsor' && <Windsor s={state} go={go} />}
              {state.platform === 'meta' && <Meta s={state} go={go} />}
              {state.platform === 'claude' && <Claude s={state} go={go} />}
            </div>
          </div>
        </div>

        <aside className="pl-guide">
          <div className="pl-guide-in">
            <span className="pl-on" style={{ borderColor: platform.tint }}>
              <span className="pl-on-dot" style={{ background: platform.tint }} />
              On {platform.name}
            </span>
            <h2>{step.title}</h2>
            <p className="pl-do">{step.instruction}</p>
            {step.why && <p className="pl-why">{step.why}</p>}
            {!onRightSite && (
              <button className="pl-jump" onClick={() => dispatch({ type: 'go-claude' })}>
                Go to {platform.name} →
              </button>
            )}
          </div>
          <div className="pl-guide-foot">
            <span>{platform.role}</span>
          </div>
        </aside>
      </div>

      <Spotlight targetId={step.target ?? null} caption={step.instruction} stepNumber={i + 1} active demo={null} />
    </div>
  );
}
