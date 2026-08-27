import type { CampaignDraft, CampaignRow, Mission, ScenarioBeat } from '../../engine/types';

/* ------------------------------------------------------------------ */
/* Fictional data returned by the simulated Windsor.ai connector.      */
/* Nothing here touches a network. It is invented for teaching.        */
/* ------------------------------------------------------------------ */

export const CAMPAIGN_ROWS: CampaignRow[] = [
  { id: 'a', name: 'Campaign A · Retargeting — Broad', spend: '$4,180', ctr: '1.2%', cpa: '$14.20', roas: '1.8' },
  { id: 'b', name: 'Campaign B · Lookalike 1% — Video', spend: '$3,940', ctr: '2.7%', cpa: '$6.40', roas: '3.9', best: true },
  { id: 'c', name: 'Campaign C · Interest — Carousel', spend: '$2,610', ctr: '0.9%', cpa: '$19.80', roas: '1.2' },
];

export const CAMPAIGN_DRAFT: CampaignDraft = {
  name: 'Meta — Campaign B (Improved)',
  budget: '$50 / day',
  audience: 'Lookalike 1% — purchasers, last 180 days',
  creative: 'Video variation #2',
  objective: 'Conversions — Purchase',
  basedOn: 'Campaign B',
};

/* ------------------------------------------------------------------ */
/* Reusable scripted beats                                             */
/* ------------------------------------------------------------------ */

/** Claude reaches for the data tool and gets a result back. */
export const fetchDataBeats: ScenarioBeat[] = [
  { delay: 150, action: { type: 'BUSY', busy: true } },
  {
    delay: 750,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'sc-1',
        role: 'assistant',
        kind: 'text',
        text: "I don't have your campaign numbers in this conversation, so I'll pull them through the Windsor.ai connector first.",
      },
    },
  },
  {
    delay: 1350,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'tool-1',
        role: 'assistant',
        kind: 'tool',
        connectorId: 'windsor',
        tool: 'windsor.get_campaign_performance()',
        args: '{\n  "platform": "meta",\n  "date_range": "last_14_days",\n  "metrics": ["spend", "ctr", "cpa", "roas"]\n}',
        status: 'running',
      },
    },
  },
  {
    delay: 2900,
    action: {
      type: 'PATCH_MESSAGE',
      id: 'tool-1',
      patch: {
        status: 'done',
        result: { kind: 'campaigns', rows: CAMPAIGN_ROWS, note: '3 active campaigns · last 14 days · simulated data' },
      },
    },
  },
  { delay: 3050, action: { type: 'BUSY', busy: false } },
];

/** Claude reasons over the returned rows. */
export const analysisBeats: ScenarioBeat[] = [
  { delay: 250, action: { type: 'BUSY', busy: true } },
  {
    delay: 1300,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'sc-2',
        role: 'assistant',
        kind: 'text',
        text: 'Campaign B is your strongest performer, and it is not close. It returns 3.9x on spend at a $6.40 cost per action — under half what Campaign A costs you and a third of Campaign C. Its 2.7% click-through rate says the video creative and the 1% lookalike audience are matched well. Campaign C is the one to pause: it spends $2,610 to return 1.2x.',
        evidence: ['ROAS 3.9', 'CPA $6.40', 'CTR 2.7%'],
      },
    },
  },
  { delay: 1450, action: { type: 'BUSY', busy: false } },
];

/** Suggestion chips offering the next move. */
export const draftSuggestionBeats: ScenarioBeat[] = [
  {
    delay: 400,
    action: {
      type: 'SUGGESTIONS',
      suggestions: [
        {
          id: 'sg-draft',
          label: 'Prepare a new campaign based on Campaign B',
          text: 'Based on Campaign B, prepare a new campaign draft I can review.',
        },
        {
          id: 'sg-explain',
          label: 'Explain the ROAS gap',
          text: 'Why is the ROAS gap between Campaign B and C so large?',
        },
      ],
    },
  },
];

/** Analysis turns into a prepared action, which stops at an approval gate. */
export const draftBeats: ScenarioBeat[] = [
  { delay: 150, action: { type: 'BUSY', busy: true } },
  {
    delay: 800,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'sc-3',
        role: 'assistant',
        kind: 'text',
        text: "I'll reuse what is working in Campaign B — the 1% lookalike audience and the video creative — and prepare it as a draft. I will not publish anything without your approval.",
      },
    },
  },
  {
    delay: 1500,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'tool-2',
        role: 'assistant',
        kind: 'tool',
        connectorId: 'windsor',
        tool: 'windsor.create_campaign_draft()',
        args: '{\n  "based_on": "campaign_b",\n  "daily_budget": 50,\n  "objective": "conversions"\n}',
        status: 'running',
      },
    },
  },
  {
    delay: 2800,
    action: {
      type: 'PATCH_MESSAGE',
      id: 'tool-2',
      patch: { status: 'done', result: { kind: 'draft', draft: CAMPAIGN_DRAFT } },
    },
  },
  {
    delay: 3300,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'approval-1',
        role: 'assistant',
        kind: 'approval',
        title: 'Approval required — create campaign',
        summary: 'This action would spend budget. It needs a human decision before it runs.',
        draft: CAMPAIGN_DRAFT,
        status: 'pending',
      },
    },
  },
  { delay: 3450, action: { type: 'BUSY', busy: false } },
];

/** What happens if the learner rejects — a valid choice, not a failure. */
export const rejectBeats: ScenarioBeat[] = [
  { delay: 150, action: { type: 'BUSY', busy: true } },
  {
    delay: 900,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'sc-reject',
        role: 'assistant',
        kind: 'text',
        text: 'Understood — nothing was created and no budget was touched. That is exactly what the approval gate is for. I have kept the draft here; approve it when you are ready, or tell me what to change.',
      },
    },
  },
  {
    delay: 1500,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'approval-2',
        role: 'assistant',
        kind: 'approval',
        title: 'Approval required — create campaign',
        summary: 'Same draft, still waiting on you. Nothing runs until you approve.',
        draft: CAMPAIGN_DRAFT,
        status: 'pending',
      },
    },
  },
  { delay: 1650, action: { type: 'BUSY', busy: false } },
];

/** The approved action executes — inside the simulation only. */
export const executeBeats: ScenarioBeat[] = [
  { delay: 150, action: { type: 'BUSY', busy: true } },
  {
    delay: 800,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'tool-3',
        role: 'assistant',
        kind: 'tool',
        connectorId: 'windsor',
        tool: 'windsor.create_campaign()',
        args: '{\n  "draft_id": "dr_9f21",\n  "confirmed_by": "human",\n  "mode": "simulation"\n}',
        status: 'running',
      },
    },
  },
  {
    delay: 2200,
    action: {
      type: 'PATCH_MESSAGE',
      id: 'tool-3',
      patch: {
        status: 'done',
        result: { kind: 'created', draft: CAMPAIGN_DRAFT, reference: 'sim_cmp_0x7A31' },
      },
    },
  },
  {
    delay: 2700,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'sc-4',
        role: 'assistant',
        kind: 'text',
        text: 'Done — the campaign exists in this simulation only. In a real setup this is the moment the money starts moving, which is why you, and not I, made that call.',
      },
    },
  },
  {
    delay: 2900,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'sc-5',
        role: 'system',
        kind: 'notice',
        text: 'SIMULATION — no real campaign was created and no advertising account was contacted.',
      },
    },
  },
  { delay: 3050, action: { type: 'BUSY', busy: false } },
];

/* ------------------------------------------------------------------ */
/* Mission 01                                                          */
/* ------------------------------------------------------------------ */

export const metaAdsMission: Mission = {
  id: 'meta-ads',
  order: 1,
  title: 'Teach Claude to Analyze Meta Ads',
  premise: 'I want Claude to analyze my Meta Ads and tell me which campaign is performing best.',
  summary:
    'Give an AI model access to an outside service, get it to pull real numbers, reason over them, and prepare an action you approve.',
  goal: 'Connect a marketing-data connector, have Claude analyse the campaigns, and approve the action it prepares.',
  difficulty: 'Intermediate',
  minutes: '8–12 min',
  skills: ['connectors', 'toolUse', 'agents', 'dataAnalysis', 'safety', 'automation'],
  concepts: ['connector', 'tool', 'tool-use', 'grounding', 'agent', 'human-in-the-loop', 'workflow', 'mcp'],
  status: 'available',
  variant: 'lesson',
  challengeMissionId: 'meta-ads-challenge',
  steps: [
    {
      id: 's1',
      title: 'Open Connectors',
      objective: 'Find the place where outside services get attached to the assistant.',
      actionType: 'navigate',
      concept: 'connector',
      why: 'Claude has no access to your advertising account by default. Connectors are the screen where that access is granted.',
      explanation:
        'An AI model can only work with what is in front of it: the conversation, and any tool it has been given. It cannot reach into your ad account, your inbox or your database on its own — and that is a safety property, not a limitation. The Connectors screen is where you deliberately open one door at a time.',
      hint: 'Look for the place where outside services are managed. On desktop it lives in the left sidebar; on phone it is behind the + button.',
      successMessage: 'You opened Connectors — this is where Claude gets access to the outside world.',
      learning: ['connectors'],
      xp: 60,
      devices: {
        desktop: {
          instruction: 'Click Connectors in the left sidebar.',
          note: 'On desktop the sidebar keeps everything one click away.',
          target: [{ id: 'nav-connectors', caption: 'Click Connectors' }],
        },
        phone: {
          instruction: 'Tap the + button next to the message box, then choose Connectors.',
          note: 'On phone there is no sidebar, so the same options live behind the + button.',
          target: [
            { id: 'sheet-connectors', when: { sheet: 'plus' }, caption: 'Tap Connectors' },
            { id: 'phone-plus', caption: 'Tap +' },
          ],
        },
      },
      expect: { event: 'open-screen', where: { screen: 'connectors' } },
      allow: [{ event: 'open-sheet', where: { sheet: 'plus' } }],
    },
    {
      id: 's2',
      title: 'Pick the right connector',
      objective: 'Choose the service that can actually reach Meta Ads data.',
      actionType: 'click',
      concept: 'mcp',
      why: 'Each connector opens exactly one service. You need the one that speaks to advertising platforms — Windsor.ai.',
      explanation:
        'Windsor.ai sits between marketing platforms and other software: it pulls campaign data out of Meta, Google, TikTok and others and offers it through one consistent interface. That is the same job the Model Context Protocol does for AI apps generally — one standard plug, so any service that implements it can be used by any AI application. In this simulation Windsor.ai supplies fictional Meta Ads numbers.',
      hint: 'Open the connector catalogue, then find the one filed under "Marketing data".',
      successMessage: 'Windsor.ai it is — the bridge to advertising platforms.',
      learning: ['connectors', 'toolUse'],
      xp: 80,
      devices: {
        desktop: {
          instruction: 'Click Add connector, then choose Windsor.ai from the catalogue.',
          target: [
            { id: 'connector-card-windsor', when: { sheet: 'catalog' }, caption: 'Choose Windsor.ai' },
            { id: 'nav-connectors', when: { screen: 'connector-detail' }, caption: 'Not this one — go back' },
            { id: 'btn-add-connector', caption: 'Click Add connector' },
          ],
        },
        phone: {
          instruction: 'Tap Add connector, then choose Windsor.ai from the list.',
          target: [
            { id: 'connector-card-windsor', when: { sheet: 'catalog' }, caption: 'Tap Windsor.ai' },
            { id: 'tab-connectors', when: { screen: 'connector-detail' }, caption: 'Not this one — go back' },
            { id: 'btn-add-connector', caption: 'Tap Add connector' },
          ],
        },
      },
      expect: { event: 'select-connector', where: { id: 'windsor' } },
      allow: [{ event: 'open-sheet', where: { sheet: 'catalog' } }],
    },
    {
      id: 's3',
      title: 'Grant access',
      objective: 'Complete the connection and see exactly what Claude is allowed to do.',
      actionType: 'click',
      concept: 'permission',
      why: 'Connecting is a permission decision. Read the scopes before you agree to them — this is the moment you decide what the model may touch.',
      explanation:
        'A real connection runs an authorisation flow: the service asks who is asking, what they want to do, and gets your consent. Notice the two scopes here are not equal. Reading performance data is harmless and reversible. Preparing a campaign draft touches money — so it is granted with "approval required" attached. Narrow scopes are how you keep an agent useful and safe at the same time.',
      hint: 'Start the connection, then read the permission list and confirm it.',
      successMessage: 'Connected. Claude now has two Windsor.ai tools it is allowed to call.',
      learning: ['connectors', 'safety'],
      xp: 90,
      devices: {
        desktop: {
          instruction: 'Click Connect Windsor.ai, then authorise the two permissions.',
          target: [
            { id: 'btn-authorize', when: { sheet: 'auth' }, caption: 'Authorise access' },
            { id: 'btn-connect', caption: 'Connect Windsor.ai' },
          ],
        },
        phone: {
          instruction: 'Tap Connect Windsor.ai, then authorise the two permissions.',
          target: [
            { id: 'btn-authorize', when: { sheet: 'auth' }, caption: 'Authorise access' },
            { id: 'btn-connect', caption: 'Connect Windsor.ai' },
          ],
        },
      },
      expect: { event: 'authorize-connector', where: { id: 'windsor' } },
      allow: [{ event: 'connect-connector', where: { id: 'windsor' } }],
    },
    {
      id: 's4',
      title: 'Give Claude the job',
      objective: 'Write your own instruction — this one is not typed for you.',
      actionType: 'type',
      concept: 'grounding',
      why: 'A connector only creates the possibility. Nothing happens until you say what you actually want done.',
      explanation:
        'A good instruction carries three things: the task ("analyse", "compare", "rank"), the data ("my Meta Ads campaigns"), and what a good answer looks like ("which performs best, and why"). Vague instructions do not fail loudly — they quietly produce vague answers. Being specific is the single cheapest upgrade to any AI result.',
      hint: 'Go back to the conversation and ask Claude to analyse your Meta Ads campaign performance. Mention the data, and say what "best" means to you.',
      successMessage: 'Sent. You told Claude what to do and which data to do it with.',
      learning: ['prompting', 'dataAnalysis'],
      xp: 140,
      devices: {
        desktop: {
          instruction: 'Go back to the conversation and type your instruction to Claude, then send it.',
          target: [
            { id: 'composer-input', when: { screen: 'chat' }, caption: 'Type your instruction here' },
            { id: 'nav-chat', caption: 'Back to the conversation' },
          ],
        },
        phone: {
          instruction: 'Go back to the conversation and type your instruction to Claude, then send it.',
          target: [
            { id: 'composer-input', when: { screen: 'chat' }, caption: 'Type your instruction' },
            { id: 'tab-chat', caption: 'Back to Chat' },
          ],
        },
      },
      expect: { event: 'send-message', evaluator: 'analyzeCampaigns' },
      allow: [{ event: 'open-screen', where: { screen: 'chat' } }],
      simulationResult: fetchDataBeats,
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
              text: 'Happy to help — I want to make sure I look at the right thing. Which data should I use, and what would make one campaign better than another for you: cost per action, return on spend, click-through rate?',
            },
          },
        },
        { delay: 1050, action: { type: 'BUSY', busy: false } },
      ],
    },
    {
      id: 's5',
      title: 'Watch Claude use a tool',
      objective: 'Open the tool call and see where the numbers actually came from.',
      actionType: 'inspect',
      concept: 'tool-use',
      why: 'Claude is not reaching into Meta by magic. It asked for a tool, the tool returned data, and that data is now in the conversation.',
      explanation:
        'Read the loop in order. Claude decided it needed facts it did not have. It requested windsor.get_campaign_performance() with specific arguments. Your application ran that call — the model never runs anything itself — and handed back a result. Only now can Claude say anything true about your account. Every number in the answer that follows traces back to this block, which is why being able to open and read it matters.',
      hint: 'The block labelled TOOL CALL in the conversation can be opened. Click it.',
      successMessage: 'That block is the whole trick: a request, a result, and a paper trail.',
      learning: ['toolUse', 'agents'],
      xp: 110,
      advance: 'manual',
      devices: {
        desktop: {
          instruction: 'Click the windsor.get_campaign_performance() block to inspect the call and its result.',
          target: [{ id: 'tool-1', caption: 'Open the tool call' }],
        },
        phone: {
          instruction: 'Tap the windsor.get_campaign_performance() block to inspect the call and its result.',
          target: [{ id: 'tool-1', caption: 'Open the tool call' }],
        },
      },
      expect: { event: 'inspect-tool-call', where: { id: 'tool-1' } },
      simulationResult: analysisBeats,
      teach: {
        kind: 'callout',
        title: 'This is the part people get wrong',
        body: 'The model did not "look up" your ads. It emitted a request, your app executed it, and the result was fed back in. Model, tool and data stay separate — that separation is what makes the whole thing inspectable and safe.',
      },
    },
    {
      id: 's6',
      title: 'Read the analysis',
      objective: 'Check that you can defend the conclusion from the data.',
      actionType: 'quiz',
      concept: 'grounding',
      why: 'An answer built on retrieved data can be checked. Look at the numbers and confirm the reasoning holds.',
      explanation:
        'Ask a model "which of my campaigns is best?" with no tools and it will tell you what to look at in general. Ask it with a tool attached to your data and it tells you about your account, with evidence you can verify. Same model, same question — the difference is Goal + Tool + Data.',
      hint: 'Compare the ROAS and CPA columns in the tool result. Which campaign returns most per pound spent, and at the lowest cost per action?',
      successMessage: 'Right — and you can point at the exact rows that prove it.',
      learning: ['dataAnalysis', 'prompting'],
      xp: 120,
      devices: {
        desktop: {
          instruction: "Answer the Guide's question using the numbers in the tool result.",
          target: [{ id: 'tool-1', caption: 'The evidence is in the tool result' }],
        },
        phone: {
          instruction: "Answer the Guide's question using the numbers in the tool result.",
          target: [{ id: 'tool-1', caption: 'The evidence is in the tool result' }],
        },
      },
      expect: { event: 'quiz-answer' },
      quiz: {
        prompt: 'Claude picked Campaign B. What in the data justifies that?',
        options: [
          {
            id: 'q1',
            label: 'It spent the most money',
            feedback: 'No — Campaign A spent more ($4,180) and returned far less. Spend is not performance.',
          },
          {
            id: 'q2',
            label: 'Highest ROAS (3.9) at the lowest CPA ($6.40)',
            correct: true,
            feedback: 'Exactly. It returns most per pound spent and acquires each customer most cheaply — those two together are the case.',
          },
          {
            id: 'q3',
            label: 'Claude knows Meta Ads best practice',
            feedback: 'General knowledge did not decide this. The tool result did — that is the difference a connector makes.',
          },
        ],
      },
      simulationResult: draftSuggestionBeats,
    },
    {
      id: 's7',
      title: 'Move from analysis to action',
      objective: 'Ask Claude to prepare something, not just report something.',
      actionType: 'click',
      concept: 'agent',
      why: 'This is the line between a chatbot and an agent: one tells you things, the other prepares work in the world.',
      explanation:
        'Claude now chooses a second tool on its own — create_campaign_draft() — because the goal implies it. You did not name the tool. That is what makes it agentic: you give an objective, it works out the sequence. Notice it stops at "draft" rather than "live". A well-built agent knows which of its own steps need a signature.',
      hint: 'Claude has offered follow-up actions under the conversation. Pick the one that prepares a new campaign.',
      successMessage: 'Claude picked its own next tool to reach the goal you set.',
      learning: ['agents', 'automation'],
      xp: 110,
      advance: 'manual',
      devices: {
        desktop: {
          instruction: 'Click the suggestion "Prepare a new campaign based on Campaign B".',
          target: [{ id: 'suggestion-sg-draft', caption: 'Ask for the draft' }],
        },
        phone: {
          instruction: 'Tap the suggestion "Prepare a new campaign based on Campaign B".',
          target: [{ id: 'suggestion-sg-draft', caption: 'Ask for the draft' }],
        },
      },
      expect: { event: 'use-suggestion', where: { id: 'sg-draft' } },
      simulationResult: draftBeats,
      teach: { kind: 'flow', nodes: ['Data', 'Analysis', 'Decision', 'Action'] },
    },
    {
      id: 's8',
      title: 'Approve or reject',
      objective: 'Make the call a human is supposed to make.',
      actionType: 'decide',
      concept: 'human-in-the-loop',
      why: 'Reading data is reversible. Spending money is not. Actions that cross that line stop and ask.',
      explanation:
        'This pause is a design decision, not a limitation of the model. When you build an agent you choose which actions it may take alone and which need a signature — and you draw that line by consequence, not by difficulty. Rejecting here is a perfectly good answer: try it and see what Claude does before you approve.',
      hint: 'Read the draft, then decide. Both buttons are real — rejecting is a valid choice and Claude will handle it.',
      successMessage: 'Approved. You made the decision, Claude did the work.',
      learning: ['safety', 'agents'],
      xp: 140,
      devices: {
        desktop: {
          instruction: 'Review the prepared campaign, then choose Approve (or reject it first and see what happens).',
          target: [{ id: 'btn-approve', caption: 'Approve the action' }],
        },
        phone: {
          instruction: 'Review the prepared campaign, then tap Approve (or reject it first and see what happens).',
          target: [{ id: 'btn-approve', caption: 'Approve the action' }],
        },
      },
      expect: { event: 'approval-decision', where: { decision: 'approve' } },
      allow: [{ event: 'approval-decision', where: { decision: 'reject' }, then: rejectBeats }],
      simulationResult: executeBeats,
    },
    {
      id: 's9',
      title: 'Read the receipt',
      objective: 'Close the loop and name what you just built.',
      actionType: 'observe',
      concept: 'workflow',
      why: 'You just built a complete AI workflow: data in, reasoning, a decision, an action, and a human checkpoint.',
      explanation:
        'Every useful AI system you will meet is a variation on this shape. Change the connector and the same nine steps become "summarise my inbox", "audit my database", "draft replies to my customers". The skill you just practised is not Meta Ads — it is recognising the shape and knowing where to put the checkpoint.',
      hint: 'Look over the summary, then finish the mission.',
      successMessage: 'Mission complete.',
      learning: ['automation', 'agents'],
      xp: 60,
      devices: {
        desktop: {
          instruction: 'Read the simulated result, then finish the mission.',
          target: [{ id: 'tool-3', caption: 'The simulated result' }],
        },
        phone: {
          instruction: 'Read the simulated result, then finish the mission.',
          target: [{ id: 'tool-3', caption: 'The simulated result' }],
        },
      },
      expect: { event: 'acknowledge' },
    },
  ],
  outro: {
    headline: 'You just ran a complete agent workflow.',
    takeaways: [
      'A connector is how an AI application reaches a service it otherwise cannot see.',
      'A tool call is a request the model makes and your app executes — the model never runs it itself.',
      'Answers built on tool results can be checked; answers built on memory cannot.',
      'An agent chooses its own next tool once you give it a goal.',
      'Actions with consequences stop at a human. You decide where that line sits.',
    ],
  },
};
