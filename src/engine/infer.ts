import type { IntakeAnswers, DeviceMode, LearningMode } from './types';

/**
 * Read one sentence and set everything up from it.
 *
 * Asking seven questions to configure a lesson is a form, not a guide. The
 * learner says what they want in their own words; this works out the rest and
 * gets out of the way. Guessing wrong costs little — the connector can be
 * changed inside the walkthrough.
 */
const MATCHERS: { source: string; words: string[] }[] = [
  { source: 'gmail', words: ['email', 'e-mail', 'mail', 'inbox', 'gmail', 'reply', 'replies', 'message'] },
  { source: 'drive', words: ['file', 'files', 'document', 'doc', 'drive', 'folder', 'spreadsheet', 'pdf'] },
  { source: 'supabase', words: ['database', 'db', 'sql', 'supabase', 'table', 'users', 'query', 'rows', 'churn'] },
  { source: 'windsor', words: ['ads', 'ad ', 'campaign', 'marketing', 'meta', 'facebook', 'roas', 'spend', 'cpa', 'advertis'] },
  { source: 'vercel', words: ['deploy', 'build', 'vercel', 'site', 'hosting', 'production'] },
];

/** Verbs that mean "change something", which is what needs a checkpoint. */
const ACTION_WORDS = [
  'send', 'create', 'draft', 'write', 'make', 'update', 'post', 'schedule',
  'reply', 'publish', 'launch', 'delete', 'change', 'fix', 'add', 'set up',
];

export function inferAnswers(
  outcome: string,
  device: DeviceMode,
  mode: LearningMode = 'guided',
): IntakeAnswers {
  const text = outcome.toLowerCase();

  const hit = MATCHERS.find((m) => m.words.some((w) => text.includes(w)));
  const wantsAction = ACTION_WORDS.some((w) => text.includes(w));

  return {
    goal: wantsAction ? 'act' : 'analyse',
    source: hit?.source ?? 'none',
    // Preparing an action and approving it is the right default: it shows the
    // checkpoint without pretending the learner asked for unattended access.
    stakes: wantsAction ? 'draft' : 'readonly',
    outcome: outcome.trim(),
    constraint: '',
    device,
    mode,
  };
}
