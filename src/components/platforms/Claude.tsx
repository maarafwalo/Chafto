import { useEffect, useRef } from 'react';
import type { Event, State } from '../../course/state';

const URL_TO_PASTE = 'https://mcp.windsor.ai/v1/sse?key=wnd_sim_8f21c4';

/** A trimmed Claude, showing only what this course actually walks through. */
export function Claude({ s, go }: { s: State; go: (e: Event) => void }) {
  const c = s.claude;
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [c.messages.length, c.busy, c.expanded]);

  return (
    <div className="pf pf-claude pf-app">
      <aside className="pf-side pf-side-claude">
        <div className="pf-side-brand">
          <span className="pf-logo" style={{ background: '#C85F3C' }}>✳</span> Claude
        </div>
        <button className="pf-side-new" onClick={() => go({ type: 'c-open-chat' })}>New chat</button>
        <div className="pf-side-label">Recents</div>
        <button className="pf-side-item" aria-current={c.screen === 'chat'} onClick={() => go({ type: 'c-open-chat' })}>
          New chat
        </button>

        <div className="pf-side-foot">
          <button className="pf-account" data-id="c-account" onClick={() => go({ type: 'c-settings' })}>
            <span className="pf-avatar-sm">M</span>
            <span>
              <strong>Marouane</strong>
              <small>Settings</small>
            </span>
          </button>
        </div>
      </aside>

      <main className="pf-main pf-main-claude">
        {c.screen === 'settings' && (
          <div className="pf-pad">
            <h2>Connectors</h2>
            <p className="pf-sub">
              Connectors let Claude use your other tools. Adding one here makes it available to your
              account — you still switch it on inside a chat.
            </p>
            {c.added ? (
              <div className="pf-row pf-row-ok">
                <span className="pf-badge" style={{ background: '#E07856' }}>❖</span>
                <div>
                  <strong>Windsor.ai</strong>
                  <small>Custom connector · 2 tools</small>
                </div>
                <span className="pf-pill pf-pill-ok">Connected</span>
              </div>
            ) : (
              <div className="pf-empty">No connectors yet.</div>
            )}
            <button className="pf-btn pf-btn-primary" data-id="c-add" onClick={() => go({ type: 'c-add-connector' })}>
              Add custom connector
            </button>
          </div>
        )}

        {c.screen === 'add-connector' && (
          <div className="pf-pad">
            <h2>Add custom connector</h2>
            <p className="pf-sub">Paste the server URL you were given.</p>
            <label className="pf-field">
              <span>Server URL</span>
              <input
                data-id="c-paste"
                value={c.url}
                placeholder="https://…"
                onChange={(e) => go({ type: 'c-url', url: e.target.value })}
                onFocus={() => !c.url && go({ type: 'c-url', url: URL_TO_PASTE })}
              />
            </label>
            <p className="pf-note">Tip: clicking the box pastes what you copied from Windsor.ai.</p>
            <button
              className="pf-btn pf-btn-primary"
              disabled={!c.url}
              onClick={() => go({ type: 'c-save-connector' })}
            >
              Add
            </button>
          </div>
        )}

        {c.screen === 'chat' && (
          <>
            <div className="pf-chat scroll">
              {c.messages.map((msg) => {
                if (msg.role === 'user') {
                  return <div className="pf-user" key={msg.id}>{msg.text}</div>;
                }
                if (msg.kind === 'permission') {
                  return (
                    <div className="pf-perm-card" key={msg.id}>
                      <strong>Allow Claude to use this tool?</strong>
                      <code>{msg.tool}</code>
                      <p>Reads your Meta Ads performance. Read-only.</p>
                      {msg.decided ? (
                        <span className="pf-pill pf-pill-ok">✓ Allowed once</span>
                      ) : (
                        <div className="pf-perm-actions">
                          <button className="pf-btn pf-btn-primary" data-id="c-allow" onClick={() => go({ type: 'c-allow' })}>
                            Allow once
                          </button>
                          <button className="pf-btn">Always allow</button>
                          <button className="pf-btn">Decline</button>
                        </div>
                      )}
                    </div>
                  );
                }
                if (msg.kind === 'tool') {
                  return (
                    <div className="pf-tool" key={msg.id} data-id="c-tool">
                      <button className="pf-tool-head" onClick={() => go({ type: 'c-expand' })}>
                        <span className="pf-tool-tag">TOOL CALL</span>
                        <span className="mono">{msg.tool}</span>
                        <span className="pf-tool-state">{msg.running ? 'running…' : c.expanded ? 'hide' : 'inspect'}</span>
                      </button>
                      {c.expanded && !msg.running && (
                        <div className="pf-tool-body">
                          <pre className="pf-code">{msg.args}</pre>
                          {msg.columns && (
                            <table className="pf-table">
                              <thead>
                                <tr>{msg.columns.map((h) => <th key={h}>{h}</th>)}</tr>
                              </thead>
                              <tbody>
                                {msg.rows?.map((r) => (
                                  <tr key={r[0]}>{r.map((cell, i) => <td key={i}>{cell}</td>)}</tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                          <p className="pf-note">{msg.note}</p>
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <div className="pf-ai" key={msg.id}>
                    <span className="pf-ai-mark">✳</span>
                    <div>
                      <p>{msg.text}</p>
                      {msg.evidence && (
                        <div className="pf-evidence">
                          {msg.evidence.map((x) => <span key={x}>{x}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {c.busy && <div className="pf-ai"><span className="pf-ai-mark">✳</span><div className="pf-dots"><i /><i /><i /></div></div>}
              <div ref={endRef} />
            </div>

            <div className="pf-composer-wrap">
              <div className="pf-composer">
                <textarea
                  data-id="c-input"
                  rows={2}
                  value={c.composer}
                  placeholder="How can I help you today?"
                  disabled={c.busy}
                  onChange={(e) => go({ type: 'c-composer', text: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && c.composer.trim()) {
                      e.preventDefault();
                      go({ type: 'c-send', text: c.composer.trim() });
                    }
                  }}
                />
                <div className="pf-composer-row">
                  <button className="pf-chip" data-id="c-tools" onClick={() => go({ type: 'c-menu', menu: c.menu === 'tools' ? 'none' : 'tools' })}>
                    Search and tools {c.enabled && <b>1</b>}
                  </button>
                  <span style={{ flex: 1 }} />
                  <button
                    className="pf-send"
                    disabled={!c.composer.trim() || c.busy}
                    onClick={() => go({ type: 'c-send', text: c.composer.trim() })}
                  >
                    ↑
                  </button>
                </div>
              </div>

              {c.menu === 'tools' && (
                <div className="pf-menu">
                  <div className="pf-menu-label">Connectors — this chat</div>
                  {c.added ? (
                    <button className="pf-menu-row" data-id="c-toggle" onClick={() => go({ type: 'c-enable' })}>
                      <span className="pf-badge pf-badge-sm" style={{ background: '#E07856' }}>❖</span>
                      <span>Windsor.ai<small>2 tools</small></span>
                      <span className={`pf-switch ${c.enabled ? 'pf-switch-on' : ''}`} />
                    </button>
                  ) : (
                    <p className="pf-menu-empty">No connectors on your account yet.</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
