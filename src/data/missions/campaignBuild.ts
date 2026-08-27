import type { BriefField, ContextBlock, Mission, ScenarioBeat } from '../../engine/types';

/* ==================================================================== */
/* The specification.                                                    */
/*                                                                       */
/* Sixteen lines, because that is roughly how many decisions a campaign   */
/* actually contains. Every one carries why it exists and what breaks     */
/* when it is wrong — that is what the learner drills into.               */
/* ==================================================================== */

export const BRIEF_FIELDS: BriefField[] = [
  {
    id: 'objective',
    group: 'Objective',
    label: 'Campaign objective',
    value: null,
    status: 'empty',
    why: 'The objective tells the ad platform which people to look for. It is not a label — it changes who sees the ad.',
    risk: 'Optimise for traffic and the platform will find you people who click and never buy. The campaign will look busy and sell nothing.',
  },
  {
    id: 'success-metric',
    group: 'Objective',
    label: 'Definition of success',
    value: null,
    status: 'empty',
    why: 'The one number that decides whether this campaign continues. Agreed before launch, so it cannot be renegotiated afterwards.',
    risk: 'Without it, every result is arguable. You will keep a losing campaign alive because it is "getting engagement".',
  },
  {
    id: 'audience',
    group: 'Audience',
    label: 'Primary audience',
    value: null,
    status: 'empty',
    why: 'Who the budget is spent trying to reach. The single biggest lever on cost per purchase.',
    risk: 'A cheap audience that is too small exhausts in days; a big audience that is too broad buys clicks from people who will never convert.',
  },
  {
    id: 'exclusions',
    group: 'Audience',
    label: 'Exclusions',
    value: null,
    status: 'empty',
    why: 'Who must not see this. Usually recent purchasers and anyone already in another campaign.',
    risk: 'Pay to advertise to people who bought yesterday, and you inflate your own results while annoying customers.',
  },
  {
    id: 'budget',
    group: 'Budget & bidding',
    label: 'Daily budget',
    value: null,
    status: 'empty',
    why: 'What the campaign may spend per day, and for how long.',
    risk: 'Too little and the campaign never gathers enough conversions to optimise — you are paying to generate noise.',
  },
  {
    id: 'bid-strategy',
    group: 'Budget & bidding',
    label: 'Bid strategy',
    value: null,
    status: 'empty',
    why: 'The rule the platform follows when deciding how much a given purchase is worth bidding for.',
    risk: 'The wrong strategy will happily buy purchases above your breakeven cost. It is doing what you asked; you asked for the wrong thing.',
  },
  {
    id: 'ramp',
    group: 'Budget & bidding',
    label: 'Ramp plan',
    value: null,
    status: 'empty',
    why: 'How fast the budget increases once results hold. Sudden jumps reset the platform’s learning.',
    risk: 'Double the budget on day three and you throw away everything the campaign learned, at your expense.',
  },
  {
    id: 'creative',
    group: 'Creative & copy',
    label: 'Creative format',
    value: null,
    status: 'empty',
    why: 'The asset itself — format, length, hook. Usually the difference between a 1% and a 3% click-through rate.',
    risk: 'The wrong format for the placement gets cropped, muted or skipped, and you pay for the impression anyway.',
  },
  {
    id: 'copy',
    group: 'Creative & copy',
    label: 'Primary text',
    value: null,
    status: 'empty',
    why: 'What the ad says. Every factual claim in it is a claim your business is making.',
    risk: 'An unsubstantiated number is a legal and brand problem that no amount of performance makes worth it.',
  },
  {
    id: 'cta',
    group: 'Creative & copy',
    label: 'Call to action',
    value: null,
    status: 'empty',
    why: 'What you are asking the viewer to do, and what the button says.',
    risk: 'A mismatch between the ad’s promise and the landing page is the most common reason a good ad converts badly.',
  },
  {
    id: 'conversion-event',
    group: 'Measurement',
    label: 'Conversion event',
    value: null,
    status: 'empty',
    why: 'The event the platform optimises toward and reports on. It must be the thing you actually want.',
    risk: 'Optimise toward Add to Cart and the platform will find you expert cart-fillers who never check out.',
  },
  {
    id: 'attribution',
    group: 'Measurement',
    label: 'Attribution window',
    value: null,
    status: 'empty',
    why: 'How long after seeing or clicking an ad a purchase still counts as caused by it.',
    risk: 'Widen the window and the same campaign "improves" without anything changing in reality. Narrow it and a genuinely good campaign looks like a failure.',
  },
  {
    id: 'utm',
    group: 'Measurement',
    label: 'UTM tagging',
    value: null,
    status: 'empty',
    why: 'The tags on the link that let your own analytics tell where a visitor came from.',
    risk: 'Untagged traffic lands in "direct" and becomes invisible. You will be unable to answer "did it work?" with anything but the platform’s own marking of its own homework.',
  },
  {
    id: 'naming',
    group: 'Operations',
    label: 'Naming convention',
    value: null,
    status: 'empty',
    why: 'How this campaign is named so it can be sorted, filtered and compared six months from now.',
    risk: 'Twelve campaigns called "new campaign July" and your reporting is archaeology.',
  },
  {
    id: 'test-design',
    group: 'Operations',
    label: 'Test design',
    value: null,
    status: 'empty',
    why: 'What is being varied and what is held constant, so the result means something.',
    risk: 'Change two things at once and you learn nothing — you will not know which one moved the number.',
  },
  {
    id: 'guardrails',
    group: 'Operations',
    label: 'Kill rules & autonomy',
    value: null,
    status: 'empty',
    why: 'The conditions under which this campaign stops, and which of those the assistant may act on alone.',
    risk: 'Without a kill rule, a campaign that breaks overnight spends the whole budget before a human sees it.',
  },
];

/* ==================================================================== */
/* What the assistant cannot guess.                                      */
/* ==================================================================== */

export const CONTEXT_BLOCKS: ContextBlock[] = [
  {
    id: 'unit-economics',
    label: 'Unit economics',
    detail:
      'Average order value $24.80. Contribution margin after cost of goods and shipping: $11.90 per order.',
    useful: true,
    added: false,
    unlocks: 'judging whether a cost per purchase is healthy or ruinous, instead of guessing',
  },
  {
    id: 'claims-policy',
    label: 'Brand & claims policy',
    detail:
      '4,100 customers to date. Legal requires every number that appears in an ad to be substantiated.',
    useful: true,
    added: false,
    unlocks: 'catching a generated claim you cannot actually back up',
  },
  {
    id: 'past-winner',
    label: 'Last quarter’s best creative',
    detail:
      '15-second vertical video, problem-first hook in the opening two seconds, captions on, no music.',
    useful: true,
    added: false,
    unlocks: 'starting from what already worked rather than from a blank page',
  },
  {
    id: 'office',
    label: 'Company details',
    detail: 'Head office in Leeds. Team of nine. Registered 2019.',
    useful: false,
    added: false,
  },
  {
    id: 'stack',
    label: 'Internal tooling',
    detail: 'The team plans in Notion and talks in Slack.',
    useful: false,
    added: false,
  },
  {
    id: 'founders',
    label: 'Founder story',
    detail: 'Founded by two physiotherapists after a chance meeting at a conference.',
    useful: false,
    added: false,
  },
];

/* ==================================================================== */
/* Audience data returned by the simulated connector.                    */
/* ==================================================================== */

export const AUDIENCE_ROWS = [
  { id: 'lal', name: 'Lookalike 1% — purchasers', spend: '$2,637', ctr: '2.7%', cpa: '$6.40', roas: '3.9', best: true },
  { id: 'ret', name: 'Retargeting — site visitors 30d', spend: '$361', ctr: '4.1%', cpa: '$4.10', roas: '6.2' },
  { id: 'int', name: 'Broad interest — fitness', spend: '$1,901', ctr: '0.9%', cpa: '$19.80', roas: '1.2' },
];

const set = (
  id: string,
  value: string,
  status: BriefField['status'],
  source?: string,
): ScenarioBeat['action'] => ({ type: 'SET_BRIEF', id, patch: { value, status, source } });

export const briefBeat = (delay: number, ...actions: ScenarioBeat['action'][]): ScenarioBeat[] =>
  actions.map((action, i) => ({ delay: delay + i * 60, action }));

export { set as setBrief };

/* ==================================================================== */
/* Scripted beats                                                        */
/* ==================================================================== */

/** The model refuses to guess and asks for the three things only you know. */
export const questionsBeats: ScenarioBeat[] = [
  { delay: 150, action: { type: 'BUSY', busy: true } },
  {
    delay: 900,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'cb-1',
        role: 'assistant',
        kind: 'text',
        text: 'I can build this, but three things would be guesses if I decided them myself — and each one changes everything downstream. Rather than assume, I would rather ask.',
      },
    },
  },
  {
    delay: 1500,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'q-outcome',
        role: 'assistant',
        kind: 'question',
        prompt: 'What does this campaign have to produce?',
        note: 'This sets what the ad platform optimises toward, so it decides who ever sees the ad.',
        answered: null,
        options: [
          {
            id: 'purchases',
            label: 'Purchases on the site',
            detail: 'Optimise toward completed orders. Slower to learn, but it buys the thing you actually sell.',
            writes: [
              { id: 'objective', value: 'Conversions — Purchase', status: 'confirmed', source: 'You decided this.' },
              { id: 'conversion-event', value: 'Purchase', status: 'confirmed', source: 'Follows from the objective you chose.' },
            ],
          },
          {
            id: 'leads',
            label: 'Email sign-ups',
            detail: 'Cheaper per action, but you are buying an address, not revenue. Only worth it if you know what an address converts at.',
            writes: [
              { id: 'objective', value: 'Leads — Email sign-up', status: 'confirmed', source: 'You decided this.' },
              { id: 'conversion-event', value: 'CompleteRegistration', status: 'confirmed', source: 'Follows from the objective you chose.' },
            ],
          },
          {
            id: 'traffic',
            label: 'Traffic to the site',
            detail: 'The platform will find people who click. Clicking is not buying — this is the objective that produces busy, unprofitable campaigns.',
            writes: [
              { id: 'objective', value: 'Traffic — Landing page views', status: 'confirmed', source: 'You decided this — see the warning attached.' },
              { id: 'conversion-event', value: 'LandingPageView', status: 'confirmed', source: 'Follows from the objective you chose.' },
            ],
          },
        ],
      },
    },
  },
  {
    delay: 1800,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'q-success',
        role: 'assistant',
        kind: 'question',
        prompt: 'What result in 30 days would make you keep this running?',
        note: 'Your loaded unit economics put breakeven at $11.90 per purchase, or a ROAS of about 2.1.',
        answered: null,
        options: [
          {
            id: 'roas',
            label: 'ROAS at or above 2.6',
            detail: 'A clear margin over the 2.1 breakeven. Judges the campaign on revenue returned per pound spent.',
            writes: [{ id: 'success-metric', value: 'ROAS ≥ 2.6 (breakeven 2.1)', status: 'confirmed', source: 'Your call, derived from the unit economics you loaded.' }],
          },
          {
            id: 'cpa',
            label: 'Cost per purchase under $8.50',
            detail: 'Leaves $3.40 contribution on every order. Easier to act on daily than ROAS.',
            writes: [{ id: 'success-metric', value: 'CPA ≤ $8.50 (breakeven $11.90)', status: 'confirmed', source: 'Your call, derived from the unit economics you loaded.' }],
          },
          {
            id: 'volume',
            label: '400 purchases, whatever they cost',
            detail: 'A volume goal with no cost ceiling. Achievable and capable of losing money on every single order.',
            writes: [{ id: 'success-metric', value: '400 purchases in 30 days (no cost ceiling)', status: 'confirmed', source: 'Your call — note there is no profitability constraint attached.' }],
          },
        ],
      },
    },
  },
  {
    delay: 2100,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'q-budget',
        role: 'assistant',
        kind: 'question',
        prompt: 'What can this spend, and over how long?',
        note: 'A purchase-optimised campaign needs roughly 50 conversions a week before the platform stops guessing.',
        answered: null,
        options: [
          {
            id: 'fifty',
            label: '$50 a day for 30 days ($1,500)',
            detail: 'At a $6.40 cost per purchase that is around 55 purchases a week — just enough to get out of the learning phase.',
            writes: [{ id: 'budget', value: '$50/day · 30 days · $1,500 total', status: 'confirmed', source: 'You decided this.' }],
          },
          {
            id: 'small',
            label: '$15 a day for 14 days ($210)',
            detail: 'Roughly 16 purchases a week. The campaign never leaves the learning phase, so you would be reading noise and calling it a result.',
            writes: [{ id: 'budget', value: '$15/day · 14 days · $210 total', status: 'confirmed', source: 'You decided this — below the volume needed to optimise.' }],
          },
          {
            id: 'large',
            label: '$200 a day for 30 days ($6,000)',
            detail: 'Plenty of signal, but you are risking $6,000 on an untested audience-creative pairing before you have evidence.',
            writes: [{ id: 'budget', value: '$200/day · 30 days · $6,000 total', status: 'confirmed', source: 'You decided this.' }],
          },
        ],
      },
    },
  },
  { delay: 2300, action: { type: 'BUSY', busy: false } },
];

/** The model completes the specification — and marks what it invented. */
export const fillBriefBeats: ScenarioBeat[] = [
  { delay: 200, action: { type: 'BUSY', busy: true } },
  ...briefBeat(
    1100,
    set('audience', 'Broad — 18-54, all interests', 'assumed', 'Assumed by the assistant.'),
    set('exclusions', 'None set', 'assumed', 'Assumed by the assistant.'),
    set('bid-strategy', 'Highest volume (no cost ceiling)', 'assumed', 'Assumed by the assistant.'),
    set('ramp', 'Increase 20% every 3 days if stable', 'assumed', 'Assumed by the assistant.'),
    set('creative', 'Single image, square', 'assumed', 'Assumed by the assistant.'),
    set('copy', 'Not written', 'empty'),
    set('cta', 'Shop Now', 'assumed', 'Assumed by the assistant.'),
    set('attribution', '7-day click, 1-day view', 'assumed', 'Assumed by the assistant — platform default.'),
  ),
  {
    delay: 1700,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'cb-2',
        role: 'assistant',
        kind: 'text',
        text: 'The brief is drafted. Eight lines came from you or from your loaded context; the rest I filled in myself so the plan holds together, and I have marked every one of those as an assumption rather than burying it. Open the brief and go through them — at least one changes what "success" even means, and it is not the one that looks important.',
      },
    },
  },
  {
    delay: 1900,
    action: {
      type: 'TOAST',
      toast: { id: 'toast-brief', text: '8 lines drafted · 8 marked as assumptions', tone: 'info' },
    },
  },
  { delay: 2050, action: { type: 'BUSY', busy: false } },
];

/** Audience evidence, then the decision it enables. */
export const audienceBeats: ScenarioBeat[] = [
  { delay: 200, action: { type: 'BUSY', busy: true } },
  {
    delay: 900,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'cb-3',
        role: 'assistant',
        kind: 'text',
        text: 'Good catch — that one was mine, and I should not have chosen it quietly. Let me replace the rest of my guesses with evidence, starting with the audience. I will pull how your existing audiences actually perform.',
      },
    },
  },
  {
    delay: 1500,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'tool-aud',
        role: 'assistant',
        kind: 'tool',
        connectorId: 'windsor',
        tool: 'windsor.get_audience_performance()',
        args: '{\n  "platform": "meta",\n  "date_range": "last_90_days",\n  "group_by": "audience",\n  "metrics": ["spend", "ctr", "cpa", "roas", "reach"]\n}',
        status: 'running',
      },
    },
  },
  {
    delay: 2700,
    action: {
      type: 'PATCH_MESSAGE',
      id: 'tool-aud',
      patch: {
        status: 'done',
        result: {
          kind: 'campaigns',
          rows: AUDIENCE_ROWS,
          note: 'Reach — Lookalike 1%: 1.8M · Retargeting 30d: 11K · Broad interest: 4.2M · breakeven CPA $11.90',
        },
      },
    },
  },
  {
    delay: 3300,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'q-audience',
        role: 'assistant',
        kind: 'question',
        prompt: 'Which audience should carry the $50 a day?',
        note: 'Read the reach column as carefully as the cost column. Both matter, and only one of them is obvious.',
        answered: null,
        options: [
          {
            id: 'ret',
            label: 'Retargeting — best cost at $4.10, ROAS 6.2',
            detail: 'The best numbers on the page, and the wrong answer: 11,000 people cannot absorb $50 a day. It exhausts in under a week, frequency climbs, and the cost rises to meet the others. Worth running — in its own small campaign.',
          },
          {
            id: 'lal',
            label: 'Lookalike 1% of purchasers — $6.40, ROAS 3.9',
            detail: 'Profitable against your $11.90 breakeven with 1.8M people to reach. Efficiency and room to scale, which is the pairing you are actually looking for.',
            writes: [
              { id: 'audience', value: 'Lookalike 1% — purchasers (1.8M reach)', status: 'confirmed', source: 'windsor.get_audience_performance() — $6.40 CPA against $11.90 breakeven.' },
              { id: 'exclusions', value: 'Purchasers last 90 days · retargeting audience', status: 'confirmed', source: 'Prevents this campaign bidding against your own retargeting.' },
            ],
          },
          {
            id: 'int',
            label: 'Broad interest — 4.2M reach',
            detail: 'The most people, and $19.80 a purchase against an $11.90 breakeven. Every order loses $7.90. Scale is not an argument for spending above your margin.',
          },
        ],
      },
    },
  },
  { delay: 3500, action: { type: 'BUSY', busy: false } },
];

/** How the money is allowed to be spent. */
export const bidBeats: ScenarioBeat[] = [
  { delay: 200, action: { type: 'BUSY', busy: true } },
  {
    delay: 1000,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'q-bid',
        role: 'assistant',
        kind: 'question',
        prompt: 'How should the platform be allowed to spend that budget?',
        note: 'My draft said "highest volume". That was an assumption, and on your margins it is the expensive one.',
        answered: null,
        options: [
          {
            id: 'volume',
            label: 'Highest volume — get as many purchases as possible',
            detail: 'No cost ceiling. It will buy a purchase at $18 as happily as at $6 because you never said it could not. On an $11.90 breakeven that is a machine for losing money at scale.',
          },
          {
            id: 'cost-cap',
            label: 'Cost cap at $8.50 per purchase',
            detail: 'The platform may buy purchases up to $8.50 and no higher. Slower to spend, and it cannot quietly cross your breakeven. This is your success metric expressed as a rule the auction can follow.',
            writes: [
              { id: 'bid-strategy', value: 'Cost cap — $8.50 per purchase', status: 'confirmed', source: 'Derived from the unit economics you loaded: $11.90 breakeven, $3.40 contribution retained.' },
              { id: 'ramp', value: '+20% every 3 days while CPA holds under $8.50', status: 'confirmed', source: 'Slow enough not to reset the learning phase.' },
            ],
          },
          {
            id: 'bid-cap',
            label: 'Bid cap at $8.50',
            detail: 'Caps what it bids in each auction, not what a purchase ends up costing you. Sounds identical, behaves differently, and usually under-delivers while still missing your real ceiling.',
          },
        ],
      },
    },
  },
  { delay: 1200, action: { type: 'BUSY', busy: false } },
];

/** Three drafts. One of them is confidently untrue. */
export const creativeBeats: ScenarioBeat[] = [
  { delay: 200, action: { type: 'BUSY', busy: true } },
  {
    delay: 1000,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'cb-4',
        role: 'assistant',
        kind: 'text',
        text: 'Here are three primary-text options, built on the 15-second vertical video format that won for you last quarter. Read them as claims your business is making, not as writing — one of these is a problem.',
      },
    },
  },
  {
    delay: 1600,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'rev-copy',
        role: 'assistant',
        kind: 'review',
        mode: 'variants',
        title: 'Primary text — pick what ships',
        intro: 'Your brand policy requires every number that appears in an ad to be substantiated.',
        items: [
          {
            id: 'v1',
            label: '“Loved by 40,000 customers — the recovery band physios actually recommend.”',
            detail: 'Hook: social proof. Strongest performer of the three in testing.',
            sound: false,
            verdict: 'none',
            flagNote:
              'Right. You have 4,100 customers, not 40,000, and “physios actually recommend” is a claim nobody has substantiated. It is fluent, it is plausible, and it is invented — which is precisely why fluent output gets checked against its source rather than trusted for its tone.',
            okNote: '',
          },
          {
            id: 'v2',
            label: '“Still stiff three days after leg day? Two minutes with this changes that.”',
            detail: 'Hook: problem-first — the structure that worked last quarter.',
            sound: true,
            verdict: 'none',
            flagNote: '',
            okNote: 'Good. Problem-first hook, no factual claim to defend, and it matches the format your own data says works.',
          },
          {
            id: 'v3',
            label: '“Physio-designed. Fifteen seconds a side. That is the entire routine.”',
            detail: 'Hook: simplicity.',
            sound: true,
            verdict: 'none',
            flagNote: '',
            okNote: 'Fine. “Physio-designed” is a fact about your product that you can support, and the time claim is a property of the routine.',
          },
        ],
      },
    },
  },
  { delay: 1800, action: { type: 'BUSY', busy: false } },
];

/** Ask for the tagging, in the learner's own words. */
export const trackingPromptBeats: ScenarioBeat[] = [
  { delay: 200, action: { type: 'BUSY', busy: true } },
  ...briefBeat(
    900,
    set('creative', '15s vertical video · captions on · problem-first hook', 'confirmed', 'Matches the best-performing creative in your loaded context.'),
    set('copy', '“Still stiff three days after leg day? Two minutes with this changes that.”', 'confirmed', 'You approved this variant and rejected the unsupported one.'),
    set('cta', 'Shop Now → product page (not homepage)', 'confirmed', 'Destination matches the promise in the ad.'),
  ),
  {
    delay: 1400,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'cb-5',
        role: 'assistant',
        kind: 'text',
        text: 'Copy locked, and the invented claim is out. Next is the line most people skip: tagging the destination link so your own analytics can tell this campaign apart from everything else. Write me the UTM parameters you want on it — source, medium and campaign at minimum.',
      },
    },
  },
  { delay: 1600, action: { type: 'BUSY', busy: false } },
];

/** Naming, then the operational lines. */
export const namingBeats: ScenarioBeat[] = [
  { delay: 200, action: { type: 'BUSY', busy: true } },
  {
    delay: 1000,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'q-naming',
        role: 'assistant',
        kind: 'question',
        prompt: 'How should this campaign be named?',
        note: 'You will be reading this name in a list of forty, six months from now, trying to answer a question you have not thought of yet.',
        answered: null,
        options: [
          {
            id: 'auto',
            label: 'Leave the platform default',
            detail: '“Purchase conversions campaign — copy”. Unsortable, unfilterable, indistinguishable from the next four.',
          },
          {
            id: 'plain',
            label: 'Recovery band video July',
            detail: 'Readable today, useless later. It carries no audience, no objective and no creative — the three things you will want to group by.',
          },
          {
            id: 'structured',
            label: 'MET_PUR_LAL1_VID-UGC15_2026-Q3',
            detail: 'Platform, objective, audience, creative, period — in fixed positions. Ugly to read and trivial to filter, sort and compare, which is the entire job of a name.',
            writes: [
              { id: 'naming', value: 'MET_PUR_LAL1_VID-UGC15_2026-Q3', status: 'confirmed', source: 'Fixed-position convention: platform_objective_audience_creative_period.' },
            ],
          },
        ],
      },
    },
  },
  { delay: 1200, action: { type: 'BUSY', busy: false } },
];

/** Where the autonomy line sits. */
export const autonomyBeats: ScenarioBeat[] = [
  { delay: 200, action: { type: 'BUSY', busy: true } },
  ...briefBeat(
    800,
    set('test-design', 'Hold audience + budget constant; vary creative only (2 ad sets)', 'confirmed', 'One variable, so the result is attributable.'),
  ),
  {
    delay: 1300,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'q-autonomy',
        role: 'assistant',
        kind: 'question',
        prompt: 'Once this is live, what may I do without asking you again?',
        note: 'Think about which way each action moves your exposure, not how difficult it is.',
        answered: null,
        options: [
          {
            id: 'read',
            label: 'Read and report only — wake me for everything else',
            detail: 'Safest on paper. In practice a campaign that breaks at 11pm spends until you read the morning report, and you have made the machine slower than the problem.',
          },
          {
            id: 'asymmetric',
            label: 'Pause anything breaching the kill rule; ask me for anything that increases spend',
            detail: 'Autonomy split by consequence direction. Actions that reduce exposure run alone, because the worst case is lost upside. Actions that increase exposure stop at a human, because the worst case is unbounded.',
            writes: [
              { id: 'guardrails', value: 'Auto-pause if CPA > $11.90 over 3 days or spend > $60/day · all increases require approval', status: 'confirmed', source: 'Asymmetric autonomy — it may hit the brakes alone, never the accelerator.' },
            ],
          },
          {
            id: 'full',
            label: 'Full autonomy, including budget increases',
            detail: 'Fast, and the one setting where a misread signal at 3am compounds into real money with nobody awake to notice.',
          },
        ],
      },
    },
  },
  { delay: 1500, action: { type: 'BUSY', busy: false } },
];

/** The pre-flight check. One line does not match the brief. */
export const preflightBeats: ScenarioBeat[] = [
  { delay: 200, action: { type: 'BUSY', busy: true } },
  {
    delay: 900,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'cb-6',
        role: 'assistant',
        kind: 'text',
        text: 'The specification is complete. Before I ask you to approve it, here is the pre-flight — every line checked against what is actually configured. Verify each one yourself rather than taking my word for it; I am checking my own homework here, and that is exactly the situation where a second pair of eyes earns its keep.',
      },
    },
  },
  {
    delay: 1500,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'rev-qa',
        role: 'assistant',
        kind: 'review',
        mode: 'checklist',
        title: 'Pre-flight — 7 checks',
        intro: 'Each line shows what the brief says against what is configured in the account.',
        items: [
          {
            id: 'qa-budget',
            label: 'Budget — $50/day, 30 days, cost cap $8.50',
            detail: 'Brief: $50/day, cost cap $8.50. Configured: $50/day, cost cap $8.50.',
            sound: true,
            verdict: 'none',
            flagNote: '',
            okNote: 'Matches.',
          },
          {
            id: 'qa-audience',
            label: 'Audience — Lookalike 1%, excluding purchasers 90d',
            detail: 'Brief: Lookalike 1% + exclusions. Configured: Lookalike 1% + exclusions applied.',
            sound: true,
            verdict: 'none',
            flagNote: '',
            okNote: 'Matches, and the exclusion is actually applied rather than just written down.',
          },
          {
            id: 'qa-event',
            label: 'Conversion event — pixel reporting AddToCart',
            detail: 'Brief: optimise for Purchase. Configured: the pixel is firing AddToCart.',
            sound: false,
            verdict: 'none',
            flagNote:
              'Found it. The brief optimises for Purchase; the pixel is reporting AddToCart. Launch this and the platform spends thirty days getting expert at filling carts nobody checks out — and every report will look fine, because it will be measuring the wrong event consistently. This is the most common launch defect there is, and it is invisible unless someone reads both halves of the line.',
            okNote: '',
          },
          {
            id: 'qa-utm',
            label: 'UTMs — present on the destination URL',
            detail: 'Brief: source, medium, campaign. Configured: all three present.',
            sound: true,
            verdict: 'none',
            flagNote: '',
            okNote: 'Tagged, so your own analytics can credit this instead of filing it under direct.',
          },
          {
            id: 'qa-naming',
            label: 'Name — MET_PUR_LAL1_VID-UGC15_2026-Q3',
            detail: 'Brief: fixed-position convention. Configured: matches.',
            sound: true,
            verdict: 'none',
            flagNote: '',
            okNote: 'Matches the convention.',
          },
          {
            id: 'qa-kill',
            label: 'Kill rule — auto-pause above $11.90 CPA over 3 days',
            detail: 'Brief: auto-pause on breach, approval for increases. Configured: as briefed.',
            sound: true,
            verdict: 'none',
            flagNote: '',
            okNote: 'The brakes are wired up and the accelerator is not.',
          },
          {
            id: 'qa-claims',
            label: 'Claims — no unsubstantiated numbers in the copy',
            detail: 'Brief: every number substantiated. Configured: approved variant contains no numeric claims.',
            sound: true,
            verdict: 'none',
            flagNote: '',
            okNote: 'Clean — because you struck the variant that was not.',
          },
        ],
      },
    },
  },
  { delay: 1700, action: { type: 'BUSY', busy: false } },
];

/** The fix, then the approval gate. */
export const approvalBeats: ScenarioBeat[] = [
  { delay: 200, action: { type: 'BUSY', busy: true } },
  ...briefBeat(
    800,
    set('conversion-event', 'Purchase — pixel corrected from AddToCart', 'confirmed', 'You caught the mismatch at pre-flight.'),
    set('attribution', '7-day click, 1-day view — agreed, not defaulted', 'confirmed', 'You reviewed the assumption and accepted it deliberately.'),
    set('utm', 'utm_source · utm_medium · utm_campaign on the destination URL', 'confirmed', 'You wrote the tagging.'),
  ),
  {
    delay: 1400,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'cb-7',
        role: 'assistant',
        kind: 'text',
        text: 'Pixel corrected to Purchase and re-verified. Sixteen of sixteen lines are now decided by you or derived from your data — nothing left assumed. This is the point where it becomes real money, so it is yours to sign.',
      },
    },
  },
  {
    delay: 2000,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'cb-approval',
        role: 'assistant',
        kind: 'approval',
        title: 'Approval required — launch campaign',
        summary: 'Launching commits $1,500 over 30 days. Every line in the brief is confirmed.',
        draft: {
          name: 'MET_PUR_LAL1_VID-UGC15_2026-Q3',
          budget: '$50 / day · cost cap $8.50',
          audience: 'Lookalike 1% — purchasers, excl. purchasers 90d',
          creative: '15s vertical video · problem-first hook',
          objective: 'Conversions — Purchase',
          basedOn: '16-line brief, fully confirmed',
        },
        status: 'pending',
      },
    },
  },
  { delay: 2200, action: { type: 'BUSY', busy: false } },
];

/** Launch, and the plan for what happens next. */
export const launchBeats: ScenarioBeat[] = [
  { delay: 200, action: { type: 'BUSY', busy: true } },
  {
    delay: 900,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'tool-launch',
        role: 'assistant',
        kind: 'tool',
        connectorId: 'windsor',
        tool: 'windsor.launch_campaign()',
        args: '{\n  "brief_id": "br_44c1",\n  "confirmed_by": "human",\n  "unresolved_assumptions": 0,\n  "mode": "simulation"\n}',
        status: 'running',
      },
    },
  },
  {
    delay: 2200,
    action: {
      type: 'PATCH_MESSAGE',
      id: 'tool-launch',
      patch: {
        status: 'done',
        result: {
          kind: 'created',
          reference: 'sim_cmp_0xB417',
          draft: {
            name: 'MET_PUR_LAL1_VID-UGC15_2026-Q3',
            budget: '$50 / day · cost cap $8.50',
            audience: 'Lookalike 1% — purchasers, excl. purchasers 90d',
            creative: '15s vertical video · problem-first hook',
            objective: 'Conversions — Purchase',
            basedOn: '16-line brief, fully confirmed',
          },
        },
      },
    },
  },
  {
    delay: 2800,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'cb-8',
        role: 'assistant',
        kind: 'text',
        text: 'Live in simulation. Here is what I will do without being asked: check performance daily, pause the campaign if cost per purchase runs above $11.90 for three consecutive days or spend exceeds $60 in a day, and tell you either way. Here is what I will not do: touch the budget. Days 1-4 are the learning phase — the numbers will look bad and that is expected, so the kill rule deliberately needs three days, not one. First real read is day 7.',
        evidence: ['Auto-pause: CPA > $11.90 / 3d', 'Approval: any spend increase', 'First read: day 7'],
      },
    },
  },
  {
    delay: 3000,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'cb-9',
        role: 'system',
        kind: 'notice',
        text: 'SIMULATION — no campaign was created, no advertising account was contacted, and no money exists.',
      },
    },
  },
  { delay: 3150, action: { type: 'BUSY', busy: false } },
];

/* ==================================================================== */
/* Mission 02                                                            */
/* ==================================================================== */

const chatTarget = (id: string, caption: string) => [
  { id, when: { screen: 'chat' as const }, caption },
  { id: 'nav-chat', caption: 'Back to the conversation' },
];
const chatTargetPhone = (id: string, caption: string) => [
  { id, when: { screen: 'chat' as const }, caption },
  { id: 'tab-chat', caption: 'Back to Chat' },
];

export const campaignBuildMission: Mission = {
  id: 'campaign-build',
  order: 2,
  title: 'Brief Claude to Build a Campaign — Every Detail',
  premise:
    'I do not want a summary. I want Claude to build the actual campaign, decide every setting, and show me the ones I have to own.',
  summary:
    'Take an assistant from a vague request to a sixteen-line specification a stranger could execute — interrogating every requirement, catching what it invented, and signing only what you verified.',
  goal: 'Produce a complete, verified campaign specification with zero unresolved assumptions, and launch it under an autonomy boundary you set.',
  difficulty: 'Advanced',
  minutes: '15–20 min',
  skills: ['prompting', 'agents', 'dataAnalysis', 'automation', 'safety', 'toolUse'],
  concepts: [
    'context', 'unit-economics', 'interrogation', 'assumption', 'constraint',
    'verification', 'iteration', 'attribution', 'autonomy', 'spec',
  ],
  status: 'available',
  variant: 'lesson',
  initialSim: {
    // Mission 01 ended with this connector attached; this mission picks up there.
    connectorStatus: {
      gmail: 'available', drive: 'available', supabase: 'available', vercel: 'available',
      windsor: 'connected', canva: 'available', zapier: 'available', huggingface: 'available',
    },
    brief: BRIEF_FIELDS,
    context: CONTEXT_BLOCKS,
    messages: [
      {
        id: 'cb-0',
        role: 'assistant',
        kind: 'text',
        text: 'Your marketing data connector is still attached from last time, so I can pull performance whenever we need it. What are we building?',
      },
    ],
  },
  steps: [
    {
      id: 'b1',
      title: 'Load what it cannot guess',
      objective: 'Give the assistant the one fact that makes every cost decision judgeable.',
      actionType: 'click',
      concept: 'unit-economics',
      why: 'Without knowing what an order is worth, "is $8 a good cost per purchase?" is unanswerable — and every decision after it is taste, not arithmetic.',
      explanation:
        'Context is not a dumping ground. The test for any fact is simple: can it change a decision in this piece of work? Your margin can — it sets the ceiling on what a customer may cost, which then determines the bid strategy, the kill rule, and which audience is even viable. Your founding story cannot. Loading everything is not thoroughness; it is noise that competes for the model’s attention with the things that matter.',
      hint: 'Open Context and load the fact that tells the assistant what one order is actually worth.',
      successMessage: 'Loaded. Every cost decision from here can be checked against a real number.',
      learning: ['prompting', 'dataAnalysis'],
      xp: 110,
      devices: {
        desktop: {
          instruction: 'Open Context and load the Unit economics block.',
          note: 'Anything loaded here is available on every message in this workspace.',
          target: [
            { id: 'context-add-unit-economics', when: { screen: 'context' }, caption: 'Load Unit economics' },
            { id: 'nav-context', caption: 'Open Context' },
          ],
        },
        phone: {
          instruction: 'Open the Context tab and load the Unit economics block.',
          note: 'Anything loaded here is available on every message in this workspace.',
          target: [
            { id: 'context-add-unit-economics', when: { screen: 'context' }, caption: 'Load Unit economics' },
            { id: 'tab-context', caption: 'Open Context' },
          ],
        },
      },
      expect: { event: 'add-context', where: { id: 'unit-economics' } },
      allow: [
        { event: 'add-context', where: { id: 'claims-policy' } },
        { event: 'add-context', where: { id: 'past-winner' } },
        { event: 'open-screen', where: { screen: 'context' } },
      ],
      deepDive: [
        {
          q: 'Why not just load everything? It is only text.',
          a: 'Because attention is finite and dilution is real. A model given forty facts weights the relevant three less heavily than a model given three. It also costs more and makes the output harder to audit — when a claim appears, you want a short list of places it could have come from. Curating context is the work, not a shortcut past it.',
        },
        {
          q: 'What actually counts as useful context here?',
          a: 'Ask what decision it changes. Unit economics changes the bid strategy and the kill rule. The claims policy changes which copy can ship. Last quarter’s winning creative changes the starting format. Your office location changes nothing, so it earns no space.',
        },
        {
          q: 'Is this different from just putting it in the prompt?',
          a: 'Mostly in durability. A fact typed into one message applies to that conversation; a fact in the workspace context applies to everything you do there, including work you start next week. For anything you would otherwise retype, that is the difference between a habit and a chore.',
        },
      ],
    },
    {
      id: 'b2',
      title: 'Write a brief, not a wish',
      objective: 'Ask for the campaign in a way that can be executed and can be wrong specifically.',
      actionType: 'type',
      concept: 'spec',
      why: 'A vague request does not fail loudly. It returns something confident and generic, and the cost lands later.',
      explanation:
        'Three things make a brief actionable: the outcome you are buying (purchases, not "results"), at least one hard constraint (a budget, a deadline, a cost ceiling), and what you want handed back (a plan, a draft, every setting). The reason to be specific is not politeness to the model — it is that a specific request produces a specific answer, and a specific answer can be checked. Vague in, unfalsifiable out.',
      hint: 'Ask for the whole campaign. Name what you are buying, give it a constraint, and say what you want back.',
      successMessage: 'That is a brief. It can now be wrong in ways you can see.',
      learning: ['prompting'],
      xp: 150,
      devices: {
        desktop: {
          instruction: 'Go to the conversation and write your brief, then send it.',
          target: chatTarget('composer-input', 'Write the brief here'),
        },
        phone: {
          instruction: 'Go to the conversation and write your brief, then send it.',
          target: chatTargetPhone('composer-input', 'Write the brief here'),
        },
      },
      expect: { event: 'send-message', evaluator: 'campaignBrief' },
      allow: [{ event: 'open-screen', where: { screen: 'chat' } }],
      simulationResult: questionsBeats,
      weakResult: [
        { delay: 150, action: { type: 'BUSY', busy: true } },
        {
          delay: 900,
          action: {
            type: 'PUSH_MESSAGE',
            message: {
              id: 'cb-weak',
              role: 'assistant',
              kind: 'text',
              text: 'I can start, but I would be inventing most of it. Tell me what the campaign has to produce, what it may spend, and what you want handed back — a plan, a draft, or every setting ready to launch.',
            },
          },
        },
        { delay: 1050, action: { type: 'BUSY', busy: false } },
      ],
      deepDive: [
        {
          q: 'Is a longer prompt always a better prompt?',
          a: 'No. Specific beats long. "Build me a campaign, be thorough, think step by step, you are a world-class marketer" is long and says nothing. "Get me purchases at under $8.50 on $50 a day for 30 days, and give me every setting" is shorter and completely determines the work.',
        },
        {
          q: 'What if I genuinely do not know the constraint yet?',
          a: 'Then say that, and ask what it needs to know. Being explicit about the gap is far better than leaving it silent, because a silent gap gets filled by an assumption you never see. The next step of this mission is exactly that move.',
        },
        {
          q: 'Should I tell it to act as a marketing expert?',
          a: 'Role framing does much less than it used to on current models and much less than context does. Giving it your actual margins moves the output more than any amount of "you are a senior performance marketer".',
        },
      ],
    },
    {
      id: 'b3',
      title: 'Make it interrogate the requirement',
      objective: 'Answer the three questions it will not guess at — the ones only you can settle.',
      actionType: 'decide',
      concept: 'interrogation',
      why: 'Every question it asks now is an assumption it would otherwise have made silently.',
      explanation:
        'Notice what happened: rather than producing a plausible plan built on invented premises, it stopped and asked for the three inputs that determine everything downstream. This is the behaviour to reward and to demand. The questions are also a free audit of your own thinking — if you cannot answer one, the campaign was never fully specified, and you have just found out cheaply rather than expensively.',
      hint: 'Work down the three questions in the conversation and answer each one. Read the consequence under each option before you pick.',
      successMessage: 'Three decisions made by you, on purpose, with the trade-offs visible.',
      learning: ['prompting', 'agents'],
      xp: 140,
      advance: 'manual',
      devices: {
        desktop: {
          instruction: 'Answer all three questions in the conversation.',
          target: [
            { id: 'question-q-outcome', when: { pendingQuestion: 'q-outcome' }, caption: 'What are you buying?' },
            { id: 'question-q-success', when: { pendingQuestion: 'q-success' }, caption: 'What counts as success?' },
            { id: 'question-q-budget', when: { pendingQuestion: 'q-budget' }, caption: 'What can it spend?' },
            { id: 'nav-chat', caption: 'Back to the conversation' },
          ],
        },
        phone: {
          instruction: 'Answer all three questions in the conversation.',
          target: [
            { id: 'question-q-outcome', when: { pendingQuestion: 'q-outcome' }, caption: 'What are you buying?' },
            { id: 'question-q-success', when: { pendingQuestion: 'q-success' }, caption: 'What counts as success?' },
            { id: 'question-q-budget', when: { pendingQuestion: 'q-budget' }, caption: 'What can it spend?' },
            { id: 'tab-chat', caption: 'Back to Chat' },
          ],
        },
      },
      expect: { event: 'answer-question', where: { questionId: 'q-budget' } },
      allow: [
        { event: 'answer-question', where: { questionId: 'q-outcome' } },
        { event: 'answer-question', where: { questionId: 'q-success' } },
        { event: 'open-screen', where: { screen: 'chat' } },
        { event: 'open-brief-field' },
      ],
      simulationResult: fillBriefBeats,
      teach: {
        kind: 'callout',
        title: 'The move worth stealing',
        body: 'When you want serious work, end the brief with "before you start, tell me what you still need from me." It converts silent assumptions into a short list of decisions — and the list is usually shorter than you feared.',
      },
      deepDive: [
        {
          q: 'Why does the objective change who sees the ad?',
          a: 'The platform optimises delivery toward people likely to perform the event you selected. Choose Traffic and it finds habitual clickers, because clicking is what you asked it to maximise. Choose Purchase and it looks for buyers, which is slower and needs more volume to learn — but it is the thing you are actually paying for.',
        },
        {
          q: 'Why does a small budget produce unreliable results?',
          a: 'Conversion optimisation needs roughly fifty conversions a week before the platform’s model stops guessing. Below that the campaign never leaves its learning phase, results swing wildly, and you end up drawing confident conclusions from noise — usually the wrong ones, and usually against the creative that got unlucky first.',
        },
        {
          q: 'It asked me three things. How do I know that was the right three?',
          a: 'You check the brief afterwards for what it filled in without asking — which is the next step. The questions cover what it could not guess at all; the assumptions cover what it could guess plausibly. The second list is longer and more dangerous, which is why "it asked me questions" is not by itself proof of thoroughness.',
        },
      ],
    },
    {
      id: 'b4',
      title: 'Hunt the assumption',
      objective: 'Find the line it filled in for you that quietly changes what success means.',
      actionType: 'inspect',
      concept: 'assumption',
      why: 'Asked for a complete plan, it completed the plan. Eight lines are now decisions nobody made.',
      explanation:
        'Assumptions are not a defect — a model that refused to fill any blank would be useless. The skill is triage. Most assumptions are cheap to be wrong about; two or three are not, and they are rarely the ones that look important. Ask of each: if this is wrong, do I find out, and what does it cost me? A wrong creative format costs a week. A wrong measurement setting costs you the ability to know anything at all, because it changes the number you will judge everything else by.',
      hint: 'Open the Campaign brief and look at the Measurement group. One line there decides which purchases get counted as caused by this campaign.',
      successMessage: 'That is the one. A measurement setting, chosen by default, that silently rescales every result you will ever read.',
      learning: ['safety', 'dataAnalysis'],
      xp: 150,
      advance: 'manual',
      devices: {
        desktop: {
          instruction: 'Open the Campaign brief and open the Attribution window line.',
          target: [
            { id: 'brief-field-attribution', when: { screen: 'brief' }, caption: 'Open this line' },
            { id: 'nav-brief', caption: 'Open the Campaign brief' },
          ],
        },
        phone: {
          instruction: 'Open the Brief tab and open the Attribution window line.',
          target: [
            { id: 'brief-field-attribution', when: { screen: 'brief' }, caption: 'Open this line' },
            { id: 'tab-brief', caption: 'Open the Brief' },
          ],
        },
      },
      expect: { event: 'open-brief-field', where: { fieldId: 'attribution' } },
      allow: [
        { event: 'open-brief-field' },
        { event: 'open-screen', where: { screen: 'brief' } },
        { event: 'open-screen', where: { screen: 'chat' } },
        { event: 'open-screen', where: { screen: 'context' } },
      ],
      simulationResult: audienceBeats,
      teach: {
        kind: 'callout',
        title: 'Why this one and not the others',
        body: 'Attribution decides how long after seeing an ad a purchase still counts as caused by it. Widen it and this campaign "improves" while nothing changes in the real world. It is a measurement setting that looks technical and behaves like a business decision — the exact profile of an assumption worth catching.',
      },
      deepDive: [
        {
          q: 'How do I spot the dangerous assumptions quickly?',
          a: 'Three questions. Does it change how results are measured? Does it commit money? Is it hard to reverse once live? Anything answering yes to one of those gets read properly. Everything else can be corrected next week at the cost of a week.',
        },
        {
          q: 'Should I ask it to list its own assumptions?',
          a: 'Yes, and it is the single highest-yield follow-up there is: "list every assumption you made and mark the three where being wrong costs the most." You will get a better triage than most people do by hand, and it costs one message.',
        },
        {
          q: 'What does a 7-day click, 1-day view window actually mean?',
          a: 'A purchase counts if it happened within seven days of clicking the ad, or within one day of merely seeing it. View-through credit is the contentious half — it will claim purchases from people who scrolled past and bought later for unrelated reasons. It is the platform default because it flatters the platform.',
        },
      ],
    },
    {
      id: 'b5',
      title: 'Decide the audience from evidence',
      objective: 'Pick the audience the data supports — not the one with the prettiest number.',
      actionType: 'decide',
      concept: 'verification',
      why: 'The best cost per purchase on the page belongs to an audience that cannot absorb the budget. Efficiency and scale are different questions.',
      explanation:
        'This is where the unit economics you loaded earn their place. Broad interest is ruled out by arithmetic — $19.80 against an $11.90 breakeven loses money on every order, and more of it loses more. Retargeting is ruled out by reach: 11,000 people cannot take $50 a day for a month; it exhausts, frequency climbs, and the cost rises to meet everyone else. The lookalike is the only option that is both profitable and large enough to still be profitable next week.',
      hint: 'Compare each row against your $11.90 breakeven, then look at the reach figures in the note under the table. One audience is profitable and big enough to matter.',
      successMessage: 'Chosen on evidence, and defensible against both the cost column and the reach column.',
      learning: ['dataAnalysis', 'toolUse'],
      xp: 150,
      devices: {
        desktop: {
          instruction: 'Read the audience data, then answer the question in the conversation.',
          target: [
            { id: 'question-q-audience', when: { screen: 'chat' }, caption: 'Pick the audience' },
            { id: 'nav-chat', caption: 'Back to the conversation' },
          ],
        },
        phone: {
          instruction: 'Read the audience data, then answer the question in the conversation.',
          target: [
            { id: 'question-q-audience', when: { screen: 'chat' }, caption: 'Pick the audience' },
            { id: 'tab-chat', caption: 'Back to Chat' },
          ],
        },
      },
      expect: { event: 'answer-question', where: { questionId: 'q-audience', optionId: 'lal' } },
      allow: [{ event: 'inspect-tool-call' }, { event: 'open-brief-field' }, { event: 'open-screen', where: { screen: 'chat' } }],
      simulationResult: bidBeats,
      deepDive: [
        {
          q: 'So retargeting is bad?',
          a: 'No — it is excellent and it is small. Run it as its own campaign with a budget sized to its reach, and it will keep returning 6.2. The mistake is asking it to carry money it does not have the inventory to spend, which converts a great campaign into a mediocre one.',
        },
        {
          q: 'Why does exhausting an audience raise the cost?',
          a: 'A fixed pool of people sees the ad repeatedly. Frequency rises, the people most likely to buy have already bought, and you keep bidding for the ones who did not. The cost per purchase drifts upward for reasons that have nothing to do with the ad.',
        },
        {
          q: 'What is a 1% lookalike, actually?',
          a: 'The platform takes your purchaser list and finds the 1% of its users in a country most statistically similar to them. Quality depends entirely on the seed list — a lookalike of 4,100 real purchasers is worth far more than one built from page visitors, which is another reason the source of a number matters more than its size.',
        },
      ],
    },
    {
      id: 'b6',
      title: 'Set the money rules',
      objective: 'Turn your success metric into a rule the auction has to obey.',
      actionType: 'decide',
      concept: 'constraint',
      why: 'You already decided what a purchase may cost. Until that is expressed as a bid setting, it is a hope.',
      explanation:
        'A constraint that lives in your head is not a constraint. "Highest volume" is not the platform behaving badly — it is doing exactly what it was told, which was to maximise purchases with no ceiling on price. A cost cap encodes your margin as an instruction the system cannot cross. This is the same move as everything else in this mission: take the thing you know and put it where the machine can act on it.',
      hint: 'One of these puts a ceiling on what a purchase may cost you. Two of them sound like they do and do not.',
      successMessage: 'Your margin is now a rule rather than an intention.',
      learning: ['automation', 'safety'],
      xp: 140,
      devices: {
        desktop: {
          instruction: 'Answer the bid strategy question in the conversation.',
          target: [
            { id: 'question-q-bid', when: { screen: 'chat' }, caption: 'Choose the bid strategy' },
            { id: 'nav-chat', caption: 'Back to the conversation' },
          ],
        },
        phone: {
          instruction: 'Answer the bid strategy question in the conversation.',
          target: [
            { id: 'question-q-bid', when: { screen: 'chat' }, caption: 'Choose the bid strategy' },
            { id: 'tab-chat', caption: 'Back to Chat' },
          ],
        },
      },
      expect: { event: 'answer-question', where: { questionId: 'q-bid', optionId: 'cost-cap' } },
      allow: [{ event: 'open-brief-field' }, { event: 'inspect-tool-call' }, { event: 'open-screen', where: { screen: 'chat' } }],
      simulationResult: creativeBeats,
      deepDive: [
        {
          q: 'What is the real difference between a cost cap and a bid cap?',
          a: 'A cost cap targets the average cost of a result across the campaign — the number on your P&L. A bid cap limits what it offers in each individual auction, which is an input, not an outcome. Bid caps tend to under-deliver while still allowing an expensive average, so you get the worst of both.',
        },
        {
          q: 'Does a cost cap slow the campaign down?',
          a: 'Yes, and that is the trade. It will spend less than the full budget on days when purchases are only available above your cap. Under-spending on a profitable campaign is a much cheaper mistake than fully spending an unprofitable one.',
        },
        {
          q: 'Why $8.50 rather than $11.90?',
          a: 'Breakeven is where you make nothing. Setting the cap at breakeven means the best case is zero profit and every miss is a loss. $8.50 retains $3.40 per order as margin for error, seasonality, and the returns you have not counted yet.',
        },
      ],
    },
    {
      id: 'b7',
      title: 'Reject the draft that breaks a rule',
      objective: 'Read three options as claims your business is making, and strike the one you cannot back.',
      actionType: 'decide',
      concept: 'iteration',
      why: 'The most persuasive of the three contains a number nobody can substantiate. Fluency is not evidence.',
      explanation:
        'This is the habit that separates people who get burned from people who do not. Every factual claim in generated output should trace to something — a tool result, a document, a fact you supplied. The ones that cannot are exactly the ones that sound best, because nothing constrained them. Rejecting one option and saying why also teaches the model your standard for the rest of the session, which is far more efficient than writing a longer prompt at the start.',
      hint: 'Check each claim against what you actually know about the business. One of them states a number — and you know the real one.',
      successMessage: 'Struck. It was the strongest-sounding line and it was invented.',
      learning: ['safety', 'prompting'],
      xp: 170,
      advance: 'manual',
      devices: {
        desktop: {
          instruction: 'Review all three options. Keep the ones that are sound and flag the one that is not.',
          target: [
            { id: 'review-rev-copy', when: { screen: 'chat' }, caption: 'Judge each line on its merits' },
            { id: 'nav-chat', caption: 'Back to the conversation' },
          ],
        },
        phone: {
          instruction: 'Review all three options. Keep the ones that are sound and flag the one that is not.',
          target: [
            { id: 'review-rev-copy', when: { screen: 'chat' }, caption: 'Judge each line on its merits' },
            { id: 'tab-chat', caption: 'Back to Chat' },
          ],
        },
      },
      expect: { event: 'review-item', where: { itemId: 'v1', verdict: 'flag' } },
      allow: [
        { event: 'review-item', where: { itemId: 'v2', verdict: 'ok' } },
        { event: 'review-item', where: { itemId: 'v3', verdict: 'ok' } },
        { event: 'open-brief-field' },
        { event: 'open-screen', where: { screen: 'context' } },
        { event: 'open-screen', where: { screen: 'chat' } },
      ],
      simulationResult: trackingPromptBeats,
      teach: {
        kind: 'callout',
        title: 'Where invented numbers come from',
        body: 'Nothing in the request said "make up a customer count". The draft needed a social-proof hook, social-proof hooks contain numbers, and no constraint said otherwise. That is the shape of the failure: not deception, but a gap you left that got filled plausibly. Constraints stated up front close the gap before it is filled.',
      },
      deepDive: [
        {
          q: 'How do I stop this happening in the first place?',
          a: 'State the constraint before the draft: "every factual claim must come from the context I gave you; if you need a number I have not supplied, leave a blank and tell me." You will get blanks instead of inventions, which is the outcome you want.',
        },
        {
          q: 'Is rejecting one option really worth the time?',
          a: 'It is the highest-leverage message in the session. "Not that one — we have 4,100 customers and legal requires substantiation" sets a standard the model applies to everything afterwards. People who get excellent output are not better at prompting; they are more willing to send work back.',
        },
        {
          q: 'What if the flagged version genuinely performs best?',
          a: 'Then you have a legal and brand exposure that no click-through rate pays for, and the honest comparison is against the best claim you can actually support. Performance you cannot keep is not performance.',
        },
      ],
    },
    {
      id: 'b8',
      title: 'Make the result measurable',
      objective: 'Tag the destination link so your own analytics can credit this campaign.',
      actionType: 'type',
      concept: 'attribution',
      why: 'Untagged traffic lands in "direct" and disappears. You would be left grading the campaign on the platform’s own report of its own performance.',
      explanation:
        'UTM parameters are three or four key-value pairs on the end of your URL that let any analytics tool tell where a visitor came from. They are trivial to add and almost impossible to add retrospectively — the traffic that arrived untagged is simply gone. Source says which platform, medium says what kind of traffic, campaign says which campaign to credit. Everything else is optional refinement.',
      hint: 'Write the parameters as key=value pairs joined by &. You need at least utm_source, utm_medium and utm_campaign.',
      successMessage: 'Tagged. You can now answer "did it work?" from your own data.',
      learning: ['dataAnalysis', 'automation'],
      xp: 150,
      devices: {
        desktop: {
          instruction: 'Write the UTM parameters in the conversation and send them.',
          target: chatTarget('composer-input', 'Write the UTM parameters'),
        },
        phone: {
          instruction: 'Write the UTM parameters in the conversation and send them.',
          target: chatTargetPhone('composer-input', 'Write the UTM parameters'),
        },
      },
      expect: { event: 'send-message', evaluator: 'trackingPlan' },
      allow: [{ event: 'open-brief-field' }, { event: 'open-screen', where: { screen: 'chat' } }],
      simulationResult: namingBeats,
      weakResult: [
        { delay: 150, action: { type: 'BUSY', busy: true } },
        {
          delay: 900,
          action: {
            type: 'PUSH_MESSAGE',
            message: {
              id: 'cb-utm-weak',
              role: 'assistant',
              kind: 'text',
              text: 'Close. I need them as key=value pairs I can append to the URL — for example utm_source=meta&utm_medium=paid_social&utm_campaign=... Fill in the campaign name however you like.',
            },
          },
        },
        { delay: 1050, action: { type: 'BUSY', busy: false } },
      ],
      deepDive: [
        {
          q: 'Why not trust the platform’s own numbers?',
          a: 'Because every ad platform marks its own homework, and each uses an attribution model that flatters itself. Meta and Google will both claim the same purchase. Your own analytics, fed by UTMs, is the only place you can compare channels on one consistent basis.',
        },
        {
          q: 'What convention should the values follow?',
          a: 'Lowercase, no spaces, and identical across every campaign — utm_source=meta, utm_medium=paid_social. Analytics tools treat Meta and meta as two different sources, so half your traffic quietly splits in two and every total is wrong.',
        },
        {
          q: 'Is there anything beyond the three?',
          a: 'utm_content to tell creative variants apart, which is what makes your test readable in your own analytics rather than only inside the ad platform. utm_term matters mainly for paid search. Add utm_content here and the creative test becomes measurable in both places.',
        },
      ],
    },
    {
      id: 'b9',
      title: 'Name it for the version of you in six months',
      objective: 'Choose a name that can be sorted, filtered and compared later.',
      actionType: 'decide',
      concept: 'spec',
      why: 'Naming feels like bureaucracy until you are looking at forty campaigns and trying to answer a question you had not thought of yet.',
      explanation:
        'A good name is not readable prose; it is structured data pretending to be a string. Fixed positions for platform, objective, audience, creative and period mean you can filter to everything you ever ran against a lookalike, or compare video against static across a year, in seconds. This is the least glamorous line in the brief and the one that pays out longest.',
      hint: 'Pick the one that carries platform, objective, audience, creative and period in fixed positions — even though it is ugly.',
      successMessage: 'Ugly, and the only one you will be able to query.',
      learning: ['automation'],
      xp: 110,
      devices: {
        desktop: {
          instruction: 'Answer the naming question in the conversation.',
          target: [
            { id: 'question-q-naming', when: { screen: 'chat' }, caption: 'Choose a convention' },
            { id: 'nav-chat', caption: 'Back to the conversation' },
          ],
        },
        phone: {
          instruction: 'Answer the naming question in the conversation.',
          target: [
            { id: 'question-q-naming', when: { screen: 'chat' }, caption: 'Choose a convention' },
            { id: 'tab-chat', caption: 'Back to Chat' },
          ],
        },
      },
      expect: { event: 'answer-question', where: { questionId: 'q-naming', optionId: 'structured' } },
      allow: [{ event: 'open-brief-field' }, { event: 'open-screen', where: { screen: 'chat' } }],
      simulationResult: [
        { delay: 200, action: { type: 'BUSY', busy: true } },
        {
          delay: 900,
          action: {
            type: 'PUSH_MESSAGE',
            message: {
              id: 'cb-test',
              role: 'assistant',
              kind: 'text',
              text: 'Named. Two operational lines left. The first is the test: we have two creative options you approved, and I want to run both — but only if the result will actually tell us something. Your Guide has the question.',
            },
          },
        },
        { delay: 1050, action: { type: 'BUSY', busy: false } },
      ],
      deepDive: [
        {
          q: 'Is there a standard convention?',
          a: 'No universal one, and it matters far less than picking any convention and never deviating. The failure mode is not a suboptimal scheme; it is three schemes running at once because nobody wrote the first one down.',
        },
        {
          q: 'Can I get the assistant to enforce it?',
          a: 'Yes, and this is where it earns its keep: put the convention into workspace context and every campaign it drafts from then on is named correctly without being asked. Conventions are exactly the kind of tedium worth automating.',
        },
      ],
    },
    {
      id: 'b10',
      title: 'Design the test',
      objective: 'Make sure the result will be attributable to something.',
      actionType: 'quiz',
      concept: 'verification',
      why: 'A test that varies two things at once produces a number you cannot act on.',
      explanation:
        'You approved two creative options. Running both is right — but only if everything else is identical, so the difference in results has exactly one possible cause. Change the audience as well and a win tells you nothing: you will not know whether the video worked or the audience did, and you will confidently generalise the wrong lesson to your next four campaigns.',
      hint: 'You want to learn which creative works. So what must be identical between the two ad sets?',
      successMessage: 'One variable. Now the result means something.',
      learning: ['dataAnalysis'],
      xp: 130,
      devices: {
        desktop: {
          instruction: 'Answer the Guide’s question about the test.',
          target: [{ id: 'guide-quiz', caption: 'Answer here' }],
        },
        phone: {
          instruction: 'Answer the Guide’s question about the test.',
          target: [{ id: 'guide-quiz', caption: 'Answer here' }],
        },
      },
      expect: { event: 'quiz-answer' },
      quiz: {
        prompt: 'You want to know which creative performs better. What must be true of the two ad sets?',
        options: [
          {
            id: 't1',
            label: 'Different audiences too — it covers more ground',
            feedback: 'That covers more ground and learns nothing. If one wins you cannot tell whether it was the creative or the audience, and you will apply the wrong lesson next time.',
          },
          {
            id: 't2',
            label: 'Identical audience, budget and placements — only the creative differs',
            correct: true,
            feedback: 'Exactly. One variable, so the difference has one possible cause. That is the whole discipline: change one thing, or learn nothing.',
          },
          {
            id: 't3',
            label: 'Give the better-looking one more budget so it can prove itself',
            feedback: 'That guarantees the outcome you already expected. Unequal budgets mean unequal learning, and the "winner" is just the one you funded.',
          },
        ],
      },
      allow: [{ event: 'open-brief-field' }, { event: 'open-screen' }],
      simulationResult: autonomyBeats,
      deepDive: [
        {
          q: 'How long should the test run before I call it?',
          a: 'Until each ad set has enough conversions for the difference to be real — as a rule of thumb, around fifty each, and never during the first four days while the campaign is still in its learning phase. Most creative tests are called two days too early, on noise.',
        },
        {
          q: 'Can I not just ask the assistant which will win?',
          a: 'It can predict, from format, hook structure and your past results — and that is genuinely useful for deciding what to test. It cannot know. The reason to run the test is that the prediction is a hypothesis, and your audience is the only thing that settles it.',
        },
      ],
    },
    {
      id: 'b11',
      title: 'Draw the autonomy line',
      objective: 'Decide what the assistant may do at 3am without waking you.',
      actionType: 'decide',
      concept: 'autonomy',
      why: 'Both "ask me everything" and "do whatever you like" are wrong, and they are wrong in opposite directions.',
      explanation:
        'Draw the line by consequence direction rather than by difficulty. Actions that reduce exposure — pausing a campaign that breached its kill rule, flagging an anomaly, producing a report — can run alone, because the worst case is a little lost upside. Actions that increase exposure — raising budget, launching something new, sending to customers — stop at a human, because the worst case has no ceiling. Get this right and you have a system that is fast where speed is safe and slow where slowness is cheap.',
      hint: 'Ask which direction each action moves your risk. One option lets it reduce risk alone but never increase it.',
      successMessage: 'Asymmetric autonomy: it may hit the brakes alone, never the accelerator.',
      learning: ['safety', 'agents', 'automation'],
      xp: 160,
      advance: 'manual',
      devices: {
        desktop: {
          instruction: 'Answer the autonomy question in the conversation.',
          target: [
            { id: 'question-q-autonomy', when: { screen: 'chat' }, caption: 'Set the boundary' },
            { id: 'nav-chat', caption: 'Back to the conversation' },
          ],
        },
        phone: {
          instruction: 'Answer the autonomy question in the conversation.',
          target: [
            { id: 'question-q-autonomy', when: { screen: 'chat' }, caption: 'Set the boundary' },
            { id: 'tab-chat', caption: 'Back to Chat' },
          ],
        },
      },
      expect: { event: 'answer-question', where: { questionId: 'q-autonomy', optionId: 'asymmetric' } },
      allow: [{ event: 'open-brief-field' }, { event: 'open-screen', where: { screen: 'chat' } }],
      simulationResult: preflightBeats,
      teach: { kind: 'flow', nodes: ['Reduces risk → automatic', 'Increases risk → human', 'Irreversible → human, always'] },
      deepDive: [
        {
          q: 'Where does this break down?',
          a: 'When pausing is itself expensive — a campaign paused mid-flight during a launch window may not recover its delivery. The principle holds, but the threshold has to be set where a false positive costs less than a missed breach, which is why the kill rule here needs three days rather than one.',
        },
        {
          q: 'How is this different from just having permissions?',
          a: 'Permissions say what it is technically able to do. An autonomy boundary says what it should do without you, which is a narrower and more considered set. Most systems get the first right and never write down the second, so the real policy ends up being whatever the defaults were.',
        },
        {
          q: 'Does this apply outside advertising?',
          a: 'It is the general form. Drafting an email is reversible, sending it is not. Reading a database is reversible, writing to it is not. Every agent you will ever configure comes down to sorting its actions into those two piles and putting the checkpoint between them.',
        },
      ],
    },
    {
      id: 'b12',
      title: 'Pre-flight',
      objective: 'Verify every line against what is actually configured — one does not match.',
      actionType: 'decide',
      concept: 'verification',
      why: 'The assistant is checking its own work here. That is exactly the situation where a second pair of eyes pays for itself.',
      explanation:
        'A specification and a configuration are different objects, and the gap between them is where launches die. Read each line as two halves — what the brief says, and what is actually set — and confirm they agree. Six of these do. One is the most common launch defect there is: it will produce a campaign that reports beautifully while optimising for the wrong thing, and no dashboard will ever tell you, because it will be measuring the wrong event consistently.',
      hint: 'Read both halves of every line. One of them names a different event on the left and the right.',
      successMessage: 'Caught. That single line would have wasted the entire thirty days and looked fine doing it.',
      learning: ['safety', 'dataAnalysis'],
      xp: 200,
      advance: 'manual',
      devices: {
        desktop: {
          instruction: 'Verify each check. Mark the sound ones verified and flag the one that does not match.',
          target: [
            { id: 'review-rev-qa', when: { screen: 'chat' }, caption: 'Check every line' },
            { id: 'nav-chat', caption: 'Back to the conversation' },
          ],
        },
        phone: {
          instruction: 'Verify each check. Mark the sound ones verified and flag the one that does not match.',
          target: [
            { id: 'review-rev-qa', when: { screen: 'chat' }, caption: 'Check every line' },
            { id: 'tab-chat', caption: 'Back to Chat' },
          ],
        },
      },
      expect: { event: 'review-item', where: { itemId: 'qa-event', verdict: 'flag' } },
      allow: [
        { event: 'review-item', where: { itemId: 'qa-budget', verdict: 'ok' } },
        { event: 'review-item', where: { itemId: 'qa-audience', verdict: 'ok' } },
        { event: 'review-item', where: { itemId: 'qa-utm', verdict: 'ok' } },
        { event: 'review-item', where: { itemId: 'qa-naming', verdict: 'ok' } },
        { event: 'review-item', where: { itemId: 'qa-kill', verdict: 'ok' } },
        { event: 'review-item', where: { itemId: 'qa-claims', verdict: 'ok' } },
        { event: 'open-brief-field' },
        { event: 'open-screen', where: { screen: 'brief' } },
        { event: 'open-screen', where: { screen: 'chat' } },
      ],
      simulationResult: approvalBeats,
      deepDive: [
        {
          q: 'Why would the pixel be firing the wrong event at all?',
          a: 'Because it was installed for a different purpose months ago, or a developer renamed an event, or the checkout flow changed and nobody re-tested. It is almost never a deliberate decision — which is exactly why it survives until someone reads the line.',
        },
        {
          q: 'Can I get the assistant to run this check itself?',
          a: 'Yes, and you should — "compare every line of the brief against what is configured and show me only the mismatches" is a good instruction. Then read the output anyway. It is checking its own work, and the failure you most need to catch is the one it already failed to notice once.',
        },
        {
          q: 'What else belongs on a pre-flight list?',
          a: 'Landing page loads on mobile and matches the ad’s promise; the offer is actually live; stock exists; the kill rule is configured rather than merely written; billing will not decline mid-flight. Everything on that list has ended a campaign for someone.',
        },
      ],
    },
    {
      id: 'b13',
      title: 'Sign it',
      objective: 'Approve a specification where nothing is left assumed.',
      actionType: 'decide',
      concept: 'human-in-the-loop',
      why: 'Sixteen lines, all decided by you or derived from your data. This is what "ready" actually looks like.',
      explanation:
        'Compare this approval to the one at the end of the first mission. That was a reasonable decision made on a summary. This one is a decision made on a specification you interrogated line by line, with every assumption either confirmed or replaced by evidence. The difference is not care — it is that you built a thing that can be checked.',
      hint: 'Open the brief if you want a final read, then approve.',
      successMessage: 'Signed — and you could defend every line of it.',
      learning: ['safety'],
      xp: 140,
      devices: {
        desktop: {
          instruction: 'Approve the launch.',
          target: [
            { id: 'btn-approve', when: { screen: 'chat' }, caption: 'Approve the launch' },
            { id: 'nav-chat', caption: 'Back to the conversation' },
          ],
        },
        phone: {
          instruction: 'Approve the launch.',
          target: [
            { id: 'btn-approve', when: { screen: 'chat' }, caption: 'Approve the launch' },
            { id: 'tab-chat', caption: 'Back to Chat' },
          ],
        },
      },
      expect: { event: 'approval-decision', where: { decision: 'approve' } },
      allow: [
        { event: 'open-brief-field' },
        { event: 'open-screen', where: { screen: 'brief' } },
        { event: 'open-screen', where: { screen: 'chat' } },
      ],
      simulationResult: launchBeats,
    },
    {
      id: 'b14',
      title: 'Know when to kill it',
      objective: 'Read the monitoring plan — the part that decides whether any of this mattered.',
      actionType: 'observe',
      concept: 'autonomy',
      why: 'A campaign without a stopping rule is a standing order to spend money.',
      explanation:
        'The plan states what runs unattended, what needs you, and when the first honest read happens. Note the deliberate patience: days one to four are the learning phase, the numbers will look bad, and the kill rule needs three consecutive days precisely so nobody panics on day two and throws away a campaign that was working. Knowing when not to act is the same skill as knowing when to.',
      hint: 'Read the monitoring plan, then finish the mission.',
      successMessage: 'Mission complete.',
      learning: ['automation', 'safety'],
      xp: 90,
      devices: {
        desktop: {
          instruction: 'Read the launch result and the monitoring plan, then finish.',
          target: [{ id: 'tool-launch', caption: 'The simulated launch' }],
        },
        phone: {
          instruction: 'Read the launch result and the monitoring plan, then finish.',
          target: [{ id: 'tool-launch', caption: 'The simulated launch' }],
        },
      },
      expect: { event: 'acknowledge' },
      deepDive: [
        {
          q: 'What would I actually check on day 7?',
          a: 'Cost per purchase against your $8.50 cap and $11.90 breakeven, whether the campaign left the learning phase, which of the two creatives is ahead and by enough to call, and whether frequency is climbing. In that order — profitability first, because the rest only matters if the answer to the first is yes.',
        },
        {
          q: 'How do I turn this into something that runs weekly?',
          a: 'Everything you just did is a repeatable procedure: pull the data, compare against the brief, report exceptions, act only on the reducing-risk side of the line. That is the shape of an automation, and you now have the specification it would need — which was always the harder half.',
        },
      ],
    },
  ],
  outro: {
    headline: 'You did not get an answer. You built a specification.',
    lede: 'Sixteen decisions, every one either made by you or derived from your own data — and a launch defect caught before it cost you a month.',
    takeaways: [
      'Context is the highest-leverage thing you control — one fact about your margins made every downstream decision checkable.',
      'A model that asks before it assumes is doing its job. Invite the questions; they are a free audit of your own thinking.',
      'It will fill every blank you leave. Triage the assumptions by what being wrong costs, not by how important they look.',
      'Fluent output is not evidence. Every claim traces to a source, or it gets struck.',
      'Autonomy is drawn by consequence direction: it may reduce your exposure alone, never increase it.',
      'The finished test is whether a competent stranger could execute the plan without asking you a single question.',
    ],
  },
};
