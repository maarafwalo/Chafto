import type { DeviceMode, SimEvent, SimState } from '../../engine/types';
import { CONNECTORS } from '../../data/connectors';

const MODELS = [
  { id: 'Claude Opus 5', blurb: 'Most capable — for hard reasoning and long tasks' },
  { id: 'Claude Sonnet 5', blurb: 'Balanced — the everyday default' },
  { id: 'Claude Haiku 4.5', blurb: 'Fastest — for simple, high-volume work' },
];

const TOOL_TOGGLES = [
  { key: 'webSearch', label: 'Web search', hint: 'Let Claude look things up as it answers' },
  { key: 'extendedThinking', label: 'Extended thinking', hint: 'Reason step by step before replying' },
  { key: 'research', label: 'Research', hint: 'Multi-source investigation, returns a report' },
];

/**
 * The composer, matching the real Claude apps: a text area with a row beneath
 * it holding the + (attachments and connectors), the Search-and-tools menu, the
 * model selector, and send.
 *
 * The Search-and-tools menu is where connectors get switched on *for this
 * conversation* — a separate act from adding them to the account, and the step
 * people most often miss.
 */
export function Composer({
  sim,
  emit,
  setComposer,
  device,
}: {
  sim: SimState;
  emit: (e: SimEvent) => void;
  setComposer: (t: string) => void;
  device: DeviceMode;
}) {
  const send = () => {
    const text = sim.composer.trim();
    if (!text || sim.busy) return;
    emit({ type: 'send-message', payload: { text } });
  };

  return (
    <div className="composer">
      {sim.suggestions.length > 0 && (
        <div className="suggestions">
          {sim.suggestions.map((s) => (
            <button
              key={s.id}
              className="suggestion"
              data-sim-id={`suggestion-${s.id}`}
              onClick={() => emit({ type: 'use-suggestion', payload: { id: s.id, text: s.text } })}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div className="cbox">
        <textarea
          className="composer-input"
          data-sim-id="composer-input"
          rows={device === 'phone' ? 1 : 2}
          value={sim.composer}
          placeholder={sim.busy ? 'Claude is working…' : 'How can I help you today?'}
          disabled={sim.busy}
          onChange={(e) => setComposer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />

        <div className="cbox-row">
          <button
            className="cbtn cbtn-round"
            data-sim-id="composer-plus"
            aria-label="Add content"
            title="Add photos and files"
            onClick={() => emit({ type: 'open-menu', payload: { menu: 'plus' } })}
          >
            +
          </button>

          <button
            className="cbtn"
            data-sim-id="composer-tools"
            title="Search and tools"
            onClick={() => emit({ type: 'open-menu', payload: { menu: 'tools' } })}
          >
            <span className="cbtn-sliders" aria-hidden>
              <i />
              <i />
            </span>
            {device === 'desktop' && 'Search and tools'}
            {sim.chatConnectors.length > 0 && <span className="cbtn-count">{sim.chatConnectors.length}</span>}
          </button>

          <span className="cbox-spacer" />

          <button
            className="cbtn cbtn-model"
            data-sim-id="composer-model"
            onClick={() => emit({ type: 'open-menu', payload: { menu: 'account' } })}
            title="Choose a model"
          >
            {device === 'phone' ? sim.model.replace('Claude ', '') : sim.model}
            <span aria-hidden>⌄</span>
          </button>

          <button
            className="cbtn cbtn-send"
            data-sim-id="composer-send"
            aria-label="Send message"
            disabled={!sim.composer.trim() || sim.busy}
            onClick={send}
          >
            ↑
          </button>
        </div>
      </div>
      <p className="composer-hint">
        Simulated environment · responses are pre-written and nothing leaves your browser
      </p>
    </div>
  );
}

/** The + menu: attachments, and the way into connectors. */
export function PlusMenu({ emit }: { emit: (e: SimEvent) => void }) {
  return (
    <div className="menu-pop menu-pop-left">
      <button
        className="mrow"
        data-sim-id="menu-upload"
        onClick={() => emit({ type: 'attach-file', payload: { name: 'q3-performance.csv', meta: 'Simulated · 12 KB' } })}
      >
        <span className="mrow-glyph" aria-hidden>⎗</span> Upload a file
      </button>
      <button className="mrow" data-sim-id="menu-drive" onClick={() => emit({ type: 'close-menu' })}>
        <span className="mrow-glyph" aria-hidden>▲</span> Add from Drive
      </button>
      <div className="mrow-sep" />
      <button
        className="mrow"
        data-sim-id="menu-connectors"
        onClick={() => emit({ type: 'open-menu', payload: { menu: 'tools' } })}
      >
        <span className="mrow-glyph" aria-hidden>⇄</span> Connectors
        <span className="mrow-chev" aria-hidden>›</span>
      </button>
    </div>
  );
}

/**
 * Search and tools. Everything here is scoped to the current conversation —
 * which is the whole lesson.
 */
export function ToolsMenu({ sim, emit }: { sim: SimState; emit: (e: SimEvent) => void }) {
  const connected = CONNECTORS.filter((c) => sim.connectorStatus[c.id] === 'connected');
  return (
    <div className="menu-pop menu-pop-left menu-pop-wide" data-sim-id="tools-menu">
      <div className="mrow-label">Tools</div>
      {TOOL_TOGGLES.map((t) => (
        <button
          key={t.key}
          className="mrow mrow-toggle"
          data-sim-id={`tool-${t.key}`}
          onClick={() =>
            emit({ type: 'toggle-capability', payload: { key: t.key, on: !sim.capabilities[t.key] } })
          }
        >
          <span style={{ minWidth: 0 }}>
            {t.label}
            <small>{t.hint}</small>
          </span>
          <span className="switch switch-sm" role="switch" aria-checked={!!sim.capabilities[t.key]} />
        </button>
      ))}

      <div className="mrow-sep" />
      <div className="mrow-label">Connectors — this chat</div>
      {connected.length === 0 ? (
        <p className="mrow-empty">
          No connectors on your account yet. Add one and it will appear here to switch on.
        </p>
      ) : (
        connected.map((c) => {
          const on = sim.chatConnectors.includes(c.id);
          return (
            <button
              key={c.id}
              className="mrow mrow-toggle"
              data-sim-id={`chat-connector-${c.id}`}
              onClick={() => emit({ type: 'toggle-chat-connector', payload: { id: c.id, on: !on } })}
            >
              <span className="mrow-glyph" style={{ color: c.tint }} aria-hidden>
                {c.glyph}
              </span>
              <span style={{ minWidth: 0 }}>
                {c.name}
                <small>{c.tools.length} tools</small>
              </span>
              <span className="switch switch-sm" role="switch" aria-checked={on} />
            </button>
          );
        })
      )}

      <div className="mrow-sep" />
      <button
        className="mrow mrow-link"
        data-sim-id="menu-add-connectors"
        onClick={() => emit({ type: 'open-settings', payload: { section: 'connectors' } })}
      >
        <span className="mrow-glyph" aria-hidden>＋</span> Add connectors
      </button>
    </div>
  );
}

/** Model picker, anchored to the selector next to send. */
export function ModelMenu({ sim, emit }: { sim: SimState; emit: (e: SimEvent) => void }) {
  return (
    <div className="menu-pop menu-pop-right menu-pop-wide">
      <div className="mrow-label">Model</div>
      {MODELS.map((m) => (
        <button
          key={m.id}
          className="mrow"
          data-sim-id={`model-${m.id.replace(/\s+/g, '-')}`}
          aria-current={sim.model === m.id}
          onClick={() => emit({ type: 'close-menu' })}
        >
          <span style={{ minWidth: 0 }}>
            {m.id}
            <small>{m.blurb}</small>
          </span>
          {sim.model === m.id && <span className="mrow-tick" aria-hidden>✓</span>}
        </button>
      ))}
    </div>
  );
}

export { MODELS };
