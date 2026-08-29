/**
 * Core domain types for the AI Skill Simulator.
 *
 * The product is split into three cooperating layers:
 *
 *   1. SIMULATION  — a fake AI application (`SimState` + `simReducer`). It knows
 *                    nothing about missions or teaching. It just behaves like an app.
 *   2. MISSION     — structured data (`Mission` / `MissionStep`). Pure JSON-ish content.
 *                    Missions never import UI code.
 *   3. ENGINE      — `missionEngine` wires the two together: it listens to semantic
 *                    events coming out of the simulation, decides whether the learner
 *                    did the expected thing, keeps score, and drives the Guide.
 *
 * Adding a new mission therefore means adding one data file. Swapping the local
 * simulation for a real API later means replacing layer 1 only.
 */

/* ------------------------------------------------------------------ */
/* Modes                                                               */
/* ------------------------------------------------------------------ */

/** Which simulated form factor the learner is practising in. */
export type DeviceMode = 'phone' | 'desktop';

/**
 * How much help the Guide gives.
 * guided    → exact instruction + permanent highlight.
 * practice  → objective + hints on demand, highlight only after a request.
 * challenge → objective only. Hints unlock after repeated mistakes.
 */
export type LearningMode = 'guided' | 'practice' | 'challenge';

export const LEARNING_MODES: Record<
  LearningMode,
  { id: LearningMode; label: string; blurb: string; assistCost: number }
> = {
  guided: {
    id: 'guided',
    label: 'Guided',
    blurb: 'The Guide tells you exactly what to do and where to click.',
    assistCost: 0,
  },
  practice: {
    id: 'practice',
    label: 'Practice',
    blurb: 'You get the objective. Hints are there if you ask for them.',
    assistCost: 0.25,
  },
  challenge: {
    id: 'challenge',
    label: 'Challenge',
    blurb: 'Only the goal. No instructions. Prove you can do it alone.',
    assistCost: 0.5,
  },
};

/* ------------------------------------------------------------------ */
/* Skills                                                              */
/* ------------------------------------------------------------------ */

export type SkillId =
  | 'prompting'
  | 'toolUse'
  | 'connectors'
  | 'agents'
  | 'automation'
  | 'dataAnalysis'
  | 'safety';

export const SKILLS: Record<SkillId, { id: SkillId; label: string; max: number }> = {
  prompting: { id: 'prompting', label: 'Prompting', max: 2000 },
  toolUse: { id: 'toolUse', label: 'Tool Use', max: 2000 },
  connectors: { id: 'connectors', label: 'Connectors', max: 2000 },
  agents: { id: 'agents', label: 'Agents', max: 2000 },
  automation: { id: 'automation', label: 'Automation', max: 2000 },
  dataAnalysis: { id: 'dataAnalysis', label: 'Data Analysis', max: 2000 },
  safety: { id: 'safety', label: 'Human-in-the-loop', max: 2000 },
};

/* ------------------------------------------------------------------ */
/* Semantic events emitted by the simulation                           */
/* ------------------------------------------------------------------ */

/**
 * Everything the learner does inside the simulated app is described by one of
 * these. The simulation reduces them into new state; the mission engine matches
 * them against the current step. Nothing else may drive progress — which is what
 * keeps "the Guide always knows the UI state" true by construction.
 */
export type SimEventType =
  | 'open-screen'
  | 'open-sheet'
  | 'close-sheet'
  | 'select-connector'
  | 'connect-connector'
  | 'authorize-connector'
  | 'disconnect-connector'
  | 'send-message'
  | 'use-suggestion'
  | 'inspect-tool-call'
  | 'approval-decision'
  | 'toggle-permission'
  | 'attach-file'
  | 'quiz-answer'
  | 'open-menu'
  | 'close-menu'
  | 'open-settings'
  | 'toggle-chat-connector'
  | 'toggle-capability'
  | 'permission-decision'
  | 'open-artifact'
  | 'set-instructions'
  | 'new-chat'
  | 'answer-question'
  | 'open-brief-field'
  | 'review-item'
  | 'add-context'
  | 'acknowledge';

export interface SimEvent<P = Record<string, unknown>> {
  type: SimEventType;
  payload?: P;
}

/* ------------------------------------------------------------------ */
/* Simulation state                                                    */
/* ------------------------------------------------------------------ */

/**
 * Screens mirror the real Claude apps: a conversation, a project page, and a
 * settings page. Connectors are not a destination — they live inside Settings,
 * and are switched on per conversation from the composer, exactly as they are
 * in the product.
 */
export type SimScreen = 'chat' | 'project' | 'settings' | 'connector-detail';

/** Overlays: composer menus, the connector directory, auth, the mobile drawer. */
export type SimSheet =
  | 'none'
  | 'plus'
  | 'tools'
  | 'directory'
  | 'auth'
  | 'account'
  | 'drawer'
  | 'instructions';

export type SettingsSection = 'connectors' | 'capabilities' | 'profile';

export type ConnectorStatus = 'available' | 'connecting' | 'connected';

export interface ConnectorDef {
  id: string;
  name: string;
  category: string;
  blurb: string;
  glyph: string;
  tint: string;
  /** Tools this connector would expose to the model once connected. */
  tools: { name: string; description: string }[];
  scopes: string[];
}

export interface CampaignRow {
  id: string;
  name: string;
  spend: string;
  ctr: string;
  cpa: string;
  roas: string;
  best?: boolean;
}

export interface CampaignDraft {
  name: string;
  budget: string;
  audience: string;
  creative: string;
  objective: string;
  basedOn: string;
}

/** One decided (or still undecided) line of the campaign specification. */
export interface BriefField {
  id: string;
  group: string;
  label: string;
  value: string | null;
  /**
   * empty     — nobody has decided this yet.
   * assumed   — the model filled it in without being told. The dangerous one.
   * confirmed — a human decided it, or it was derived from supplied evidence.
   */
  status: 'empty' | 'assumed' | 'confirmed';
  /** Why this detail exists at all. */
  why: string;
  /** What actually goes wrong when it is left assumed or set badly. */
  risk: string;
  /** Where the value came from — supplied context, a tool result, your answer. */
  source?: string;
}

/** A fact the learner can put into the model's working context. */
export interface ContextBlock {
  id: string;
  label: string;
  detail: string;
  /** Whether this fact can actually change a decision in the campaign. */
  useful: boolean;
  added: boolean;
  /** Shown after it is added — what it now lets the model do. */
  unlocks?: string;
}

/** A line item the learner must accept or reject on its merits. */
export interface ReviewItem {
  id: string;
  label: string;
  detail: string;
  /** True when the item is genuinely fine. Exactly the thing to be checked. */
  sound: boolean;
  /** Explanation shown when flagged. */
  flagNote: string;
  /** Explanation shown when approved. */
  okNote: string;
  verdict: 'none' | 'ok' | 'flag';
}

export type ToolResult =
  | { kind: 'campaigns'; rows: CampaignRow[]; note: string }
  | { kind: 'draft'; draft: CampaignDraft }
  | { kind: 'created'; draft: CampaignDraft; reference: string }
  /** Generic tabular result, so any connector can return something real. */
  | { kind: 'table'; columns: string[]; rows: string[][]; note: string }
  /** Generic single-record result — a draft, a row, a prepared action. */
  | {
      kind: 'record';
      title: string;
      fields: { label: string; value: string }[];
      note?: string;
      done?: boolean;
      reference?: string;
    };

export type SimMessage =
  | { id: string; role: 'user'; kind: 'text'; text: string }
  | {
      id: string;
      role: 'assistant';
      kind: 'text';
      text: string;
      /** Substrings rendered as emphasised "evidence" chips inside the bubble. */
      evidence?: string[];
      thinking?: boolean;
    }
  | {
      id: string;
      role: 'assistant';
      kind: 'tool';
      tool: string;
      args: string;
      status: 'running' | 'done' | 'error';
      result?: ToolResult;
      connectorId: string;
    }
  | {
      id: string;
      role: 'assistant';
      kind: 'approval';
      title: string;
      summary: string;
      draft: CampaignDraft;
      status: 'pending' | 'approved' | 'rejected';
    }
  | {
      id: string;
      role: 'assistant';
      kind: 'question';
      prompt: string;
      note?: string;
      options: {
        id: string;
        label: string;
        detail: string;
        /**
         * Brief lines this answer decides. The learner's choice is what fills
         * the specification — the document is a record of their decisions, not
         * a canned result.
         */
        writes?: { id: string; value: string; status: BriefField['status']; source?: string }[];
      }[];
      answered: string | null;
    }
  | {
      id: string;
      role: 'assistant';
      kind: 'review';
      title: string;
      intro: string;
      /** 'variants' renders copy options; 'checklist' renders a pre-flight list. */
      mode: 'variants' | 'checklist';
      items: ReviewItem[];
    }
  | {
      id: string;
      role: 'assistant';
      kind: 'permission';
      /** The tool the model is asking to run, as the real prompt shows it. */
      tool: string;
      connectorId: string;
      summary: string;
      decision: 'pending' | 'once' | 'always' | 'deny';
    }
  | {
      id: string;
      role: 'assistant';
      kind: 'artifact-card';
      title: string;
      subtitle: string;
      version: number;
    }
  | { id: string; role: 'system'; kind: 'notice'; text: string };

export interface Suggestion {
  id: string;
  label: string;
  text: string;
}

export interface SimState {
  screen: SimScreen;
  sheet: SimSheet;
  settingsSection: SettingsSection;
  activeConnectorId: string | null;
  /** Account-level: the connector has been added to the workspace. */
  connectorStatus: Record<string, ConnectorStatus>;
  /**
   * Per-conversation: which connected tools this chat may actually use.
   * Adding a connector and enabling it in a chat are two separate acts in the
   * real product, and forgetting the second is the most common stumble there is.
   */
  chatConnectors: string[];
  /** Settings → Capabilities toggles, plus the per-chat tool switches. */
  capabilities: Record<string, boolean>;
  model: string;
  chats: { id: string; title: string; project?: string }[];
  activeChatId: string;
  project: { id: string; name: string; description: string; instructions: string | null } | null;
  /** Whether the current conversation sits inside the project. */
  inProject: boolean;
  /** The artifact panel beside the conversation. */
  artifactOpen: boolean;
  artifactVersion: number;
  /** Tool permission switches shown on a connected connector's detail screen. */
  permissions: Record<string, boolean>;
  messages: SimMessage[];
  composer: string;
  /** Assistant is "thinking" — blocks the composer, shows a typing indicator. */
  busy: boolean;
  expandedTools: string[];
  suggestions: Suggestion[];
  toast: { id: string; text: string; tone: 'ok' | 'info' } | null;
  files: { id: string; name: string; meta: string }[];
  /** The campaign specification being assembled — the mission's real artefact. */
  brief: BriefField[];
  /** Facts loaded into the assistant's working context. */
  context: ContextBlock[];
  /** Brief line currently opened for a drill-down. */
  openField: string | null;
}

/* Simulation actions (internal to the simulation layer). */
export type SimAction =
  | { type: 'RESET'; state?: Partial<SimState> }
  | { type: 'NAV'; screen: SimScreen }
  | { type: 'SHEET'; sheet: SimSheet }
  | { type: 'ACTIVE_CONNECTOR'; id: string | null }
  | { type: 'CONNECTOR_STATUS'; id: string; status: ConnectorStatus }
  | { type: 'PERMISSION'; key: string; value: boolean }
  | { type: 'COMPOSER'; text: string }
  | { type: 'PUSH_MESSAGE'; message: SimMessage }
  | { type: 'PATCH_MESSAGE'; id: string; patch: Record<string, unknown> }
  | { type: 'EXPAND_TOOL'; id: string }
  | { type: 'BUSY'; busy: boolean }
  | { type: 'SUGGESTIONS'; suggestions: Suggestion[] }
  | { type: 'TOAST'; toast: SimState['toast'] }
  | { type: 'ATTACH_FILE'; file: { id: string; name: string; meta: string } }
  | {
      type: 'SET_BRIEF';
      id: string;
      patch: Partial<Pick<BriefField, 'value' | 'status' | 'source'>>;
    }
  | { type: 'ADD_CONTEXT'; id: string }
  | { type: 'OPEN_FIELD'; id: string | null }
  | { type: 'ANSWER_QUESTION'; id: string; optionId: string }
  | { type: 'REVIEW_VERDICT'; messageId: string; itemId: string; verdict: 'ok' | 'flag' }
  | { type: 'SETTINGS_SECTION'; section: SettingsSection }
  | { type: 'CHAT_CONNECTOR'; id: string; on: boolean }
  | { type: 'CAPABILITY'; key: string; on: boolean }
  | { type: 'MODEL'; model: string }
  | { type: 'PERMISSION_DECISION'; id: string; decision: 'once' | 'always' | 'deny' }
  | { type: 'ARTIFACT'; open: boolean; version?: number }
  | { type: 'INSTRUCTIONS'; text: string }
  | { type: 'NEW_CHAT'; id: string; title: string; inProject: boolean };

/* ------------------------------------------------------------------ */
/* Mission content                                                     */
/* ------------------------------------------------------------------ */

/** Flattened view of the simulation used for matching targets and conditions. */
export interface SimContext {
  device: DeviceMode;
  screen: SimScreen;
  sheet: SimSheet;
  activeConnectorId: string | null;
  windsorStatus: ConnectorStatus;
  busy: boolean;
  lastToolId: string | null;
  approvalStatus: 'none' | 'pending' | 'approved' | 'rejected';
  /** Which brief line is open, so a step can target the drawer's contents. */
  openField: string | null;
  /** The first question still waiting on an answer — lets a step follow a form. */
  pendingQuestion: string | null;
  settingsSection: SettingsSection;
  /** Whether the marketing connector is switched on for this conversation. */
  windsorInChat: boolean;
  artifactOpen: boolean;
  inProject: boolean;
  hasInstructions: boolean;
  /** The permission prompt still awaiting a decision, if any. */
  pendingPermission: string | null;
  /** How complete the specification is — used for targeting and for the Guide. */
  briefComplete: boolean;
}

/** Pick a highlight target based on where the learner currently is. */
export interface TargetRule {
  /** `data-sim-id` of the element to spotlight. */
  id: string;
  /** Only use this target when every listed key matches the current context. */
  when?: Partial<SimContext>;
  /** Short caption shown in the spotlight bubble / pointer demo. */
  caption?: string;
}

export type ActionType =
  | 'click'
  | 'navigate'
  | 'type'
  | 'inspect'
  | 'decide'
  | 'quiz'
  | 'observe';

/** Declarative matcher: event type + a shallow subset of the payload. */
export interface ExpectRule {
  event: SimEventType;
  where?: Record<string, unknown>;
  /** Optional registered evaluator for free-form input (see evaluators.ts). */
  evaluator?: string;
  /** Beats to play when this rule matches — used by `allow` side-paths. */
  then?: ScenarioBeat[];
}

export interface QuizOption {
  id: string;
  label: string;
  correct?: boolean;
  /** Shown when this option is picked — right or wrong. */
  feedback: string;
}

export interface DeviceInstruction {
  /** Imperative, one action. "Tap the + button next to the message box." */
  instruction: string;
  target: TargetRule[];
  /** Optional extra line explaining how this differs on this form factor. */
  note?: string;
}

/** A scripted change to the simulation, triggered by mission progress. */
export interface ScenarioBeat {
  delay: number;
  action: SimAction;
}

export interface MissionStep {
  id: string;
  /** "Open Connectors" */
  title: string;
  /** One sentence describing the outcome the learner is working toward. */
  objective: string;
  actionType: ActionType;
  /** Which concept card this step teaches (id from data/concepts.ts). */
  concept?: string;
  /** Plain-language answer to "why am I doing this?". */
  why: string;
  /** Deeper explanation of the mechanics, shown in the WHY drawer. */
  explanation: string;
  /** Nudge shown after a wrong attempt / on request. */
  hint: string;
  /** Confirmation after the learner gets it right. */
  successMessage: string;
  /**
   * Where this action lives in the real Claude apps today, in one line. Shown
   * in the Guide so the muscle memory transfers out of the simulator.
   */
  realWorld?: string;
  /** What the learner is practising, shown as chips. */
  learning: SkillId[];
  xp: number;
  /** Per-device instruction + highlight target. */
  devices: Record<DeviceMode, DeviceInstruction>;
  /** What counts as doing the step. */
  expect: ExpectRule;
  /** Quiz payload when actionType === 'quiz'. */
  quiz?: { prompt: string; options: QuizOption[] };
  /** Fired into the simulation once the step is completed. */
  simulationResult?: ScenarioBeat[];
  /**
   * Fired when the learner's free-text answer matched the step but failed the
   * evaluator — lets the simulated assistant ask a clarifying question instead
   * of silently rejecting the input.
   */
  weakResult?: ScenarioBeat[];
  /**
   * Events that are legitimate stepping stones toward this step (opening the
   * menu that contains the real target, for instance). They neither complete
   * the step nor count as a mistake.
   */
  allow?: ExpectRule[];
  /**
   * 'auto'   → move on shortly after the success message (default).
   * 'manual' → hold on a teaching panel until the learner presses Continue.
   */
  advance?: 'auto' | 'manual';
  /** Extra teaching UI in the Guide for this step. */
  teach?: { kind: 'flow'; nodes: string[] } | { kind: 'callout'; title: string; body: string };
  /**
   * Optional depth. Each entry is a question a learner who wants to go further
   * would actually ask, answered properly. Collapsed until they ask for it, so
   * depth never gets in the way of momentum.
   */
  deepDive?: { q: string; a: string }[];
}

export interface Mission {
  id: string;
  order: number;
  title: string;
  /** The learner's own words for what they want. Shown as the mission premise. */
  premise: string;
  summary: string;
  goal: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  minutes: string;
  skills: SkillId[];
  concepts: string[];
  status: 'available' | 'locked';
  /** Set for the post-mission challenge run so the UI can frame it differently. */
  variant?: 'lesson' | 'challenge';
  /** Reset the simulation to this shape when the mission (re)starts. */
  initialSim?: Partial<SimState>;
  steps: MissionStep[];
  /** Optional follow-up run in CHALLENGE mode. */
  challengeMissionId?: string;
  outro?: { headline: string; lede?: string; takeaways: string[] };
}

/* ------------------------------------------------------------------ */
/* Intake — what the learner tells the Guide before anything runs      */
/* ------------------------------------------------------------------ */

export type IntakeGoal = 'analyse' | 'retrieve' | 'create' | 'act' | 'automate';
export type IntakeStakes = 'readonly' | 'draft' | 'auto';

export interface IntakeQuestion {
  id: string;
  /** Short label above the question. */
  eyebrow: string;
  prompt: string;
  /** Why this question is being asked — the Guide teaching as it interviews. */
  help?: string;
  kind: 'choice' | 'text';
  options?: {
    id: string;
    label: string;
    detail: string;
    /** Shown once picked — what this choice means for the walkthrough. */
    consequence?: string;
  }[];
  placeholder?: string;
  optional?: boolean;
}

export interface IntakeAnswers {
  goal: IntakeGoal;
  /** Connector id, or 'none' when the data is not in a connected service. */
  source: string;
  stakes: IntakeStakes;
  /** Their own words for a good outcome. */
  outcome: string;
  /** Optional hard constraint — becomes a real rule in the walkthrough. */
  constraint: string;
  device: DeviceMode;
  mode: LearningMode;
}

/* ------------------------------------------------------------------ */
/* Concepts                                                            */
/* ------------------------------------------------------------------ */

export interface Concept {
  id: string;
  term: string;
  short: string;
  long: string;
  analogy: string;
  glyph: string;
}

/* ------------------------------------------------------------------ */
/* Engine state                                                        */
/* ------------------------------------------------------------------ */

export interface StepRecord {
  stepId: string;
  attempts: number;
  wrong: number;
  usedHint: boolean;
  usedShowMe: boolean;
  usedWhy: boolean;
  xpEarned: number;
  completed: boolean;
}

export type EngineStatus = 'briefing' | 'running' | 'complete';

export interface EngineState {
  missionId: string;
  status: EngineStatus;
  stepIndex: number;
  /** Success ribbon carried into the next step ("✓ Great, you opened Connectors"). */
  lastSuccess: string | null;
  /** Feedback after a wrong attempt. */
  feedback: { tone: 'wrong' | 'hint' | 'info'; text: string } | null;
  records: Record<string, StepRecord>;
  revealHint: boolean;
  revealWhy: boolean;
  /** Set while the "Show me" pointer demo is playing. */
  demo: { targetId: string; caption: string; nonce: number } | null;
  /** Concept cards unlocked during this run. */
  unlocked: string[];
  startedAt: number;
  finishedAt: number | null;
  quizChoice: string | null;
  awaitingContinue: boolean;
}

export interface RunScore {
  xp: number;
  maxXp: number;
  accuracy: number;
  attempts: number;
  wrong: number;
  assists: number;
  steps: number;
  seconds: number;
  rank: 'Gold' | 'Silver' | 'Bronze';
}

/* ------------------------------------------------------------------ */
/* Persisted progress                                                  */
/* ------------------------------------------------------------------ */

export interface Progress {
  version: 1;
  xp: number;
  skills: Record<SkillId, number>;
  missionsCompleted: string[];
  challengesCompleted: string[];
  conceptsUnlocked: string[];
  totalAttempts: number;
  totalWrong: number;
  bestAccuracy: number;
  runs: { missionId: string; at: number; score: RunScore }[];
}
