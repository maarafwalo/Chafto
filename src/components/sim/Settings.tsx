import type { SettingsSection, SimEvent, SimState } from '../../engine/types';
import { CONNECTORS, connectorById } from '../../data/connectors';

const SECTIONS: { id: SettingsSection; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'connectors', label: 'Connectors' },
];

const statusPill = (status: string) => {
  if (status === 'connected') return <span className="pill pill-ok">Connected</span>;
  if (status === 'connecting') return <span className="pill pill-warn">Connecting…</span>;
  return <span className="pill">Not connected</span>;
};

/**
 * Settings, reached from the account chip in the lower-left — the same route as
 * the real apps. Connectors are a section in here, not a place you navigate to
 * from the sidebar.
 */
export function SettingsScreen({ sim, emit }: { sim: SimState; emit: (e: SimEvent) => void }) {
  const connected = CONNECTORS.filter((c) => sim.connectorStatus[c.id] === 'connected');

  return (
    <div className="settings">
      <nav className="settings-nav">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className="settings-tab"
            aria-current={sim.settingsSection === s.id}
            data-sim-id={`settings-tab-${s.id}`}
            onClick={() => emit({ type: 'open-settings', payload: { section: s.id } })}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className="settings-body scroll">
        {sim.settingsSection === 'connectors' && (
          <div className="pad">
            <h3 className="settings-h">Connectors</h3>
            <p className="conn-blurb" style={{ marginBottom: 16 }}>
              Connectors let Claude work with your other tools and data. Adding one here makes it
              available to your account — you still switch it on inside a conversation before Claude
              can use it.
            </p>

            <div className="section-title">Your connectors ({connected.length})</div>
            {connected.length === 0 ? (
              <div className="empty">
                No connectors yet. Browse the directory to add one.
              </div>
            ) : (
              <div className="list">
                {connected.map((c) => (
                  <button
                    key={c.id}
                    className="conn-card"
                    data-sim-id={`connector-card-${c.id}`}
                    onClick={() => emit({ type: 'select-connector', payload: { id: c.id } })}
                  >
                    <span className="conn-glyph" style={{ background: c.tint }} aria-hidden>
                      {c.glyph}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span className="conn-name" style={{ display: 'block' }}>{c.name}</span>
                      <span className="conn-blurb">{c.tools.length} tools available</span>
                    </span>
                    <span className="conn-state">{statusPill('connected')}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="section">
              <button
                className="sbtn sbtn-block"
                data-sim-id="btn-browse-connectors"
                onClick={() => emit({ type: 'open-menu', payload: { menu: 'directory' } })}
              >
                Browse connectors
              </button>
            </div>
          </div>
        )}

        {sim.settingsSection === 'capabilities' && (
          <div className="pad">
            <h3 className="settings-h">Capabilities</h3>
            <p className="conn-blurb" style={{ marginBottom: 14 }}>
              Features that change what Claude can produce. These apply everywhere, unlike the
              per-conversation switches in the composer.
            </p>
            {[
              { key: 'artifacts', label: 'Artifacts', hint: 'Let Claude build documents and apps in a side panel' },
              { key: 'webSearch', label: 'Web search', hint: 'Search the web by default in new chats' },
            ].map((c) => (
              <div className="tool-row" key={c.key}>
                <div style={{ minWidth: 0 }}>
                  <code>{c.label}</code>
                  <small>{c.hint}</small>
                </div>
                <button
                  className="switch"
                  role="switch"
                  aria-checked={!!sim.capabilities[c.key]}
                  aria-label={c.label}
                  data-sim-id={`capability-${c.key}`}
                  onClick={() =>
                    emit({ type: 'toggle-capability', payload: { key: c.key, on: !sim.capabilities[c.key] } })
                  }
                />
              </div>
            ))}
          </div>
        )}

        {sim.settingsSection === 'profile' && (
          <div className="pad">
            <h3 className="settings-h">Profile</h3>
            <div className="tool-row">
              <div>
                <code>Learner workspace</code>
                <small>Simulated account — nothing here is real</small>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** The connector directory, opened by "Browse connectors". */
export function DirectorySheet({ sim, emit }: { sim: SimState; emit: (e: SimEvent) => void }) {
  return (
    <div className="sim-overlay" onClick={() => emit({ type: 'close-menu' })}>
      <div className="sheet sheet-lg" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab" />
        <div className="sheet-head">
          <div className="sheet-title">Connector directory</div>
          <div className="sheet-sub">
            Each connector opens exactly one service. Pick the one that holds your data.
          </div>
        </div>
        <div className="sheet-body scroll">
          <div className="list">
            {CONNECTORS.map((c) => {
              const status = sim.connectorStatus[c.id];
              return (
                <div className="conn-card" key={c.id}>
                  <span className="conn-glyph" style={{ background: c.tint }} aria-hidden>
                    {c.glyph}
                  </span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span className="conn-name" style={{ display: 'block' }}>{c.name}</span>
                    <span className="conn-blurb">{c.category} · {c.blurb}</span>
                  </span>
                  <button
                    className={status === 'connected' ? 'sbtn' : 'sbtn sbtn-primary'}
                    data-sim-id={`connector-card-${c.id}`}
                    disabled={status === 'connected'}
                    onClick={() => emit({ type: 'select-connector', payload: { id: c.id } })}
                  >
                    {status === 'connected' ? 'Added' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="sheet-foot">
          <button className="sbtn sbtn-ghost" onClick={() => emit({ type: 'close-menu' })}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/** One connector's page: what it exposes, and the switch. */
export function ConnectorDetail({ sim, emit }: { sim: SimState; emit: (e: SimEvent) => void }) {
  const connector = connectorById(sim.activeConnectorId ?? 'windsor');
  const status = sim.connectorStatus[connector.id];
  const inChat = sim.chatConnectors.includes(connector.id);

  return (
    <div className="pad">
      <button
        className="back-link"
        data-sim-id="back-to-settings"
        onClick={() => emit({ type: 'open-settings', payload: { section: 'connectors' } })}
      >
        ‹ Connectors
      </button>

      <div className="detail-hero">
        <span className="conn-glyph" style={{ background: connector.tint, width: 44, height: 44, fontSize: 20 }} aria-hidden>
          {connector.glyph}
        </span>
        <div>
          <div className="detail-name">{connector.name}</div>
          <div className="conn-blurb">{connector.category} · {connector.blurb}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>{statusPill(status)}</div>
      </div>

      <div className="section">
        <div className="section-title">Tools this connector provides</div>
        {connector.tools.map((t) => (
          <div className="tool-row" key={t.name}>
            <div style={{ minWidth: 0 }}>
              <code>{t.name}</code>
              <small>{t.description}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-title">Permissions requested</div>
        {connector.scopes.map((s) => (
          <div className="scope-row" key={s}>
            <span className="scope-tick" aria-hidden>✓</span>
            {s}
          </div>
        ))}
      </div>

      {status === 'connected' && (
        <div className="section">
          <div className="callout-sim" data-state={inChat ? 'ok' : 'warn'}>
            {inChat
              ? '✓ Switched on in your current conversation.'
              : 'Added to your account, but not switched on in any conversation yet. Open Search and tools in the composer to enable it where you need it.'}
          </div>
        </div>
      )}

      <div className="section">
        {status === 'connected' ? (
          <button
            className="sbtn sbtn-block"
            data-sim-id="btn-disconnect"
            onClick={() => emit({ type: 'disconnect-connector', payload: { id: connector.id } })}
          >
            Remove {connector.name}
          </button>
        ) : (
          <button
            className="sbtn sbtn-primary sbtn-block"
            data-sim-id="btn-connect"
            onClick={() => emit({ type: 'connect-connector', payload: { id: connector.id } })}
          >
            Connect {connector.name}
          </button>
        )}
      </div>
    </div>
  );
}

/** The simulated OAuth handshake. */
export function AuthSheet({ sim, emit }: { sim: SimState; emit: (e: SimEvent) => void }) {
  const connector = connectorById(sim.activeConnectorId ?? 'windsor');
  return (
    <div className="sim-overlay">
      <div className="sheet" style={{ maxWidth: 380 }}>
        <div className="sheet-grab" />
        <div className="sheet-head">
          <div className="auth-brandline">
            <span className="sim-mark" aria-hidden>✳</span>
            <span className="auth-link" />
            <span className="conn-glyph" style={{ background: connector.tint }} aria-hidden>
              {connector.glyph}
            </span>
          </div>
          <div className="sheet-title" style={{ textAlign: 'center' }}>
            Connect {connector.name} to Claude?
          </div>
          <div className="sheet-sub" style={{ textAlign: 'center' }}>
            Simulated authorisation — no account is contacted.
          </div>
        </div>
        <div className="sheet-body">
          <div className="section-title">Claude will be able to</div>
          {connector.scopes.map((s) => (
            <div className="scope-row" key={s}>
              <span className="scope-tick" aria-hidden>✓</span>
              {s}
            </div>
          ))}
          <p className="conn-blurb" style={{ marginTop: 12 }}>
            You can remove this connector at any time, and it only works in conversations where you
            switch it on.
          </p>
        </div>
        <div className="sheet-foot">
          <button className="sbtn sbtn-ghost" onClick={() => emit({ type: 'close-menu' })}>
            Cancel
          </button>
          <button
            className="sbtn sbtn-primary"
            data-sim-id="btn-authorize"
            onClick={() => emit({ type: 'authorize-connector', payload: { id: connector.id } })}
          >
            Allow access
          </button>
        </div>
      </div>
    </div>
  );
}
