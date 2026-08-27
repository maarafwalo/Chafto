import type { Concept } from '../engine/types';

/**
 * Concept cards are the vocabulary layer of the product. A step "unlocks" one,
 * it appears in the Guide, and it stays in the learner's collection afterwards.
 * Language is deliberately plain — no jargon explained with more jargon.
 */
export const CONCEPTS: Concept[] = [
  {
    id: 'connector',
    term: 'Connector',
    short: 'A bridge between an AI app and another service.',
    long: 'On its own, an AI model can only work with what is in the conversation. A connector plugs it into an outside service — your email, your files, your ad account — and gives it a set of tools it is allowed to use there.',
    analogy: 'Like giving a new employee a badge for one specific building.',
    glyph: '⇄',
  },
  {
    id: 'tool',
    term: 'Tool',
    short: 'A function the AI can call to get information or do something.',
    long: 'A tool has a name, some inputs, and a result — like get_campaign_performance(). The model does not run the tool itself. It asks for it, your app runs it, and the result comes back into the conversation as new information.',
    analogy: 'Like a calculator on the desk. The model decides when to reach for it.',
    glyph: '⌘',
  },
  {
    id: 'tool-use',
    term: 'Tool Use',
    short: 'The loop of asking for a tool, getting a result, and reasoning on it.',
    long: 'Tool use is a conversation inside the conversation: the model says "I need this", the tool answers with real data, and the model then reasons over facts instead of guesses. Every claim it makes afterwards can be traced back to a result you can inspect.',
    analogy: 'Ask, fetch, then answer — instead of answering from memory.',
    glyph: '↺',
  },
  {
    id: 'agent',
    term: 'Agent',
    short: 'An AI that chooses which tools to use to reach a goal.',
    long: 'You give an agent an objective rather than a click-by-click script. It decides which tools to call, in what order, and when it has enough to act. The more tools it has, the more of the job it can carry.',
    analogy: 'You say "find the best campaign". It works out the steps.',
    glyph: '◆',
  },
  {
    id: 'grounding',
    term: 'Grounded Answer',
    short: 'An answer built from retrieved data, not from memory.',
    long: 'A general question gets a general answer. The same question, asked with a tool attached to your real data, gets an answer about *you* — and one you can check line by line against the tool result.',
    analogy: 'Goal + Tool + Data beats Goal alone, every time.',
    glyph: '⌖',
  },
  {
    id: 'human-in-the-loop',
    term: 'Human-in-the-loop',
    short: 'A person approves important actions before they happen.',
    long: 'Reading data is cheap to undo. Spending money, sending email or changing live systems is not. A well-built agent pauses at that boundary and asks a human to confirm — so speed applies to the work, and judgement applies to the consequences.',
    analogy: 'The AI writes the cheque. You sign it.',
    glyph: '⚑',
  },
  {
    id: 'permission',
    term: 'Permission Scope',
    short: 'The precise list of what a connector is allowed to do.',
    long: 'Connectors are not all-or-nothing. Each tool can be switched on or off, and read access is very different from write access. Granting the narrowest set that still does the job is the whole game.',
    analogy: 'Read the ledger, yes. Move the money, ask first.',
    glyph: '⊙',
  },
  {
    id: 'api',
    term: 'API',
    short: 'How two pieces of software talk to each other.',
    long: 'An API is a defined set of requests one system will answer for another. Connectors and tools are usually just friendly wrappers around an API, shaped so a model can use them safely.',
    analogy: 'A menu of things you are allowed to order.',
    glyph: '⌸',
  },
  {
    id: 'mcp',
    term: 'MCP',
    short: 'A shared standard for connecting AI apps to tools and data.',
    long: 'The Model Context Protocol is a common plug shape. A service implements it once, and any AI application that speaks MCP can use its tools — instead of every app building a custom integration for every service.',
    analogy: 'USB-C for AI tools.',
    glyph: '⎔',
  },
  {
    id: 'workflow',
    term: 'Agent Workflow',
    short: 'Data → analysis → decision → action, with a checkpoint.',
    long: 'Nearly every useful AI system is this same shape. Recognising it means you can design one: what data does it need, what should it conclude, what may it do on its own, and where must a person sign off.',
    analogy: 'The four beats every automation is built from.',
    glyph: '⇉',
  },
];

export const conceptById = (id: string): Concept | undefined => CONCEPTS.find((c) => c.id === id);
