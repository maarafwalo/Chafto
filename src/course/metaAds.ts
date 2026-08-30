import type { Course } from './types';

/**
 * The task: "I want Claude to tell me which of my Meta ad campaigns to stop."
 *
 * Doing it for real means visiting three websites in a specific order. Claude
 * is the last one and the easiest. Everything before it is where people give up,
 * so that is where most of this course lives.
 */
export const metaAdsCourse: Course = {
  id: 'meta-ads',
  task: 'Get Claude to analyse your Meta Ads',
  summary:
    'Claude cannot see your ad account. To change that you need a bridge between Meta and Claude, and setting it up crosses three websites. Here is the whole path, once, with nothing skipped.',
  minutes: '10 min',
  needs: [
    'A Meta (Facebook) ad account you can log into',
    'An email address for a Windsor.ai account',
    'A Claude account — the free plan is enough to follow along',
  ],
  steps: [
    /* ---------------- Windsor.ai: get an account ---------------- */
    {
      id: 'w1',
      platform: 'windsor',
      title: 'Open Windsor.ai',
      instruction: 'Click Start free trial.',
      why: 'Windsor.ai is the bridge. It reads your ad data and makes it available to Claude.',
      target: 'w-start',
      expect: 'w-start-trial',
    },
    {
      id: 'w2',
      platform: 'windsor',
      title: 'Create your account',
      instruction: 'Click Create account.',
      why: 'Your email is already filled in here. Nothing is sent anywhere in this simulation.',
      target: 'w-create',
      expect: 'w-create-account',
    },
    {
      id: 'w3',
      platform: 'windsor',
      title: 'Add a data source',
      instruction: 'Click + Add data source.',
      why: 'A data source is one platform Windsor reads from. You want Meta Ads.',
      target: 'w-add',
      expect: 'w-add-source',
    },
    {
      id: 'w4',
      platform: 'windsor',
      title: 'Choose Meta Ads',
      instruction: 'Click Facebook / Meta Ads in the list.',
      why: 'There are hundreds of sources. Meta Ads is the one holding your campaigns.',
      target: 'w-source-facebook',
      expect: 'w-pick-meta',
    },

    /* ---------------- Meta: grant access ---------------- */
    {
      id: 'm1',
      platform: 'meta',
      title: 'Log in to Meta',
      instruction: 'Click Continue as Marouane.',
      why: 'You have just been handed off to Facebook. This is normal — Windsor never sees your password.',
      target: 'm-continue',
      expect: 'm-continue',
    },
    {
      id: 'm2',
      platform: 'meta',
      title: 'Pick the ad account',
      instruction: 'Choose the ad account you want Claude to read, then click Continue.',
      why: 'Most people have more than one. Pick wrong here and Claude reads the wrong campaigns.',
      target: 'm-account-1',
      expect: 'm-pick-account',
    },
    {
      id: 'm3',
      platform: 'meta',
      title: 'Grant read access',
      instruction: 'Leave the permissions as they are and click Save.',
      why: 'Read-only. Nothing here lets anyone spend your budget — check that it stays that way.',
      target: 'm-save',
      expect: 'm-save',
    },

    /* ---------------- Windsor.ai: get the URL ---------------- */
    {
      id: 'w5',
      platform: 'windsor',
      title: 'Open API access',
      instruction: 'Click MCP & API access in the sidebar.',
      why: 'Meta is connected. Now you need the address Claude will call.',
      target: 'w-api',
      expect: 'w-open-api',
    },
    {
      id: 'w6',
      platform: 'windsor',
      title: 'Copy the server URL',
      instruction: 'Click Copy next to the MCP server URL.',
      why: 'This URL is the bridge. It is also a secret — anyone holding it can read your ad data.',
      target: 'w-copy',
      expect: 'w-copy-url',
    },

    /* ---------------- Claude: connect and ask ---------------- */
    {
      id: 'c1',
      platform: 'claude',
      title: 'Open Claude settings',
      instruction: 'Click your name at the bottom left, then Settings.',
      why: 'Connectors are added at the account level, in Settings — not inside a chat.',
      target: 'c-account',
      expect: 'c-settings',
    },
    {
      id: 'c2',
      platform: 'claude',
      title: 'Add a custom connector',
      instruction: 'Click Add custom connector.',
      why: 'Windsor is not in the built-in directory, so you add it by URL.',
      target: 'c-add',
      expect: 'c-add-connector',
    },
    {
      id: 'c3',
      platform: 'claude',
      title: 'Paste the URL',
      instruction: 'Paste the URL you copied, then click Add.',
      why: 'This is the handover point between the two websites.',
      target: 'c-paste',
      expect: 'c-save-connector',
    },
    {
      id: 'c4',
      platform: 'claude',
      title: 'Switch it on in the chat',
      instruction: 'Go back to the chat, open Search and tools, and turn Windsor.ai on.',
      why: 'Adding a connector is not the same as enabling it. This is the step most people miss.',
      target: 'c-toggle',
      expect: 'c-enable',
    },
    {
      id: 'c5',
      platform: 'claude',
      title: 'Ask your question',
      instruction: 'Type your question and send it.',
      why: 'Say what you want and which data to use. Vague questions get vague answers.',
      target: 'c-input',
      expect: 'c-send',
    },
    {
      id: 'c6',
      platform: 'claude',
      title: 'Allow the tool to run',
      instruction: 'Click Allow once.',
      why: 'Claude asks before it reads anything. Allow once is the safe default.',
      target: 'c-allow',
      expect: 'c-allow',
    },
    {
      id: 'c7',
      platform: 'claude',
      title: 'Read the answer',
      instruction: 'Click the tool call to see the data the answer came from.',
      why: 'The numbers in the answer come from this block. You can always check them.',
      target: 'c-tool',
      expect: 'c-expand',
    },
  ],
  done: {
    headline: 'That is the whole path.',
    points: [
      'Windsor.ai is the bridge: it reads Meta and exposes the data to Claude.',
      'Meta is where you grant read access — and where you check nobody can spend.',
      'In Claude, a connector is added in Settings and then switched on per chat. Two separate steps.',
      'Claude asks permission before every tool call, and shows you the data it used.',
    ],
  },
};
