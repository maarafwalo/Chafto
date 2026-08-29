import type { IntakeQuestion } from './types';
import { CONNECTORS } from '../data/connectors';

/**
 * The Guide's interview.
 *
 * The point is not to collect settings — it is to make the learner state, out
 * loud, what they actually want and what they are prepared to let an assistant
 * do. Every question teaches something in the asking, and every answer changes
 * the walkthrough that gets built.
 */
export const INTAKE: IntakeQuestion[] = [
  {
    id: 'goal',
    eyebrow: 'What you want',
    prompt: 'What do you actually want Claude to do for you?',
    help: 'Be honest rather than ambitious — the walkthrough is built around this answer.',
    kind: 'choice',
    options: [
      {
        id: 'analyse',
        label: 'Make sense of data I already have',
        detail: 'Numbers, a spreadsheet, results from some tool. You want an answer you can act on.',
        consequence: 'We will get Claude to pull real data and defend a conclusion from it.',
      },
      {
        id: 'retrieve',
        label: 'Find things buried in my email, files or database',
        detail: 'You know it is in there somewhere. You want the needle, not the haystack.',
        consequence: 'We will connect the place it lives and get Claude to search it properly.',
      },
      {
        id: 'create',
        label: 'Write or make something',
        detail: 'A draft, a document, a plan. You want a first version worth editing.',
        consequence: 'We will focus on giving Claude the context and constraints that make drafts usable.',
      },
      {
        id: 'act',
        label: 'Do a task for me in another system',
        detail: 'Not just tell you — actually change something somewhere.',
        consequence: 'We will build up to a real action, with the approval gate that should guard it.',
      },
      {
        id: 'automate',
        label: 'Run something repeatedly, not just once',
        detail: 'A weekly check, a recurring report, a watch on something.',
        consequence: 'We will design the run once, then decide what it may do unattended.',
      },
    ],
  },
  {
    id: 'source',
    eyebrow: 'Where the truth lives',
    prompt: 'Where does the information live?',
    help: 'Claude can only reason about what it can reach. This decides which connector we set up.',
    kind: 'choice',
    options: [
      ...CONNECTORS.map((c) => ({
        id: c.id,
        label: c.name,
        detail: `${c.category} — ${c.blurb}`,
        consequence: `We will add ${c.name}, switch it on, and use ${c.tools[0].name}.`,
      })),
      {
        id: 'none',
        label: 'Nowhere connected — I will paste it in',
        detail: 'The information is in your head, a file on your desk, or something you can type.',
        consequence: 'We will skip connectors and focus on context, instructions and getting the ask right.',
      },
    ],
  },
  {
    id: 'stakes',
    eyebrow: 'How far it may go',
    prompt: 'Should Claude just tell you things, or also do things?',
    help: 'This is the most consequential answer here. It decides where the checkpoint sits.',
    kind: 'choice',
    options: [
      {
        id: 'readonly',
        label: 'Just tell me. I will act on it myself',
        detail: 'Reading is reversible. Nothing Claude does can cost you anything.',
        consequence: 'A read-only walkthrough. Safest place to start, and often enough.',
      },
      {
        id: 'draft',
        label: 'Prepare the action, but let me approve it',
        detail: 'It does the work; you sign it off. The default for anything that touches the world.',
        consequence: 'We will add a human approval gate and you will decide at it.',
      },
      {
        id: 'auto',
        label: 'Just do it and tell me afterwards',
        detail: 'Fastest, and the setting that occasionally costs people real money.',
        consequence: 'We will do it — and then look hard at which actions actually deserve this.',
      },
    ],
  },
  {
    id: 'outcome',
    eyebrow: 'What good looks like',
    prompt: 'In one sentence, what would a good result look like?',
    help: 'Your words, not a template. This becomes the instruction you give Claude later, and the thing we judge the result against.',
    kind: 'text',
    placeholder: 'e.g. "Tell me which of my campaigns to stop, and why"',
  },
  {
    id: 'constraint',
    eyebrow: 'The line it must not cross',
    prompt: 'Anything Claude must never do here?',
    help: 'Optional — but a stated constraint is the cheapest way to prevent the failure you would most regret. Leave blank if nothing comes to mind.',
    kind: 'text',
    optional: true,
    placeholder: 'e.g. "Never email a customer without me reading it first"',
  },
  {
    id: 'device',
    eyebrow: 'Where you work',
    prompt: 'Which Claude do you actually use?',
    help: 'The steps differ — menus live in different places on phone and desktop. You can switch at any time.',
    kind: 'choice',
    options: [
      { id: 'desktop', label: 'Desktop or web', detail: 'Sidebar navigation, wider conversation, artifacts beside the chat.' },
      { id: 'phone', label: 'Phone', detail: 'Drawer navigation, everything behind the menu and the + button.' },
    ],
  },
  {
    id: 'mode',
    eyebrow: 'How much help',
    prompt: 'How much should the Guide tell you?',
    help: 'You can change this mid-walkthrough. Harder modes are worth more XP.',
    kind: 'choice',
    options: [
      { id: 'guided', label: 'Show me exactly what to do', detail: 'Precise instructions and a highlight on the right control.' },
      { id: 'practice', label: 'Give me the goal, hints if I ask', detail: 'You work out the path; help is one tap away.' },
      { id: 'challenge', label: 'Just the objective', detail: 'No instructions, no highlight. Hints unlock only if you get stuck.' },
    ],
  },
];
