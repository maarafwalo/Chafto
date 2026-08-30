import type { PlatformId } from './types';

/** One message in the simulated Claude conversation. */
export type Msg =
  | { id: string; role: 'user'; kind: 'text'; text: string }
  | { id: string; role: 'assistant'; kind: 'text'; text: string; evidence?: string[] }
  | { id: string; role: 'assistant'; kind: 'permission'; tool: string; decided: boolean }
  | {
      id: string;
      role: 'assistant';
      kind: 'tool';
      tool: string;
      args: string;
      running: boolean;
      rows?: string[][];
      columns?: string[];
      note?: string;
    };

export interface State {
  platform: PlatformId;

  windsor: {
    screen: 'landing' | 'signup' | 'sources' | 'api';
    signedIn: boolean;
    metaConnected: boolean;
    copied: boolean;
  };

  meta: {
    screen: 'login' | 'accounts' | 'permissions' | 'done';
    account: string | null;
  };

  claude: {
    screen: 'chat' | 'settings' | 'add-connector';
    menu: 'none' | 'tools' | 'account';
    url: string;
    added: boolean;
    enabled: boolean;
    messages: Msg[];
    composer: string;
    busy: boolean;
    expanded: boolean;
  };
}

export const initialState = (): State => ({
  platform: 'windsor',
  windsor: { screen: 'landing', signedIn: false, metaConnected: false, copied: false },
  meta: { screen: 'login', account: null },
  claude: {
    screen: 'chat',
    menu: 'none',
    url: '',
    added: false,
    enabled: false,
    messages: [
      { id: 'm0', role: 'assistant', kind: 'text', text: 'What are we working on?' },
    ],
    composer: '',
    busy: false,
    expanded: false,
  },
});

export type Event = { type: string; [k: string]: unknown };

/** The whole simulation, in one place. No engine, no indirection. */
export function reduce(s: State, e: Event): State {
  const w = s.windsor;
  const m = s.meta;
  const c = s.claude;

  switch (e.type) {
    /* ---------------- Windsor.ai ---------------- */
    case 'w-start-trial':
      return { ...s, windsor: { ...w, screen: 'signup' } };
    case 'w-create-account':
      return { ...s, windsor: { ...w, screen: 'sources', signedIn: true } };
    case 'w-add-source':
      return { ...s, windsor: { ...w, screen: 'sources' } };
    case 'w-pick-meta':
      // Choosing Meta hands you off to Facebook's consent flow — the real jump.
      return { ...s, platform: 'meta', meta: { ...m, screen: 'login' } };
    case 'w-open-api':
      return { ...s, windsor: { ...w, screen: 'api' } };
    case 'w-copy-url':
      return { ...s, windsor: { ...w, copied: true } };

    /* ---------------- Meta ---------------- */
    case 'm-continue':
      return { ...s, meta: { ...m, screen: 'accounts' } };
    case 'm-pick-account':
      return { ...s, meta: { ...m, screen: 'permissions', account: String(e.account) } };
    case 'm-save':
      return {
        ...s,
        platform: 'windsor',
        meta: { ...m, screen: 'done' },
        windsor: { ...w, metaConnected: true, screen: 'sources' },
      };

    /* ---------------- Claude ---------------- */
    case 'go-claude':
      return { ...s, platform: 'claude' };
    case 'c-menu':
      return { ...s, claude: { ...c, menu: e.menu as State['claude']['menu'] } };
    case 'c-settings':
      return { ...s, claude: { ...c, screen: 'settings', menu: 'none' } };
    case 'c-add-connector':
      return { ...s, claude: { ...c, screen: 'add-connector' } };
    case 'c-url':
      return { ...s, claude: { ...c, url: String(e.url) } };
    case 'c-save-connector':
      return { ...s, claude: { ...c, added: true, screen: 'settings' } };
    case 'c-open-chat':
      return { ...s, claude: { ...c, screen: 'chat', menu: 'none' } };
    case 'c-enable':
      return { ...s, claude: { ...c, enabled: true } };
    case 'c-composer':
      return { ...s, claude: { ...c, composer: String(e.text) } };
    case 'c-send':
      return {
        ...s,
        claude: {
          ...c,
          composer: '',
          menu: 'none',
          messages: [
            ...c.messages,
            { id: `u${c.messages.length}`, role: 'user', kind: 'text', text: String(e.text) },
          ],
        },
      };
    case 'c-allow':
      return {
        ...s,
        claude: {
          ...c,
          messages: c.messages.map((x) => (x.kind === 'permission' ? { ...x, decided: true } : x)),
        },
      };
    case 'c-expand':
      return { ...s, claude: { ...c, expanded: !c.expanded } };

    /* ---------------- scripted ---------------- */
    case 'push':
      return { ...s, claude: { ...c, messages: [...c.messages, e.message as Msg] } };
    case 'patch':
      return {
        ...s,
        claude: {
          ...c,
          messages: c.messages.map((x) => (x.id === e.id ? ({ ...x, ...(e.patch as object) } as Msg) : x)),
        },
      };
    case 'busy':
      return { ...s, claude: { ...c, busy: e.busy === true } };

    default:
      return s;
  }
}
