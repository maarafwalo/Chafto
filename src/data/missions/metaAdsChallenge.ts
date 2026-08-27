import type { Mission } from '../../engine/types';
import {
  analysisBeats,
  denyBeats,
  draftBeats,
  executeBeats,
  fetchDataBeats,
  permissionBeats,
  rejectBeats,
} from './metaAds';

/**
 * The challenge run. Same simulated world, same tools — but the mission is
 * compressed into four outcomes with no click-by-click instructions, and the
 * draft has to be asked for in the learner's own words rather than picked from
 * a suggestion chip. This is the "prove it alone" half of the loop.
 */
export const metaAdsChallengeMission: Mission = {
  id: 'meta-ads-challenge',
  order: 1,
  title: 'Challenge — Run it yourself',
  premise: 'Same goal. No instructions this time.',
  summary: 'Reach the same outcome without being told where to click.',
  goal: 'Connect Windsor.ai, get a grounded analysis of the campaigns, ask for a draft, and approve it.',
  difficulty: 'Intermediate',
  minutes: '3–5 min',
  skills: ['connectors', 'toolUse', 'prompting', 'agents', 'safety'],
  concepts: ['connector', 'tool-use', 'agent', 'human-in-the-loop'],
  status: 'available',
  variant: 'challenge',
  steps: [
    {
      id: 'c1',
      title: 'Give Claude access to the ad data',
      objective: 'Claude cannot see your campaigns yet. Fix that — all of it.',
      actionType: 'navigate',
      why: 'Nothing else in this mission is possible until the model can reach the data in this chat.',
      explanation: 'Settings → Connectors → Browse → Windsor.ai → allow, then switch it on for the conversation.',
      hint: 'Two acts, two places: add it to the account in Settings → Connectors, then switch it on in the composer’s Search and tools menu.',
      successMessage: 'Connected and switched on, unaided.',
      realWorld: 'Settings → Connectors → Browse connectors, then + / Search and tools → toggle it on for the chat.',
      learning: ['connectors'],
      xp: 160,
      devices: {
        desktop: {
          instruction: 'Get the marketing-data connector working in this conversation.',
          target: [
            { id: 'chat-connector-windsor', when: { sheet: 'tools' }, caption: 'Turn it on here' },
            { id: 'btn-authorize', when: { sheet: 'auth' }, caption: 'Allow access' },
            { id: 'connector-card-windsor', when: { sheet: 'directory' }, caption: 'Windsor.ai' },
            { id: 'btn-connect', when: { screen: 'connector-detail' }, caption: 'Connect' },
            { id: 'btn-browse-connectors', when: { screen: 'settings' }, caption: 'Browse connectors' },
            { id: 'composer-tools', caption: 'Search and tools' },
          ],
        },
        phone: {
          instruction: 'Get the marketing-data connector working in this conversation.',
          target: [
            { id: 'chat-connector-windsor', when: { sheet: 'tools' }, caption: 'Turn it on here' },
            { id: 'btn-authorize', when: { sheet: 'auth' }, caption: 'Allow access' },
            { id: 'connector-card-windsor', when: { sheet: 'directory' }, caption: 'Windsor.ai' },
            { id: 'btn-connect', when: { screen: 'connector-detail' }, caption: 'Connect' },
            { id: 'btn-browse-connectors', when: { screen: 'settings' }, caption: 'Browse connectors' },
            { id: 'composer-tools', caption: 'Tools menu' },
          ],
        },
      },
      expect: { event: 'toggle-chat-connector', where: { id: 'windsor', on: true } },
      allow: [
        { event: 'open-screen' },
        { event: 'open-settings' },
        { event: 'open-menu' },
        { event: 'select-connector', where: { id: 'windsor' } },
        { event: 'connect-connector', where: { id: 'windsor' } },
        { event: 'authorize-connector', where: { id: 'windsor' } },
      ],
    },
    {
      id: 'c2',
      title: 'Get a grounded answer',
      objective: 'Make Claude tell you which campaign performs best — using your data, not its general knowledge.',
      actionType: 'type',
      why: 'The connector is only potential. Your instruction is what turns it into an answer.',
      explanation: 'Name the task, the data, and what "best" means.',
      hint: 'Write a full instruction in the conversation: what to do, which data, and what a good answer looks like.',
      successMessage: 'Grounded answer, your words.',
      learning: ['prompting', 'dataAnalysis', 'toolUse'],
      xp: 160,
      devices: {
        desktop: {
          instruction: 'Ask Claude for the analysis.',
          target: [{ id: 'composer-input', caption: 'Write your instruction' }],
        },
        phone: {
          instruction: 'Ask Claude for the analysis.',
          target: [{ id: 'composer-input', caption: 'Write your instruction' }],
        },
      },
      expect: { event: 'send-message', evaluator: 'analyzeCampaigns' },
      allow: [{ event: 'open-screen' }, { event: 'open-menu' }, { event: 'inspect-tool-call' }],
      simulationResult: permissionBeats,
      weakResult: [
        { delay: 150, action: { type: 'BUSY', busy: true } },
        {
          delay: 900,
          action: {
            type: 'PUSH_MESSAGE',
            message: {
              id: 'sc-clarify',
              role: 'assistant',
              kind: 'text',
              text: 'I can do that — tell me which data to use and what should count as "best", and I will pull the numbers.',
            },
          },
        },
        { delay: 1050, action: { type: 'BUSY', busy: false } },
      ],
    },
    {
      id: 'c2b',
      title: 'Clear the tool prompt',
      objective: 'Claude has asked to run something. Decide.',
      actionType: 'decide',
      why: 'Nothing runs until you say so.',
      explanation: 'Allow once is the safe default for a read-only tool.',
      hint: 'The request is in the conversation, with three buttons.',
      successMessage: 'Cleared.',
      learning: ['safety'],
      xp: 90,
      devices: {
        desktop: { instruction: 'Resolve the tool request.', target: [{ id: 'perm-once', caption: 'Allow once' }] },
        phone: { instruction: 'Resolve the tool request.', target: [{ id: 'perm-once', caption: 'Allow once' }] },
      },
      expect: { event: 'permission-decision', where: { decision: 'once' } },
      allow: [
        { event: 'permission-decision', where: { decision: 'always' } },
        { event: 'permission-decision', where: { decision: 'deny' }, then: denyBeats },
        { event: 'inspect-tool-call' },
      ],
      simulationResult: [
        ...fetchDataBeats,
        ...analysisBeats.map((b) => ({ ...b, delay: b.delay + 2400 })),
      ],
    },
    {
      id: 'c3',
      title: 'Turn the answer into an action',
      objective: 'Get Claude to prepare a new campaign built on what won.',
      actionType: 'type',
      why: 'An agent is only useful once it does something with what it found.',
      explanation: 'Ask for a draft, and point it at the winning campaign.',
      hint: 'Type a second instruction: ask Claude to prepare or draft a new campaign based on the best performer.',
      successMessage: 'You moved it from analysis to action.',
      learning: ['agents', 'automation', 'prompting'],
      xp: 160,
      devices: {
        desktop: {
          instruction: 'Ask Claude to prepare the new campaign.',
          target: [{ id: 'composer-input', caption: 'Write your instruction' }],
        },
        phone: {
          instruction: 'Ask Claude to prepare the new campaign.',
          target: [{ id: 'composer-input', caption: 'Write your instruction' }],
        },
      },
      expect: { event: 'send-message', evaluator: 'requestDraft' },
      allow: [{ event: 'inspect-tool-call' }],
      simulationResult: draftBeats,
    },
    {
      id: 'c4',
      title: 'Close it out safely',
      objective: 'Handle the approval gate.',
      actionType: 'decide',
      why: 'The last decision in an agent workflow belongs to a person.',
      explanation: 'Read what it wants to do, then decide.',
      hint: 'The prepared action is waiting on your decision at the bottom of the conversation.',
      successMessage: 'Signed off. Mission run clean.',
      learning: ['safety'],
      xp: 120,
      devices: {
        desktop: {
          instruction: 'Resolve the pending approval.',
          target: [{ id: 'btn-approve', caption: 'Approve' }],
        },
        phone: {
          instruction: 'Resolve the pending approval.',
          target: [{ id: 'btn-approve', caption: 'Approve' }],
        },
      },
      expect: { event: 'approval-decision', where: { decision: 'approve' } },
      allow: [
        { event: 'approval-decision', where: { decision: 'reject' }, then: rejectBeats },
        { event: 'inspect-tool-call' },
      ],
      simulationResult: executeBeats,
    },
  ],
  outro: {
    headline: 'You did it without the Guide.',
    takeaways: [
      'You know where access is granted, and what to read before granting it.',
      'You can write an instruction that produces a grounded answer instead of a generic one.',
      'You can push an agent from reporting to preparing work.',
      'You know where the human checkpoint belongs.',
    ],
  },
};
