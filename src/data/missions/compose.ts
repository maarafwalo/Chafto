import type {
  IntakeAnswers,
  Mission,
  MissionStep,
  ScenarioBeat,
  SkillId,
} from '../../engine/types';
import { connectorById } from '../connectors';
import { SCENARIOS, genericScenario, type ConnectorScenario } from '../scenarios';
import { makeInstructionEvaluator, registerEvaluator } from '../../engine/evaluators';

/**
 * Build a walkthrough from what the learner told the Guide.
 *
 * Every branch here comes from an intake answer: which connector gets set up,
 * whether an action and its approval gate appear at all, and what the stated
 * outcome is judged against. The engine renders whatever this returns, so a
 * composed mission is a first-class mission — same steps, same scoring.
 */
export function composeMission(a: IntakeAnswers): Mission {
  const usesConnector = a.source !== 'none';
  const connector = usesConnector ? connectorById(a.source) : null;
  const scenario: ConnectorScenario | null = usesConnector
    ? (SCENARIOS[a.source] ?? genericScenario(connector!.name))
    : null;
  const wantsAction = a.stakes !== 'readonly';
  const gated = a.stakes === 'draft';

  const evaluatorId = `composed-${Date.now()}`;
  registerEvaluator(evaluatorId, makeInstructionEvaluator(a.outcome, connector?.name ?? null));

  const steps: MissionStep[] = [];
  const skills: SkillId[] = ['prompting'];

  /* -------------------------------------------------- 1. see the tool list */
  steps.push({
    id: 'c-tools',
    title: 'See what Claude can reach',
    objective: 'Open the menu that controls what this conversation may use.',
    actionType: 'click',
    concept: 'connector',
    why: 'Claude starts with no access to anything of yours. This menu is the whole list, and right now it is empty.',
    explanation:
      'A model can only work with what is in front of it: the conversation, and any tool it has been given. Everything this chat is allowed to touch is listed in one place — which means checking what an assistant can reach is always a single click, never a mystery.',
    hint: 'It is in the row of buttons under the message box.',
    successMessage: 'That is everything Claude can reach right now.',
    realWorld: 'In Claude: the Search and tools button at the bottom left of the message box.',
    learning: ['connectors'],
    xp: 60,
    devices: {
      desktop: { instruction: 'Click Search and tools under the message box.', target: [{ id: 'composer-tools', caption: 'Open Search and tools' }] },
      phone: { instruction: 'Tap the tools button under the message box.', target: [{ id: 'composer-tools', caption: 'Open the tools menu' }] },
    },
    expect: { event: 'open-menu', where: { menu: 'tools' } },
    allow: [{ event: 'open-menu', where: { menu: 'plus' } }],
  });

  if (usesConnector && connector && scenario) {
    skills.push('connectors', 'toolUse');

    /* ------------------------------------------------ 2. add the connector */
    steps.push({
      id: 'c-add',
      title: `Add ${connector.name}`,
      objective: `Get ${connector.name} onto your account.`,
      actionType: 'navigate',
      concept: 'mcp',
      why: `You said the information lives in ${connector.name}. Nothing works until Claude can reach it.`,
      explanation:
        'Adding a connector is an account-level act: you authorise Claude to reach a service, and you see exactly which tools and permissions that grants before you agree. Read the scopes — reading data and changing it are separate permissions even inside one connector.',
      hint: 'Add connectors at the bottom of the tools menu, then Browse connectors on the Settings page.',
      successMessage: 'The directory — every service Claude can be connected to.',
      realWorld: 'In Claude: Settings → Connectors → Browse connectors.',
      learning: ['connectors'],
      xp: 80,
      devices: {
        desktop: {
          instruction: 'Click Add connectors, then Browse connectors.',
          target: [
            { id: 'menu-add-connectors', when: { sheet: 'tools' }, caption: 'Add connectors' },
            { id: 'btn-browse-connectors', when: { screen: 'settings' }, caption: 'Browse connectors' },
            { id: 'composer-tools', caption: 'Open the tools menu' },
          ],
        },
        phone: {
          instruction: 'Tap Add connectors, then Browse connectors.',
          target: [
            { id: 'menu-add-connectors', when: { sheet: 'tools' }, caption: 'Add connectors' },
            { id: 'btn-browse-connectors', when: { screen: 'settings' }, caption: 'Browse connectors' },
            { id: 'composer-tools', caption: 'Open the tools menu' },
          ],
        },
      },
      expect: { event: 'open-menu', where: { menu: 'directory' } },
      allow: [{ event: 'open-settings' }, { event: 'open-menu' }, { event: 'open-screen' }],
    });

    /* ------------------------------------------------- 3. authorise it */
    steps.push({
      id: 'c-auth',
      title: `Read the scopes and allow ${connector.name}`,
      objective: 'Complete the connection, having read what you are agreeing to.',
      actionType: 'click',
      concept: 'permission',
      why: 'Connecting is a permission decision. This is the moment you choose what Claude may touch.',
      explanation: `${connector.name} is asking for: ${connector.scopes.join('; ')}. Those are not equal — reading is reversible, anything that writes is not. Granting the narrowest set that still does the job is the whole game.`,
      hint: `Pick ${connector.name} in the directory, then Connect, then allow the permissions.`,
      successMessage: 'Added to your account. Note the wording — added, not enabled.',
      realWorld: 'In Claude: an OAuth window opens and you approve the scopes.',
      learning: ['connectors', 'safety'],
      xp: 90,
      devices: {
        desktop: {
          instruction: `Choose ${connector.name}, click Connect, then Allow access.`,
          target: [
            { id: 'btn-authorize', when: { sheet: 'auth' }, caption: 'Allow access' },
            { id: 'btn-connect', when: { screen: 'connector-detail' }, caption: 'Connect' },
            { id: `connector-card-${connector.id}`, caption: `Choose ${connector.name}` },
          ],
        },
        phone: {
          instruction: `Choose ${connector.name}, tap Connect, then Allow access.`,
          target: [
            { id: 'btn-authorize', when: { sheet: 'auth' }, caption: 'Allow access' },
            { id: 'btn-connect', when: { screen: 'connector-detail' }, caption: 'Connect' },
            { id: `connector-card-${connector.id}`, caption: `Choose ${connector.name}` },
          ],
        },
      },
      expect: { event: 'authorize-connector', where: { id: connector.id } },
      allow: [
        { event: 'select-connector' },
        { event: 'connect-connector' },
        { event: 'open-menu' },
        { event: 'open-screen' },
      ],
    });

    /* ------------------------------------- 4. switch it on for this chat */
    steps.push({
      id: 'c-enable',
      title: 'Switch it on for this conversation',
      objective: 'Do the half that adding a connector does not do for you.',
      actionType: 'click',
      concept: 'permission',
      why: 'A connector on your account is available everywhere and active nowhere. Each conversation decides for itself.',
      explanation:
        'This is the step people miss, and the symptom is confusing: Claude says it cannot see your data even though you definitely connected it. The design is deliberate — a chat with six connectors live is slower and easier to misfire. Turn on what this piece of work needs, and nothing else.',
      hint: 'Back to the chat, open the tools menu, and toggle it on.',
      successMessage: 'Now it is genuinely available here. Two acts, two places.',
      realWorld: 'In Claude: + or Search and tools → toggle the connector for this chat.',
      learning: ['connectors', 'safety'],
      xp: 130,
      advance: 'manual',
      devices: {
        desktop: {
          instruction: `Return to the chat, open Search and tools, and toggle ${connector.name} on.`,
          target: [
            { id: `chat-connector-${connector.id}`, when: { sheet: 'tools' }, caption: 'Turn it on here' },
            { id: 'composer-tools', when: { screen: 'chat' }, caption: 'Open Search and tools' },
            { id: 'chat-chat-1', caption: 'Back to the conversation' },
          ],
        },
        phone: {
          instruction: `Return to the chat, open the tools menu, and toggle ${connector.name} on.`,
          target: [
            { id: `chat-connector-${connector.id}`, when: { sheet: 'tools' }, caption: 'Turn it on here' },
            { id: 'composer-tools', when: { screen: 'chat' }, caption: 'Open the tools menu' },
            { id: 'phone-menu', caption: 'Open the menu' },
          ],
        },
      },
      expect: { event: 'toggle-chat-connector', where: { id: connector.id, on: true } },
      allow: [{ event: 'open-screen' }, { event: 'open-settings' }, { event: 'open-menu' }, { event: 'select-connector' }],
      teach: {
        kind: 'callout',
        title: 'The most common “it doesn’t work”',
        body: 'Added to the account is not the same as enabled in the chat. When a connector seems broken, check this first — it takes one click to rule out.',
      },
    });
  }

  /* ------------------------------------------- 5. write the instruction */
  steps.push({
    id: 'c-ask',
    title: 'Ask for what you actually want',
    objective: 'Write the instruction in your own words — nobody types it for you.',
    actionType: 'type',
    concept: 'grounding',
    why: `You told me you wanted: “${a.outcome}”. Now say it to Claude in a way it can act on.`,
    explanation:
      'A good instruction carries three things: the task, the data, and what a good answer looks like. Vague instructions do not fail loudly — they quietly return something plausible and general. Being specific is the cheapest upgrade to any AI result, and it is the one people skip.',
    hint: `Ask for the thing you described: “${a.outcome}”. Name what Claude should work on.`,
    successMessage: 'Sent — and specific enough that a wrong answer would be obvious.',
    realWorld: 'In Claude: type in the message box. Enter sends, Shift+Enter for a new line.',
    learning: ['prompting'],
    xp: 150,
    devices: {
      desktop: {
        instruction: 'Type your instruction to Claude and send it.',
        target: [
          { id: 'composer-input', when: { screen: 'chat' }, caption: 'Write it here' },
          { id: 'chat-chat-1', caption: 'Back to the conversation' },
        ],
      },
      phone: {
        instruction: 'Type your instruction to Claude and send it.',
        target: [
          { id: 'composer-input', when: { screen: 'chat' }, caption: 'Write it here' },
          { id: 'phone-menu', caption: 'Back to the conversation' },
        ],
      },
    },
    expect: { event: 'send-message', evaluator: evaluatorId },
    allow: [{ event: 'open-screen' }, { event: 'open-menu' }],
    simulationResult: scenario ? permissionBeats(scenario, connector!.id) : plainAnswerBeats(a),
    weakResult: clarifyBeats,
  });

  if (usesConnector && scenario && connector) {
    /* --------------------------------------- 6. answer the tool prompt */
    steps.push({
      id: 'c-perm',
      title: 'Answer the permission prompt',
      objective: 'Decide whether the tool Claude picked may actually run.',
      actionType: 'decide',
      concept: 'human-in-the-loop',
      why: 'Claude does not run tools. It asks, and your app executes — which means there is a point where you can say no.',
      explanation:
        'Allow once is the right default for anything unfamiliar. Always allow is convenient and permanent for this conversation — fine for a read-only tool, worth hesitating over for anything that writes. Decline is a real option: Claude carries on without the data rather than failing.',
      hint: 'The request is in the conversation. Allow once is the safe choice for a read-only tool.',
      successMessage: 'Allowed for this one call — the right instinct.',
      realWorld: 'In Claude Desktop and Cowork, connector and MCP tool calls surface exactly this prompt.',
      learning: ['safety', 'toolUse'],
      xp: 120,
      advance: 'manual',
      devices: {
        desktop: { instruction: 'Read the request, then choose Allow once.', target: [{ id: 'perm-once', caption: 'Allow once' }] },
        phone: { instruction: 'Read the request, then tap Allow once.', target: [{ id: 'perm-once', caption: 'Allow once' }] },
      },
      expect: { event: 'permission-decision', where: { decision: 'once' } },
      allow: [
        { event: 'permission-decision', where: { decision: 'always' } },
        { event: 'permission-decision', where: { decision: 'deny' }, then: denyBeats },
        { event: 'open-menu' },
      ],
      simulationResult: fetchBeats(scenario),
    });

    /* ----------------------------------------- 7. read the tool call */
    steps.push({
      id: 'c-inspect',
      title: 'Read the tool call',
      objective: 'Open it and see where the answer came from.',
      actionType: 'inspect',
      concept: 'tool-use',
      why: `Claude is not reaching into ${connector.name} by magic. It asked for a tool, and the tool returned data.`,
      explanation:
        'Read the loop in order: Claude decided it needed facts it did not have, requested a specific call with specific arguments, your app ran it, and the result came back. Every claim it makes next traces to this block — which is why being able to open and read it matters more than any answer it gives.',
      hint: 'The block labelled TOOL CALL can be opened. Click it.',
      successMessage: 'A request, a result, and a paper trail. That is the whole trick.',
      realWorld: 'In Claude: tool and search results appear as collapsible rows — click to expand.',
      learning: ['toolUse', 'agents'],
      xp: 110,
      advance: 'manual',
      devices: {
        desktop: { instruction: `Click the ${scenario.readTool} block to inspect it.`, target: [{ id: 'tool-1', caption: 'Open the tool call' }] },
        phone: { instruction: `Tap the ${scenario.readTool} block to inspect it.`, target: [{ id: 'tool-1', caption: 'Open the tool call' }] },
      },
      expect: { event: 'inspect-tool-call', where: { id: 'tool-1' } },
      simulationResult: findingBeats(scenario),
      teach: {
        kind: 'callout',
        title: 'This is the part people get wrong',
        body: 'The model did not look anything up. It emitted a request, your app executed it, and the result was fed back in. Model, tool and data stay separate — that separation is what makes it inspectable.',
      },
    });

    /* -------------------------------------------- 8. defend the finding */
    skills.push('dataAnalysis');
    steps.push({
      id: 'c-quiz',
      title: 'Check the reasoning holds',
      objective: 'Confirm you could defend the conclusion from the data.',
      actionType: 'quiz',
      concept: 'grounding',
      why: 'An answer built on retrieved data can be checked. So check it.',
      explanation:
        'Ask a model a question with no tools and it answers in general terms. Ask it with a tool attached to your data and it answers about you, with evidence you can verify line by line. Same model, same question — the difference is Goal + Tool + Data.',
      hint: 'Look at the tool result above, not at what sounds sensible.',
      successMessage: 'Right — and you can point at the rows that prove it.',
      learning: ['dataAnalysis'],
      xp: 120,
      devices: {
        desktop: { instruction: "Answer the Guide's question from the tool result.", target: [{ id: 'tool-1', caption: 'The evidence is here' }] },
        phone: { instruction: "Answer the Guide's question from the tool result.", target: [{ id: 'tool-1', caption: 'The evidence is here' }] },
      },
      expect: { event: 'quiz-answer' },
      quiz: {
        prompt: scenario.quiz.prompt,
        options: [
          { id: 'w1', label: scenario.quiz.wrong[0][0], feedback: scenario.quiz.wrong[0][1] },
          { id: 'right', label: scenario.quiz.right, correct: true, feedback: scenario.quiz.rightWhy },
          { id: 'w2', label: scenario.quiz.wrong[1][0], feedback: scenario.quiz.wrong[1][1] },
        ],
      },
      simulationResult: wantsAction ? suggestBeats(scenario) : [],
    });
  }

  if (usesConnector && scenario && wantsAction) {
    skills.push('agents', 'automation');
    /* ------------------------------------------- 9. move to an action */
    steps.push({
      id: 'c-act',
      title: 'Move from answer to action',
      objective: 'Ask Claude to prepare something, not just report something.',
      actionType: 'click',
      concept: 'agent',
      why: 'This is the line between a chatbot and an agent: one tells you things, the other prepares work.',
      explanation:
        'Claude now picks a second tool on its own, because the goal implies it. You did not name the tool. That is what makes it agentic — you give an objective and it works out the sequence. Notice where it stops on its own.',
      hint: 'Claude has offered a follow-up under the conversation.',
      successMessage: 'It chose its own next tool to reach the goal you set.',
      realWorld: 'In Claude: suggested follow-ups appear above the message box.',
      learning: ['agents'],
      xp: 110,
      advance: 'manual',
      devices: {
        desktop: { instruction: `Click the suggestion “${scenario.actionLabel}”.`, target: [{ id: 'suggestion-sg-act', caption: 'Ask for it' }] },
        phone: { instruction: `Tap the suggestion “${scenario.actionLabel}”.`, target: [{ id: 'suggestion-sg-act', caption: 'Ask for it' }] },
      },
      expect: { event: 'use-suggestion', where: { id: 'sg-act' } },
      simulationResult: actionBeats(scenario, gated, a),
      teach: { kind: 'flow', nodes: ['Data', 'Analysis', 'Decision', 'Action'] },
    });

    if (gated) {
      skills.push('safety');
      /* --------------------------------------------- 10. the approval */
      steps.push({
        id: 'c-approve',
        title: 'Make the call',
        objective: 'Decide whether the prepared action happens.',
        actionType: 'decide',
        concept: 'human-in-the-loop',
        why: 'You asked for it to prepare, not to act. This is the checkpoint you chose.',
        explanation:
          a.constraint
            ? `You told me it must never: “${a.constraint}”. This gate is where that rule actually gets enforced — a constraint with no checkpoint is a wish. Read what it wants to do and check it against your own rule before you sign.`
            : 'Reading data is reversible. Changing something is not. Actions that cross that line stop and ask — and when you build agents, you choose where that line sits, by consequence rather than difficulty.',
        hint: 'Read what it prepared, then decide. Rejecting is a real option.',
        successMessage: 'Signed off — by you, on purpose.',
        learning: ['safety'],
        xp: 140,
        devices: {
          desktop: { instruction: 'Review the prepared action, then approve or reject it.', target: [{ id: 'btn-approve', caption: 'Approve' }] },
          phone: { instruction: 'Review the prepared action, then approve or reject it.', target: [{ id: 'btn-approve', caption: 'Approve' }] },
        },
        expect: { event: 'approval-decision', where: { decision: 'approve' } },
        allow: [{ event: 'approval-decision', where: { decision: 'reject' }, then: rejectBeats(scenario) }],
        simulationResult: executeBeats(scenario),
      });
    }
  }

  /* ------------------------------------------------------- last: close */
  steps.push({
    id: 'c-done',
    title: 'Name what you just built',
    objective: 'Close the loop.',
    actionType: 'observe',
    concept: 'workflow',
    why: 'You now have a shape you can reuse, not a trick you saw once.',
    explanation:
      'Every useful AI system is a variation on what you just ran: give it access, give it a goal, let it fetch, check the evidence, and decide where a human signs. Change the connector and the same steps become a different job entirely. That shape is the transferable thing here.',
    hint: 'Read the summary, then finish.',
    successMessage: 'Done.',
    learning: ['automation'],
    xp: 70,
    devices: {
      desktop: { instruction: 'Read the result, then finish.', target: [{ id: 'tool-1', caption: 'Where it came from' }] },
      phone: { instruction: 'Read the result, then finish.', target: [{ id: 'tool-1', caption: 'Where it came from' }] },
    },
    expect: { event: 'acknowledge' },
  });

  return {
    id: `composed-${a.source}-${a.goal}`,
    order: 0,
    title: connector ? `Get Claude working with ${connector.name}` : 'Get a straight answer out of Claude',
    premise: a.outcome,
    summary: connector
      ? `Connect ${connector.name}, get a grounded answer, and ${wantsAction ? 'take an action you approve' : 'stop where reading stops'}.`
      : 'Set the context, ask precisely, and judge what comes back.',
    goal: a.outcome,
    difficulty: wantsAction ? 'Intermediate' : 'Beginner',
    minutes: `${Math.max(5, steps.length * 1)}–${steps.length + 4} min`,
    skills: Array.from(new Set(skills)),
    concepts: ['connector', 'tool-use', 'grounding', 'human-in-the-loop'],
    status: 'available',
    variant: 'lesson',
    initialSim: {
      messages: [
        {
          id: 'w-0',
          role: 'assistant',
          kind: 'text',
          text: 'What are we working on?',
        },
      ],
    },
    steps,
    outro: {
      headline: 'You built that around your own goal.',
      lede: `You said you wanted: “${a.outcome}”. That is what you just ran.`,
      takeaways: [
        connector
          ? `${connector.name} is added at the account level and switched on per conversation — two acts, two places.`
          : 'Context is what a model can see. Everything you want it to use has to be in front of it.',
        'A tool call is a request the model makes and your app executes. It never runs anything itself.',
        'Answers built on tool results can be checked. Answers built on memory cannot.',
        wantsAction
          ? 'An agent picks its own next tool once you give it a goal, and stops where consequences begin.'
          : 'Read-only is a legitimate destination. Not every workflow needs to act.',
        a.constraint
          ? `A constraint only holds where there is a checkpoint to enforce it — yours was: “${a.constraint}”.`
          : 'Where the checkpoint sits is a design decision, and it is yours to make.',
      ],
    },
  };
}

/* ==================================================================== */
/* Beat builders                                                         */
/* ==================================================================== */

const clarifyBeats: ScenarioBeat[] = [
  { delay: 150, action: { type: 'BUSY', busy: true } },
  {
    delay: 900,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'w-clarify',
        role: 'assistant',
        kind: 'text',
        text: 'I can help — I just need a bit more to go on. What should I work on, and what would a good answer look like?',
      },
    },
  },
  { delay: 1050, action: { type: 'BUSY', busy: false } },
];

const denyBeats: ScenarioBeat[] = [
  { delay: 150, action: { type: 'BUSY', busy: true } },
  {
    delay: 900,
    action: {
      type: 'PUSH_MESSAGE',
      message: {
        id: 'w-deny',
        role: 'assistant',
        kind: 'text',
        text: 'Understood — I have not run it. Without that tool I can only speak in general terms, not about your data. Allow it when you are ready.',
      },
    },
  },
  { delay: 1500, action: { type: 'PUSH_MESSAGE', message: { id: 'perm-2', role: 'assistant', kind: 'permission', connectorId: 'windsor', tool: 'retry', summary: 'Same request, still waiting on you.', decision: 'pending' } } },
  { delay: 1650, action: { type: 'BUSY', busy: false } },
];

function permissionBeats(s: ConnectorScenario, connectorId: string): ScenarioBeat[] {
  return [
    { delay: 150, action: { type: 'BUSY', busy: true } },
    {
      delay: 800,
      action: {
        type: 'PUSH_MESSAGE',
        message: { id: 'w-1', role: 'assistant', kind: 'text', text: `I don't have that in this conversation, so I'll pull it through the connector.` },
      },
    },
    {
      delay: 1500,
      action: {
        type: 'PUSH_MESSAGE',
        message: { id: 'perm-1', role: 'assistant', kind: 'permission', connectorId, tool: s.readTool, summary: s.readSummary, decision: 'pending' },
      },
    },
    { delay: 1650, action: { type: 'BUSY', busy: false } },
  ];
}

function fetchBeats(s: ConnectorScenario): ScenarioBeat[] {
  return [
    { delay: 150, action: { type: 'BUSY', busy: true } },
    {
      delay: 700,
      action: {
        type: 'PUSH_MESSAGE',
        message: { id: 'tool-1', role: 'assistant', kind: 'tool', connectorId: 'windsor', tool: s.readTool, args: s.readArgs, status: 'running' },
      },
    },
    { delay: 2200, action: { type: 'PATCH_MESSAGE', id: 'tool-1', patch: { status: 'done', result: s.result } } },
    { delay: 2350, action: { type: 'BUSY', busy: false } },
  ];
}

function findingBeats(s: ConnectorScenario): ScenarioBeat[] {
  return [
    { delay: 250, action: { type: 'BUSY', busy: true } },
    {
      delay: 1300,
      action: { type: 'PUSH_MESSAGE', message: { id: 'w-2', role: 'assistant', kind: 'text', text: s.finding, evidence: s.evidence } },
    },
    { delay: 1450, action: { type: 'BUSY', busy: false } },
  ];
}

function suggestBeats(s: ConnectorScenario): ScenarioBeat[] {
  return [
    { delay: 400, action: { type: 'SUGGESTIONS', suggestions: [{ id: 'sg-act', label: s.actionLabel, text: s.actionLabel }] } },
  ];
}

function actionBeats(s: ConnectorScenario, gated: boolean, a: IntakeAnswers): ScenarioBeat[] {
  const beats: ScenarioBeat[] = [
    { delay: 150, action: { type: 'BUSY', busy: true } },
    { delay: 800, action: { type: 'PUSH_MESSAGE', message: { id: 'w-3', role: 'assistant', kind: 'text', text: s.actionIntro } } },
    {
      delay: 1500,
      action: { type: 'PUSH_MESSAGE', message: { id: 'tool-2', role: 'assistant', kind: 'tool', connectorId: 'windsor', tool: s.actionTool, args: s.actionArgs, status: 'running' } },
    },
    { delay: 2700, action: { type: 'PATCH_MESSAGE', id: 'tool-2', patch: { status: 'done', result: s.action } } },
  ];

  if (gated) {
    beats.push({
      delay: 3300,
      action: {
        type: 'PUSH_MESSAGE',
        message: {
          id: 'approval-1',
          role: 'assistant',
          kind: 'approval',
          title: s.approvalTitle,
          summary: a.constraint ? `${s.approvalSummary} You also said: “${a.constraint}”.` : s.approvalSummary,
          draft: {
            name: s.action.kind === 'record' ? s.action.title : 'Prepared action',
            budget: '—',
            audience: '—',
            creative: '—',
            objective: s.actionLabel,
            basedOn: s.readTool,
          },
          status: 'pending',
        },
      },
    });
  } else {
    beats.push({
      delay: 3200,
      action: {
        type: 'PUSH_MESSAGE',
        message: {
          id: 'w-auto',
          role: 'assistant',
          kind: 'text',
          text: 'Done — I did not stop to ask, because you told me not to. Worth noticing how that felt: the speed is real, and so is the fact that nobody checked it before it happened.',
        },
      },
    });
  }
  beats.push({ delay: 3450, action: { type: 'BUSY', busy: false } });
  return beats;
}

function rejectBeats(s: ConnectorScenario): ScenarioBeat[] {
  return [
    { delay: 150, action: { type: 'BUSY', busy: true } },
    {
      delay: 900,
      action: {
        type: 'PUSH_MESSAGE',
        message: { id: 'w-rej', role: 'assistant', kind: 'text', text: 'Understood — nothing happened. That is exactly what the gate is for. The draft is still here when you want it.' },
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
          title: s.approvalTitle,
          summary: 'Same action, still waiting on you.',
          draft: { name: s.action.kind === 'record' ? s.action.title : 'Prepared action', budget: '—', audience: '—', creative: '—', objective: s.actionLabel, basedOn: s.readTool },
          status: 'pending',
        },
      },
    },
    { delay: 1650, action: { type: 'BUSY', busy: false } },
  ];
}

function executeBeats(s: ConnectorScenario): ScenarioBeat[] {
  const done = s.action.kind === 'record' ? { ...s.action, done: true, reference: 'sim_0x41' } : s.action;
  return [
    { delay: 150, action: { type: 'BUSY', busy: true } },
    {
      delay: 800,
      action: { type: 'PUSH_MESSAGE', message: { id: 'tool-3', role: 'assistant', kind: 'tool', connectorId: 'windsor', tool: s.actionTool, args: '{\n  "confirmed_by": "human",\n  "mode": "simulation"\n}', status: 'running' } },
    },
    { delay: 2100, action: { type: 'PATCH_MESSAGE', id: 'tool-3', patch: { status: 'done', result: done } } },
    {
      delay: 2700,
      action: { type: 'PUSH_MESSAGE', message: { id: 'w-5', role: 'system', kind: 'notice', text: 'SIMULATION — nothing left this browser and no real service was contacted.' } },
    },
    { delay: 2850, action: { type: 'BUSY', busy: false } },
  ];
}

/** No connector: Claude answers from what it has, and the limits show. */
function plainAnswerBeats(a: IntakeAnswers): ScenarioBeat[] {
  return [
    { delay: 150, action: { type: 'BUSY', busy: true } },
    {
      delay: 1100,
      action: {
        type: 'PUSH_MESSAGE',
        message: {
          id: 'tool-1',
          role: 'assistant',
          kind: 'text',
          text: `Here is the shape of an answer — but notice what I am doing: reasoning from general knowledge, because nothing of yours is in front of me. I can tell you how to think about “${a.outcome}”. I cannot tell you the answer for your situation until you give me the actual data, either by connecting where it lives or pasting it here.`,
          evidence: ['No tools enabled', 'No data supplied'],
        },
      },
    },
    { delay: 1300, action: { type: 'BUSY', busy: false } },
  ];
}
