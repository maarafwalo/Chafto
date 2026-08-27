import type {
  BriefField,
  ConnectorStatus,
  SimAction,
  SimContext,
  SimEvent,
  SimMessage,
  SimState,
} from './types';
import { CONNECTORS } from '../data/connectors';

let seq = 0;
export const nextId = (prefix: string) => `${prefix}-${(seq += 1)}`;
export const resetIds = () => {
  seq = 0;
};

export const initialSimState = (): SimState => ({
  screen: 'chat',
  sheet: 'none',
  settingsSection: 'connectors',
  activeConnectorId: null,
  connectorStatus: Object.fromEntries(
    CONNECTORS.map((c) => [c.id, 'available' as ConnectorStatus]),
  ),
  permissions: {
    'windsor.get_campaign_performance()': true,
    'windsor.create_campaign_draft()': true,
  },
  chatConnectors: [],
  capabilities: { artifacts: true, webSearch: true, extendedThinking: false, research: false },
  model: 'Claude Opus 5',
  chats: [{ id: 'chat-1', title: 'New chat' }],
  activeChatId: 'chat-1',
  project: null,
  inProject: false,
  artifactOpen: false,
  artifactVersion: 1,
  messages: [
    {
      id: 'm-welcome',
      role: 'assistant',
      kind: 'text',
      text: 'Hi — I can answer questions, work with files, and use any tools you connect me to. What are we working on?',
    },
  ],
  composer: '',
  busy: false,
  expandedTools: [],
  suggestions: [],
  toast: null,
  files: [],
  brief: [],
  context: [],
  openField: null,
});

export function simReducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case 'RESET':
      return { ...initialSimState(), ...action.state };
    case 'NAV':
      return { ...state, screen: action.screen, sheet: 'none' };
    case 'SHEET':
      return { ...state, sheet: action.sheet };
    case 'ACTIVE_CONNECTOR':
      return { ...state, activeConnectorId: action.id };
    case 'CONNECTOR_STATUS':
      return {
        ...state,
        connectorStatus: { ...state.connectorStatus, [action.id]: action.status },
      };
    case 'PERMISSION':
      return { ...state, permissions: { ...state.permissions, [action.key]: action.value } };
    case 'COMPOSER':
      return { ...state, composer: action.text };
    case 'PUSH_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };
    case 'PATCH_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id ? ({ ...m, ...action.patch } as SimMessage) : m,
        ),
      };
    case 'EXPAND_TOOL':
      return state.expandedTools.includes(action.id)
        ? { ...state, expandedTools: state.expandedTools.filter((t) => t !== action.id) }
        : { ...state, expandedTools: [...state.expandedTools, action.id] };
    case 'BUSY':
      return { ...state, busy: action.busy };
    case 'SUGGESTIONS':
      return { ...state, suggestions: action.suggestions };
    case 'TOAST':
      return { ...state, toast: action.toast };
    case 'ATTACH_FILE':
      return { ...state, files: [...state.files, action.file] };
    case 'SET_BRIEF':
      return {
        ...state,
        brief: state.brief.map((f) => (f.id === action.id ? { ...f, ...action.patch } : f)),
      };
    case 'ADD_CONTEXT':
      return {
        ...state,
        context: state.context.map((c) => (c.id === action.id ? { ...c, added: true } : c)),
      };
    case 'OPEN_FIELD':
      return { ...state, openField: action.id };
    case 'ANSWER_QUESTION': {
      const question = state.messages.find((m) => m.id === action.id);
      const writes =
        question?.kind === 'question'
          ? (question.options.find((o) => o.id === action.optionId)?.writes ?? [])
          : [];
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id && m.kind === 'question' ? { ...m, answered: action.optionId } : m,
        ),
        // The answer decides the brief line, so the specification reflects what
        // this learner actually chose.
        brief: state.brief.map((f) => {
          const w = writes.find((x) => x.id === f.id);
          return w ? { ...f, value: w.value, status: w.status, source: w.source ?? f.source } : f;
        }),
      };
    }
    case 'REVIEW_VERDICT':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.messageId && m.kind === 'review'
            ? {
                ...m,
                items: m.items.map((i) =>
                  i.id === action.itemId ? { ...i, verdict: action.verdict } : i,
                ),
              }
            : m,
        ),
      };
    case 'SETTINGS_SECTION':
      return { ...state, settingsSection: action.section };
    case 'CHAT_CONNECTOR':
      return {
        ...state,
        chatConnectors: action.on
          ? Array.from(new Set([...state.chatConnectors, action.id]))
          : state.chatConnectors.filter((c) => c !== action.id),
      };
    case 'CAPABILITY':
      return { ...state, capabilities: { ...state.capabilities, [action.key]: action.on } };
    case 'MODEL':
      return { ...state, model: action.model };
    case 'PERMISSION_DECISION':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id && m.kind === 'permission' ? { ...m, decision: action.decision } : m,
        ),
      };
    case 'ARTIFACT':
      return {
        ...state,
        artifactOpen: action.open,
        artifactVersion: action.version ?? state.artifactVersion,
      };
    case 'INSTRUCTIONS':
      return {
        ...state,
        sheet: 'none',
        project: state.project ? { ...state.project, instructions: action.text } : state.project,
      };
    case 'NEW_CHAT':
      return {
        ...state,
        screen: 'chat',
        sheet: 'none',
        activeChatId: action.id,
        inProject: action.inProject,
        chats: [{ id: action.id, title: action.title }, ...state.chats],
        // A new conversation starts with no tools enabled — same as the product.
        chatConnectors: [],
        messages: [],
      };
    default:
      return state;
  }
}

/**
 * Translate a semantic learner event into simulation actions.
 *
 * This is deliberately the *only* path from an interaction to a state change:
 * the same event object is also handed to the mission engine, so the Guide can
 * never disagree with what the app is showing.
 */
export function eventToActions(event: SimEvent, _state: SimState): SimAction[] {
  const p = (event.payload ?? {}) as Record<string, string | boolean>;
  switch (event.type) {
    case 'open-screen':
      return [{ type: 'NAV', screen: p.screen as SimState['screen'] }];
    case 'open-sheet':
    case 'open-menu':
      return [{ type: 'SHEET', sheet: (p.menu ?? p.sheet) as SimState['sheet'] }];
    case 'close-sheet':
    case 'close-menu':
      return [{ type: 'SHEET', sheet: 'none' }];
    case 'open-settings':
      return [
        { type: 'SHEET', sheet: 'none' },
        { type: 'NAV', screen: 'settings' },
        { type: 'SETTINGS_SECTION', section: (p.section as 'connectors') ?? 'connectors' },
      ];
    case 'toggle-chat-connector':
      return [{ type: 'CHAT_CONNECTOR', id: p.id as string, on: p.on as boolean }];
    case 'toggle-capability':
      return [{ type: 'CAPABILITY', key: p.key as string, on: p.on as boolean }];
    case 'permission-decision':
      return [
        {
          type: 'PERMISSION_DECISION',
          id: p.id as string,
          decision: p.decision as 'once' | 'always' | 'deny',
        },
      ];
    case 'open-artifact':
      return [{ type: 'ARTIFACT', open: p.open !== false }];
    case 'set-instructions':
      return [{ type: 'INSTRUCTIONS', text: p.text as string }];
    case 'new-chat':
      return [
        { type: 'NEW_CHAT', id: nextId('chat'), title: 'New chat', inProject: p.inProject === true },
      ];
    case 'select-connector':
      return [
        { type: 'ACTIVE_CONNECTOR', id: p.id as string },
        { type: 'SHEET', sheet: 'none' },
        { type: 'NAV', screen: 'connector-detail' },
      ];
    case 'connect-connector':
      return [
        { type: 'CONNECTOR_STATUS', id: p.id as string, status: 'connecting' },
        { type: 'SHEET', sheet: 'auth' },
      ];
    case 'authorize-connector':
      return [
        { type: 'CONNECTOR_STATUS', id: p.id as string, status: 'connected' },
        { type: 'SHEET', sheet: 'none' },
        {
          type: 'TOAST',
          toast: {
            id: nextId('toast'),
            // Deliberately says "added", not "enabled" — the second half is the
            // per-chat switch, and the product does not do it for you either.
            text: 'Connector added to your account',
            tone: 'ok',
          },
        },
      ];
    case 'disconnect-connector':
      return [{ type: 'CONNECTOR_STATUS', id: p.id as string, status: 'available' }];
    case 'toggle-permission':
      return [{ type: 'PERMISSION', key: p.key as string, value: p.value as boolean }];
    case 'attach-file':
      return [
        {
          type: 'ATTACH_FILE',
          file: { id: nextId('file'), name: p.name as string, meta: p.meta as string },
        },
      ];
    case 'send-message':
    case 'use-suggestion':
      return [
        {
          type: 'PUSH_MESSAGE',
          message: { id: nextId('msg'), role: 'user', kind: 'text', text: p.text as string },
        },
        { type: 'COMPOSER', text: '' },
        { type: 'SUGGESTIONS', suggestions: [] },
        { type: 'NAV', screen: 'chat' },
      ];
    case 'inspect-tool-call':
      return [{ type: 'EXPAND_TOOL', id: p.id as string }];
    case 'open-brief-field':
      return [{ type: 'OPEN_FIELD', id: (p.fieldId as string) ?? null }];
    case 'add-context':
      // The picker closes once something is chosen, the way a file dialog does.
      return [{ type: 'ADD_CONTEXT', id: p.id as string }, { type: 'SHEET', sheet: 'none' }];
    case 'answer-question':
      return [
        { type: 'ANSWER_QUESTION', id: p.questionId as string, optionId: p.optionId as string },
      ];
    case 'review-item':
      return [
        {
          type: 'REVIEW_VERDICT',
          messageId: p.messageId as string,
          itemId: p.itemId as string,
          verdict: p.verdict as 'ok' | 'flag',
        },
      ];
    case 'approval-decision':
      return [
        {
          type: 'PATCH_MESSAGE',
          id: p.id as string,
          patch: { status: p.decision === 'approve' ? 'approved' : 'rejected' },
        },
      ];
    default:
      return [];
  }
}

/** Flatten simulation state into the shape mission rules are written against. */
export function toContext(state: SimState, device: SimContext['device']): SimContext {
  const tools = state.messages.filter((m) => m.kind === 'tool');
  const approval = [...state.messages].reverse().find((m) => m.kind === 'approval');
  const unresolved = state.brief.filter((f: BriefField) => f.status !== 'confirmed');
  const pending = state.messages.find((m) => m.kind === 'question' && m.answered === null);
  const perm = state.messages.find((m) => m.kind === 'permission' && m.decision === 'pending');
  return {
    device,
    openField: state.openField,
    pendingQuestion: pending ? pending.id : null,
    pendingPermission: perm ? perm.id : null,
    settingsSection: state.settingsSection,
    windsorInChat: state.chatConnectors.includes('windsor'),
    artifactOpen: state.artifactOpen,
    inProject: state.inProject,
    hasInstructions: !!state.project?.instructions,
    briefComplete: state.brief.length > 0 && unresolved.length === 0,
    screen: state.screen,
    sheet: state.sheet,
    activeConnectorId: state.activeConnectorId,
    windsorStatus: state.connectorStatus.windsor ?? 'available',
    busy: state.busy,
    lastToolId: tools.length ? tools[tools.length - 1].id : null,
    approvalStatus:
      approval && approval.kind === 'approval'
        ? (approval.status as SimContext['approvalStatus'])
        : 'none',
  };
}
