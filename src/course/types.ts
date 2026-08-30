/**
 * A course is an ordered list of steps that crosses several platforms.
 *
 * The premise: the hard part of "get Claude to do X" is almost never Claude.
 * It is the four websites you have to visit first, in the right order, finding
 * buttons nobody told you about. So every step names the platform it happens
 * on, and the simulator renders that platform.
 */

export type PlatformId = 'windsor' | 'meta' | 'claude';

export interface Platform {
  id: PlatformId;
  name: string;
  /** Shown in the fake browser address bar. */
  url: string;
  tint: string;
  /** One line: why this platform is in the journey at all. */
  role: string;
}

export const PLATFORMS: Record<PlatformId, Platform> = {
  windsor: {
    id: 'windsor',
    name: 'Windsor.ai',
    url: 'onboard.windsor.ai',
    tint: '#E07856',
    role: 'The bridge. It reads your ad data and exposes it to Claude.',
  },
  meta: {
    id: 'meta',
    name: 'Meta',
    url: 'facebook.com/privacy/consent',
    tint: '#0866FF',
    role: 'Where your ad data lives. You grant read access here.',
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    url: 'claude.ai',
    tint: '#C85F3C',
    role: 'Where you finally ask the question.',
  },
};

export interface CourseStep {
  id: string;
  platform: PlatformId;
  /** Short label for the outline, e.g. "Create your account". */
  title: string;
  /** The single action to take. */
  instruction: string;
  /** Optional one-liner: why this step exists. Kept short on purpose. */
  why?: string;
  /** `data-id` of the element to highlight. */
  target?: string;
  /** The event that completes the step. */
  expect: string;
  /** Optional payload match on that event. */
  match?: Record<string, string>;
}

export interface Course {
  id: string;
  task: string;
  summary: string;
  minutes: string;
  /** What the learner needs before starting — stated honestly up front. */
  needs: string[];
  steps: CourseStep[];
  done: { headline: string; points: string[] };
}
