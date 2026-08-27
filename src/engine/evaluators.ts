/**
 * Local, offline evaluation of free-form learner input.
 *
 * No model call is involved anywhere in this product. Each evaluator scores a
 * string against a small rubric and returns coaching text, which is what lets a
 * "type your own instruction" step accept many reasonable answers while still
 * teaching what makes an instruction good.
 */

export interface EvalResult {
  ok: boolean;
  /** 0–1, used for XP weighting and for the quality note in the Guide. */
  score: number;
  /** Shown as feedback when the answer is not accepted yet. */
  hint: string;
  /** Shown as praise when accepted — names what the learner did well. */
  praise: string;
  /** Rubric breakdown rendered as ticks/crosses in the Guide. */
  rubric: { label: string; met: boolean }[];
}

type Evaluator = (input: string) => EvalResult;

const has = (text: string, words: string[]) => words.some((w) => text.includes(w));

/**
 * Step 4 of Mission 01: "Ask Claude to analyse the Meta Ads campaign performance."
 * Accepts anything that (a) asks for work and (b) names the data to work on.
 */
const analyzeCampaigns: Evaluator = (raw) => {
  const text = raw.toLowerCase().trim();

  const asksForWork = has(text, [
    'analy', 'analiz', 'compare', 'review', 'look at', 'check', 'evaluate',
    'assess', 'break down', 'which', 'what is the best', 'best perform',
    'summar', 'report', 'tell me',
  ]);
  const namesData = has(text, [
    'campaign', 'meta', 'facebook', 'instagram', 'ads', 'ad ', 'advertis',
    'marketing data', 'windsor', 'spend', 'roas', 'ctr', 'cpa',
  ]);
  const namesOutcome = has(text, [
    'best', 'top', 'perform', 'winner', 'strongest', 'worst', 'roas', 'cpa',
    'ctr', 'efficien', 'result', 'which one',
  ]);
  const longEnough = text.replace(/\s+/g, ' ').split(' ').filter(Boolean).length >= 4;

  const rubric = [
    { label: 'Says what you want done', met: asksForWork },
    { label: 'Names the data to use', met: namesData },
    { label: 'Says what a good answer looks like', met: namesOutcome },
    { label: 'Is a full instruction, not one word', met: longEnough },
  ];

  const met = rubric.filter((r) => r.met).length;
  const ok = asksForWork && namesData && longEnough;

  let hint = 'Try telling Claude both what to do and which data to use.';
  if (!longEnough) hint = 'That is very short. Write it as a full instruction, like you would to a colleague.';
  else if (!namesData) hint = 'Claude cannot guess which data you mean. Mention your Meta Ads campaigns.';
  else if (!asksForWork) hint = 'Say what you want Claude to *do* with the data — analyse it, compare it, rank it.';

  const praise = namesOutcome
    ? 'Strong instruction: you named the task, the data, and what a good answer looks like.'
    : 'Good — you told Claude what to do and which data to use. Adding what "best" means (ROAS? CPA?) would sharpen it further.';

  return { ok, score: met / rubric.length, hint, praise, rubric };
};

/** Challenge run: the learner must ask for a *draft campaign* off the winner. */
const requestDraft: Evaluator = (raw) => {
  const text = raw.toLowerCase().trim();
  const asksForDraft = has(text, ['draft', 'create', 'build', 'prepare', 'new campaign', 'launch', 'set up', 'make']);
  const namesBasis = has(text, ['best', 'winner', 'campaign b', 'top', 'strongest', 'based on', 'that one']);
  const longEnough = text.split(/\s+/).filter(Boolean).length >= 4;
  const rubric = [
    { label: 'Asks for a new campaign to be prepared', met: asksForDraft },
    { label: 'Points at the winning campaign', met: namesBasis },
    { label: 'Is a full instruction', met: longEnough },
  ];
  const met = rubric.filter((r) => r.met).length;
  return {
    ok: asksForDraft && longEnough,
    score: met / rubric.length,
    hint: asksForDraft
      ? 'Tell Claude which campaign the new one should be based on.'
      : 'Ask Claude to prepare or draft a new campaign.',
    praise: namesBasis
      ? 'Exactly — you moved Claude from analysis to action and pointed it at the evidence.'
      : 'Good. You asked for an action, not just an answer.',
    rubric,
  };
};

const registry: Record<string, Evaluator> = {
  analyzeCampaigns,
  requestDraft,
};

export const getEvaluator = (id: string | undefined): Evaluator | null =>
  id ? (registry[id] ?? null) : null;
