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

/**
 * Mission 02 step 2. A brief good enough to execute names three things: the
 * outcome, at least one hard constraint, and what it wants back. Missing any of
 * them is how you get a confident answer to a question you did not ask.
 */
const campaignBrief: Evaluator = (raw) => {
  const text = raw.toLowerCase().trim();

  const outcome = has(text, [
    'sale', 'purchase', 'conversion', 'revenue', 'sign up', 'signup', 'lead',
    'install', 'subscriber', 'booking', 'trial', 'customer', 'roas', 'sell',
  ]);
  const constraint = has(text, [
    'budget', '$', '£', '€', 'per day', '/day', 'week', 'month', 'cpa', 'target',
    'no more than', 'under', 'max', 'limit', 'by ', 'within', 'spend',
  ]);
  const deliverable = has(text, [
    'plan', 'brief', 'draft', 'set up', 'setup', 'build', 'structure', 'every setting',
    'full', 'complete', 'end to end', 'campaign', 'spec', 'recommend', 'checklist',
  ]);
  const words = text.split(/\s+/).filter(Boolean).length;
  const longEnough = words >= 8;

  const rubric = [
    { label: 'Names the outcome you are buying', met: outcome },
    { label: 'Gives at least one hard constraint', met: constraint },
    { label: 'Says what you want back', met: deliverable },
    { label: 'Long enough to be a brief', met: longEnough },
  ];
  const met = rubric.filter((r) => r.met).length;
  const ok = outcome && deliverable && longEnough;

  let hint = 'A brief needs three things: the outcome, a constraint, and what you want back.';
  if (!longEnough) hint = 'Too short to act on. Write it the way you would brief a freelancer who has never met your business.';
  else if (!outcome) hint = 'What are you actually buying — sales, leads, sign-ups? Name the outcome, not just "results".';
  else if (!deliverable) hint = 'Say what you want handed back: a full campaign plan, a draft, a set of settings.';

  return {
    ok,
    score: met / rubric.length,
    hint,
    praise: constraint
      ? 'That is a brief: outcome, constraint, and a deliverable. Claude now has something to be wrong about specifically, which is what lets you correct it.'
      : 'Good — outcome and deliverable are clear. Adding a hard constraint (budget, target CPA, deadline) would stop the assistant guessing one for you.',
    rubric,
  };
};

/**
 * Mission 02 step 8. Tracking is the detail people skip and then cannot answer
 * "did it work?". Accepts any sane UTM string.
 */
const trackingPlan: Evaluator = (raw) => {
  const text = raw.toLowerCase();
  const source = /utm_source\s*=\s*\S+/.test(text) || /\bsource\s*=\s*\S+/.test(text);
  const medium = /utm_medium\s*=\s*\S+/.test(text) || /\bmedium\s*=\s*\S+/.test(text);
  const campaign = /utm_campaign\s*=\s*\S+/.test(text) || /\bcampaign\s*=\s*\S+/.test(text);
  const rubric = [
    { label: 'utm_source — which platform sent the click', met: source },
    { label: 'utm_medium — what kind of traffic it is', met: medium },
    { label: 'utm_campaign — which campaign to credit', met: campaign },
  ];
  const met = rubric.filter((r) => r.met).length;
  const missing = rubric.filter((r) => !r.met).map((r) => r.label.split(' —')[0]);
  return {
    ok: source && medium && campaign,
    score: met / rubric.length,
    hint: missing.length
      ? `Still missing ${missing.join(', ')}. Write them as key=value pairs joined by &.`
      : 'Write the three UTM parameters as key=value pairs.',
    praise:
      'Source, medium and campaign — that is the minimum that lets analytics credit this campaign instead of dumping it into "direct".',
    rubric,
  };
};

/**
 * A composed walkthrough judges the learner's instruction against the outcome
 * they themselves stated during intake, so the rubric is registered per run.
 */
export function registerEvaluator(id: string, fn: Evaluator): void {
  registry[id] = fn;
}

/** Generic "is this a usable instruction?" rubric, tailored to a stated goal. */
export function makeInstructionEvaluator(outcome: string, sourceName: string | null): Evaluator {
  // Crude stems, so "campaigns" in the stated goal still matches "campaign".
  const stems = outcome
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 4)
    .map((w) => w.slice(0, 5));

  return (raw) => {
    const text = raw.toLowerCase().trim();
    const words = text.split(/\s+/).filter(Boolean).length;

    const asksForWork = has(text, [
      'analy', 'compare', 'review', 'find', 'search', 'check', 'list', 'summar',
      'draft', 'write', 'create', 'prepare', 'tell me', 'show me', 'which', 'what',
      'why', 'rank', 'explain', 'pull', 'look', 'stop', 'pause', 'should', 'best',
      'worst', 'help me', 'get me', 'give me',
    ]);
    const echoesGoal = stems.length === 0 || stems.some((st) => text.includes(st));
    const namesSubject =
      echoesGoal || (sourceName ? text.includes(sourceName.toLowerCase().split('.')[0]) : false);
    const longEnough = words >= 4;

    const rubric = [
      { label: 'Says what you want done', met: asksForWork },
      { label: 'Points at the right subject', met: namesSubject },
      { label: 'Is a full instruction, not a keyword', met: longEnough },
    ];
    const met = rubric.filter((r) => r.met).length;
    // Deliberately forgiving: the step exists to get a real instruction written,
    // not to make the learner guess a password.
    const ok = asksForWork && longEnough;

    let hint = 'Say what you want done, and to what.';
    if (!longEnough) hint = 'Too short. Write it as you would to a colleague who cannot read your mind.';
    else if (!asksForWork) hint = 'Start with what Claude should do — analyse, find, compare, draft.';

    return {
      ok,
      score: met / rubric.length,
      hint,
      praise: namesSubject
        ? 'That matches what you asked for, and it is specific enough that a wrong answer would be obvious — which is what makes it correctable.'
        : 'Clear instruction. Worth checking it still asks for the thing you actually wanted.',
      rubric,
    };
  };
}

const registry: Record<string, Evaluator> = {
  analyzeCampaigns,
  requestDraft,
  campaignBrief,
  trackingPlan,
};

export const getEvaluator = (id: string | undefined): Evaluator | null =>
  id ? (registry[id] ?? null) : null;
