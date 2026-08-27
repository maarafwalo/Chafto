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


/** Claude decides it needs a tool, and the client asks you before running it. */
export const permissionBeats: ScenarioBeat[] = [
  { delay: 150, action: { type: 'BUSY', busy: true } },
  {
    delay: 800,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'sc-1',
        role: 'assistant',
        kind: 'text',
        text: "I don't have your campaign numbers in this conversation, so I'll pull them through the Windsor.ai connector.",
      },
    },
  },
  {
    delay: 1500,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'perm-1',
        role: 'assistant',
        kind: 'permission',
        connectorId: 'windsor',
        tool: 'windsor.get_campaign_performance()',
        summary:
          'Reads spend, click-through rate, cost per action and return on ad spend for your Meta campaigns. Read-only — it changes nothing.',
        decision: 'pending',
      },
    },
  },
  { delay: 1650, action: { type: 'BUSY', busy: false } },
];

/** The tool actually runs, and returns data. */
export const fetchDataBeats: ScenarioBeat[] = [
  { delay: 150, action: { type: 'BUSY', busy: true } },
  {
    delay: 700,
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
    delay: 2200,
    action: {
      type: 'PATCH_MESSAGE',
      id: 'tool-1',
      patch: {
        status: 'done',
        result: { kind: 'campaigns', rows: CAMPAIGN_ROWS, note: '3 active campaigns · last 14 days · simulated data' },
      },
    },
  },
  { delay: 2350, action: { type: 'BUSY', busy: false } },
];

/** Declining is a real option, and the assistant handles it. */
export const denyBeats: ScenarioBeat[] = [
  { delay: 150, action: { type: 'BUSY', busy: true } },
  {
    delay: 900,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'sc-deny',
        role: 'assistant',
        kind: 'text',
        text: 'Understood — I have not run it. Without that tool I can only talk about Meta Ads in general, not about your account. Allow it when you are ready and I will pull the real numbers.',
      },
    },
  },
  {
    delay: 1500,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'perm-2',
        role: 'assistant',
        kind: 'permission',
        connectorId: 'windsor',
        tool: 'windsor.get_campaign_performance()',
        summary: 'Same request, still waiting on you. Read-only — it changes nothing.',
        decision: 'pending',
      },
    },
  },
  { delay: 1650, action: { type: 'BUSY', busy: false } },
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
        { id: 'sg-explain', label: 'Explain the ROAS gap', text: 'Why is the ROAS gap between Campaign B and C so large?' },
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

/** Back-to-the-conversation fallbacks, per device. */
const toChat = (id: string, caption: string) => [
  { id, when: { screen: 'chat' as const }, caption },
  { id: 'chat-chat-1', caption: 'Back to the conversation' },
];
const toChatPhone = (id: string, caption: string) => [
  { id, when: { screen: 'chat' as const }, caption },
  { id: 'phone-new-chat', caption: 'Back to the conversation' },
];

export const metaAdsMission: Mission = {
  id: 'meta-ads',
  order: 1,
  title: 'Teach Claude to Analyze Meta Ads',
  premise: 'I want Claude to analyze my Meta Ads and tell me which campaign is performing best.',
  summary:
    'Give Claude access to an outside service the way you actually do it — Settings, the directory, the per-chat switch — then get it to pull real numbers, reason over them, and prepare an action you approve.',
  goal: 'Add a connector, switch it on for the conversation, get a grounded analysis, and approve the action Claude prepares.',
  difficulty: 'Intermediate',
  minutes: '10–15 min',
  skills: ['connectors', 'toolUse', 'agents', 'dataAnalysis', 'safety', 'automation'],
  concepts: ['connector', 'tool', 'tool-use', 'grounding', 'agent', 'human-in-the-loop', 'workflow', 'mcp', 'permission'],
  status: 'available',
  variant: 'lesson',
  challengeMissionId: 'meta-ads-challenge',
  steps: [
    {
      id: 's1',
      title: 'Find where tools are switched on',
      objective: 'Open the menu that controls what Claude may use in this conversation.',
      actionType: 'click',
      concept: 'connector',
      why: 'Claude has no access to your advertising account by default. Everything it may use in a chat is listed in one menu — and right now that menu is empty.',
      explanation:
        'A model can only work with what is in front of it: the conversation, and any tool it has been given. It cannot reach into your ad account, your inbox or your database on its own — and that is a safety property, not a limitation. Search and tools is where you see exactly what this conversation has been granted.',
      hint: 'It is in the row of buttons underneath the message box, next to the + .',
      successMessage: 'That is the whole list of what Claude can reach right now. It is empty.',
      realWorld: 'In Claude: the Search and tools button at the bottom left of the message box (or type “/”).',
      learning: ['connectors'],
      xp: 60,
      devices: {
        desktop: {
          instruction: 'Click Search and tools under the message box.',
          target: [{ id: 'composer-tools', caption: 'Open Search and tools' }],
        },
        phone: {
          instruction: 'Tap the tools button under the message box.',
          note: 'On phone the button shows just the icon — the menu is identical.',
          target: [{ id: 'composer-tools', caption: 'Open Search and tools' }],
        },
      },
      expect: { event: 'open-menu', where: { menu: 'tools' } },
      allow: [{ event: 'open-menu', where: { menu: 'plus' } }],
      deepDive: [
        {
          q: 'What is the difference between this menu and Settings?',
          a: 'This menu is scoped to the conversation you are in. Settings is your whole account. A connector added in Settings appears here as a switch — available, but off until you turn it on for a given chat.',
        },
        {
          q: 'What else lives in here?',
          a: 'Web search, extended thinking and research toggles. All three change what Claude does with your next message, and all three are per-conversation, which is why they sit next to the message box rather than three menus deep.',
        },
      ],
    },
    {
      id: 's2',
      title: 'Open the connector directory',
      objective: 'Get to the place where new connectors are added to your account.',
      actionType: 'navigate',
      concept: 'mcp',
      why: 'The switch you want does not exist yet. Connectors are added at the account level first, in Settings.',
      explanation:
        'This split is worth understanding because it trips people up constantly. Adding a connector is an account-level act: you authorise Claude to reach a service. Switching it on is a conversation-level act: you decide this particular chat may use it. Two different decisions, two different places, and skipping the second is the single most common reason someone says "I connected it but Claude says it cannot see my data".',
      hint: 'The tools menu has a link at the bottom for adding new connectors. From there, look for the browse button.',
      successMessage: 'This is the directory — every service Claude can be connected to.',
      realWorld: 'In Claude: Settings → Connectors → Browse connectors. You can also reach it from “Add connectors” in the tools menu.',
      learning: ['connectors'],
      xp: 80,
      devices: {
        desktop: {
          instruction: 'Click Add connectors, then Browse connectors on the Settings page.',
          target: [
            { id: 'menu-add-connectors', when: { sheet: 'tools' }, caption: 'Add connectors' },
            { id: 'btn-browse-connectors', when: { screen: 'settings' }, caption: 'Browse connectors' },
            { id: 'composer-tools', caption: 'Open Search and tools' },
          ],
        },
        phone: {
          instruction: 'Tap Add connectors, then Browse connectors on the Settings page.',
          target: [
            { id: 'menu-add-connectors', when: { sheet: 'tools' }, caption: 'Add connectors' },
            { id: 'btn-browse-connectors', when: { screen: 'settings' }, caption: 'Browse connectors' },
            { id: 'composer-tools', caption: 'Open the tools menu' },
          ],
        },
      },
      expect: { event: 'open-menu', where: { menu: 'directory' } },
      allow: [
        { event: 'open-settings' },
        { event: 'open-menu', where: { menu: 'tools' } },
        { event: 'open-screen' },
      ],
      deepDive: [
        {
          q: 'Can I connect something that is not in the directory?',
          a: 'Yes — Claude supports custom connectors over MCP, where you point it at a server URL. The directory is the curated set; MCP is the open standard underneath that lets anything implement the same plug shape.',
        },
        {
          q: 'Does connecting a service give Claude everything in it?',
          a: 'No. Each connector declares a specific set of tools and scopes, and you see them before you authorise. Reading your ad performance and changing your ad spend are separate permissions even within one connector.',
        },
      ],
    },
    {
      id: 's3',
      title: 'Pick the right connector',
      objective: 'Choose the service that can actually reach Meta Ads data.',
      actionType: 'click',
      concept: 'tool',
      why: 'Each connector opens exactly one service. You need the one that speaks to advertising platforms.',
      explanation:
        'Windsor.ai sits between marketing platforms and other software: it pulls campaign data out of Meta, Google, TikTok and others and offers it through one consistent interface. Each connector arrives with a declared list of tools — named functions with inputs and outputs. That list is the real contract, and it is worth reading before you agree to it.',
      hint: 'Look for the one filed under "Marketing data".',
      successMessage: 'Windsor.ai — the bridge to advertising platforms.',
      realWorld: 'In Claude: pick a connector in the directory and it opens its page, showing the tools and permissions it wants.',
      learning: ['connectors', 'toolUse'],
      xp: 80,
      devices: {
        desktop: {
          instruction: 'Click Connect on Windsor.ai in the directory.',
          target: [{ id: 'connector-card-windsor', caption: 'Choose Windsor.ai' }],
        },
        phone: {
          instruction: 'Tap Connect on Windsor.ai in the directory.',
          target: [{ id: 'connector-card-windsor', caption: 'Choose Windsor.ai' }],
        },
      },
      expect: { event: 'select-connector', where: { id: 'windsor' } },
      allow: [{ event: 'open-menu', where: { menu: 'directory' } }],
    },
    {
      id: 's4',
      title: 'Read the scopes and allow access',
      objective: 'Complete the connection, having read what you are agreeing to.',
      actionType: 'click',
      concept: 'permission',
      why: 'Connecting is a permission decision. This is the moment you decide what Claude may touch.',
      explanation:
        'A real connection runs an authorisation flow: the service asks who is asking, what they want to do, and gets your consent. Notice the two scopes here are not equal. Reading performance data is harmless and reversible. Preparing a campaign draft touches money — so it is granted with "approval required" attached. Narrow scopes are how you keep an assistant useful and safe at the same time.',
      hint: 'Start the connection on the connector page, then read the permission list and allow it.',
      successMessage: 'Added to your account. Note what the confirmation said — added, not enabled.',
      realWorld: 'In Claude: an OAuth window opens and you approve the scopes, exactly as with any other app you connect.',
      learning: ['connectors', 'safety'],
      xp: 90,
      devices: {
        desktop: {
          instruction: 'Click Connect Windsor.ai, then Allow access.',
          target: [
            { id: 'btn-authorize', when: { sheet: 'auth' }, caption: 'Allow access' },
            { id: 'btn-connect', caption: 'Connect Windsor.ai' },
          ],
        },
        phone: {
          instruction: 'Tap Connect Windsor.ai, then Allow access.',
          target: [
            { id: 'btn-authorize', when: { sheet: 'auth' }, caption: 'Allow access' },
            { id: 'btn-connect', caption: 'Connect Windsor.ai' },
          ],
        },
      },
      expect: { event: 'authorize-connector', where: { id: 'windsor' } },
      allow: [{ event: 'connect-connector', where: { id: 'windsor' } }],
    },
    {
      id: 's5',
      title: 'Switch it on for this conversation',
      objective: 'Do the half of the job that adding a connector does not do for you.',
      actionType: 'click',
      concept: 'permission',
      why: 'A connector on your account is available everywhere and active nowhere. Each conversation decides for itself.',
      explanation:
        'This is the step people miss, and the symptom is confusing: Claude says it cannot see your data even though you definitely connected it. The design is deliberate — you rarely want every tool live in every conversation, and a chat with six connectors switched on is both slower and easier to misfire. Turn on what this piece of work needs, and nothing else.',
      hint: 'Go back to the conversation, open Search and tools again, and turn Windsor.ai on.',
      successMessage: 'Now it is actually available here. Two separate acts, two separate places.',
      realWorld: 'In Claude: + or Search and tools in the composer → toggle the connector on for this chat.',
      learning: ['connectors', 'safety'],
      xp: 130,
      advance: 'manual',
      devices: {
        desktop: {
          instruction: 'Return to the chat, open Search and tools, and toggle Windsor.ai on.',
          target: [
            { id: 'chat-connector-windsor', when: { sheet: 'tools' }, caption: 'Turn it on for this chat' },
            { id: 'composer-tools', when: { screen: 'chat' }, caption: 'Open Search and tools' },
            { id: 'chat-chat-1', caption: 'Back to the conversation' },
          ],
        },
        phone: {
          instruction: 'Return to the chat, open the tools menu, and toggle Windsor.ai on.',
          target: [
            { id: 'chat-connector-windsor', when: { sheet: 'tools' }, caption: 'Turn it on for this chat' },
            { id: 'composer-tools', when: { screen: 'chat' }, caption: 'Open the tools menu' },
            { id: 'phone-menu', caption: 'Open the menu' },
          ],
        },
      },
      expect: { event: 'toggle-chat-connector', where: { id: 'windsor', on: true } },
      allow: [
        { event: 'open-screen' },
        { event: 'open-settings' },
        { event: 'open-menu' },
        { event: 'select-connector' },
      ],
      teach: {
        kind: 'callout',
        title: 'The most common “it doesn’t work”',
        body: 'Added to the account ≠ enabled in the chat. When someone says a connector is broken, this is the first thing to check — and it takes one click to rule out.',
      },
      deepDive: [
        {
          q: 'Why not just have it on everywhere by default?',
          a: 'Every enabled tool is described to the model on every message, which costs context and adds ways to go wrong. It also widens the blast radius: a tool that can write to your CRM should not be sitting live in a chat about holiday planning.',
        },
        {
          q: 'Does this reset for each new chat?',
          a: 'Yes — a new conversation starts clean. If you use a connector constantly, keeping the work inside a project is the usual answer, so the setup travels with the project rather than being redone each time.',
        },
      ],
    },
    {
      id: 's6',
      title: 'Give Claude the job',
      objective: 'Write your own instruction — this one is not typed for you.',
      actionType: 'type',
      concept: 'grounding',
      why: 'A connector only creates the possibility. Nothing happens until you say what you want done.',
      explanation:
        'A good instruction carries three things: the task ("analyse", "compare", "rank"), the data ("my Meta Ads campaigns"), and what a good answer looks like ("which performs best, and why"). Vague instructions do not fail loudly — they quietly produce vague answers. Being specific is the single cheapest upgrade to any AI result.',
      hint: 'Ask Claude to analyse your Meta Ads campaign performance. Mention the data, and say what "best" means to you.',
      successMessage: 'Sent. You told Claude what to do and which data to do it with.',
      realWorld: 'In Claude: type it in the message box. Enter sends, Shift+Enter starts a new line.',
      learning: ['prompting', 'dataAnalysis'],
      xp: 140,
      devices: {
        desktop: {
          instruction: 'Type your instruction to Claude and send it.',
          target: toChat('composer-input', 'Type your instruction here'),
        },
        phone: {
          instruction: 'Type your instruction to Claude and send it.',
          target: toChatPhone('composer-input', 'Type your instruction'),
        },
      },
      expect: { event: 'send-message', evaluator: 'analyzeCampaigns' },
      allow: [{ event: 'open-screen' }, { event: 'open-menu' }],
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
              text: 'Happy to help — I want to make sure I look at the right thing. Which data should I use, and what would make one campaign better than another for you: cost per action, return on spend, click-through rate?',
            },
          },
        },
        { delay: 1050, action: { type: 'BUSY', busy: false } },
      ],
    },
    {
      id: 's7',
      title: 'Answer the permission prompt',
      objective: 'Decide whether the tool Claude picked may actually run.',
      actionType: 'decide',
      concept: 'human-in-the-loop',
      why: 'Claude does not run tools. It asks, and something on your side executes — which means there is a point where you can say no.',
      explanation:
        'Read the three buttons carefully, because they are a real decision. Allow once is the right default for anything unfamiliar. Always allow is convenient and permanent for this conversation — fine for a read-only tool, worth hesitating over for anything that writes. Decline is a genuine option: Claude carries on without the data rather than failing. This prompt is the seam between the model and the world, and it is entirely yours.',
      hint: 'The prompt is in the conversation. Allow once is the safe choice for a read-only tool you have not used before.',
      successMessage: 'Allowed — and only for this one call, which is the right instinct.',
      realWorld: 'In Claude Desktop and Cowork, connector and MCP tool calls surface exactly this prompt: Allow once, Always allow, or decline.',
      learning: ['safety', 'toolUse'],
      xp: 120,
      advance: 'manual',
      devices: {
        desktop: {
          instruction: 'Read the tool request, then choose Allow once.',
          target: [{ id: 'perm-once', caption: 'Allow once' }],
        },
        phone: {
          instruction: 'Read the tool request, then tap Allow once.',
          target: [{ id: 'perm-once', caption: 'Allow once' }],
        },
      },
      expect: { event: 'permission-decision', where: { decision: 'once' } },
      allow: [
        { event: 'permission-decision', where: { decision: 'always' } },
        { event: 'permission-decision', where: { decision: 'deny' }, then: denyBeats },
        { event: 'open-menu' },
      ],
      simulationResult: fetchDataBeats,
      deepDive: [
        {
          q: 'When is “Always allow” the wrong choice?',
          a: 'Whenever the tool can change something. Read-only lookups are cheap to auto-approve; anything that sends, writes, deletes or spends should keep asking, because the cost of one bad call is not symmetric with the convenience of not being asked.',
        },
        {
          q: 'What exactly is Claude sending?',
          a: 'A structured request: the tool name plus arguments it composed from your instruction. It never executes anything itself — your client does, and hands the result back. You are about to see that request in full.',
        },
      ],
    },
    {
      id: 's8',
      title: 'Read the tool call',
      objective: 'Open the call and see where the numbers actually came from.',
      actionType: 'inspect',
      concept: 'tool-use',
      why: 'Claude is not reaching into Meta by magic. It asked for a tool, the tool returned data, and that data is now in the conversation.',
      explanation:
        'Read the loop in order. Claude decided it needed facts it did not have. It requested windsor.get_campaign_performance() with specific arguments. Your application ran that call — the model never runs anything itself — and handed back a result. Only now can Claude say anything true about your account. Every number in the answer that follows traces back to this block, which is why being able to open and read it matters.',
      hint: 'The block labelled TOOL CALL can be opened. Click it.',
      successMessage: 'That block is the whole trick: a request, a result, and a paper trail.',
      realWorld: 'In Claude: tool and search results appear as collapsible rows in the conversation — click to expand and read them.',
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
      id: 's9',
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
          { id: 'q1', label: 'It spent the most money', feedback: 'No — Campaign A spent more ($4,180) and returned far less. Spend is not performance.' },
          {
            id: 'q2',
            label: 'Highest ROAS (3.9) at the lowest CPA ($6.40)',
            correct: true,
            feedback: 'Exactly. It returns most per pound spent and acquires each customer most cheaply — those two together are the case.',
          },
          { id: 'q3', label: 'Claude knows Meta Ads best practice', feedback: 'General knowledge did not decide this. The tool result did — that is the difference a connector makes.' },
        ],
      },
      simulationResult: draftSuggestionBeats,
    },
    {
      id: 's10',
      title: 'Move from analysis to action',
      objective: 'Ask Claude to prepare something, not just report something.',
      actionType: 'click',
      concept: 'agent',
      why: 'This is the line between a chatbot and an agent: one tells you things, the other prepares work in the world.',
      explanation:
        'Claude now chooses a second tool on its own — create_campaign_draft() — because the goal implies it. You did not name the tool. That is what makes it agentic: you give an objective, it works out the sequence. Notice it stops at "draft" rather than "live". A well-built agent knows which of its own steps need a signature.',
      hint: 'Claude has offered follow-up actions under the conversation. Pick the one that prepares a new campaign.',
      successMessage: 'Claude picked its own next tool to reach the goal you set.',
      realWorld: 'In Claude: suggested follow-ups appear above the message box after a substantial answer.',
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
      id: 's11',
      title: 'Approve or reject',
      objective: 'Make the call a human is supposed to make.',
      actionType: 'decide',
      concept: 'human-in-the-loop',
      why: 'Reading data is reversible. Spending money is not. Actions that cross that line stop and ask.',
      explanation:
        'Note that this is a different gate from the permission prompt earlier. That one asked whether a tool may run at all. This one asks whether a specific prepared action should happen — the model has done the work and is holding it at the boundary. When you build agents you choose where that boundary sits, and you draw it by consequence, not by difficulty.',
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
      id: 's12',
      title: 'Read the receipt',
      objective: 'Close the loop and name what you just built.',
      actionType: 'observe',
      concept: 'workflow',
      why: 'You just built a complete AI workflow: access, permission, data, reasoning, a decision, an action, and a human checkpoint.',
      explanation:
        'Every useful AI system you will meet is a variation on this shape. Change the connector and the same steps become "summarise my inbox", "audit my database", "draft replies to my customers". The skill you just practised is not Meta Ads — it is recognising the shape, knowing the two places access is configured, and knowing where to put the checkpoint.',
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
    lede: 'And you did it through the same screens and menus you will use in the real app.',
    takeaways: [
      'A connector is added in Settings and switched on per conversation. Two acts, two places — skipping the second is the classic stumble.',
      'A tool call is a request the model makes and your app executes — the model never runs it itself.',
      'The permission prompt is yours: allow once for anything unfamiliar, and think twice before "always" on a tool that writes.',
      'Answers built on tool results can be checked; answers built on memory cannot.',
      'An agent chooses its own next tool once you give it a goal, and stops where consequences begin.',
    ],
  },
};
