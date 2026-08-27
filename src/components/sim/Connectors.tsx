import type { ConnectorDef, SimEvent, SimState } from '../../engine/types';
import { CONNECTORS, connectorById } from '../../data/connectors';

const statusPill = (status: string) => {
  if (status === 'connected') return <span className="pill pill-ok">Connected</span>;
  if (status === 'connecting') return <span className="pill pill-warn">Authorising…</span>;
  return <span className="pill">Not connected</span>;
};

function ConnectorRow({
  connector,
  status,
  onClick,
}: {
  connector: ConnectorDef;
  status: string;
  onClick: () => void;
}) {
  return (
    <button className="conn-card" data-sim-id={`connector-card-${connector.id}`} onClick={onClick}>
      <span className="conn-glyph" style={{ background: connector.tint }} aria-hidden>
        {connector.glyph}
      </span>
      <span style={{ minWidth: 0 }}>
        <span className="conn-name" style={{ display: 'block' }}>
          {connector.name}
        </span>
        <span className="conn-blurb" style={{ display: 'block' }}>
          {connector.blurb}
        </span>
      </span>
      <span className="conn-state">{statusPill(status)}</span>
    </button>
  );
}

/** The list of what is currently wired up, plus the way to add more. */
export function ConnectorsScreen({ sim, emit }: { sim: SimState; emit: (e: SimEvent) => void }) {
  const connected = CONNECTORS.filter((c) => sim.connectorStatus[c.id] === 'connected');

  return (
    <div className="pad">
      <p className="conn-blurb" style={{ marginBottom: 14 }}>
        Connectors give the assistant access to services outside this conversation. It can only use
        what you connect, and only the tools you leave switched on.
      </p>

      <div className="section-title">Connected ({connected.length})</div>
      {connected.length === 0 ? (
        <div className="empty">
          Nothing connected yet.
          <br />
          The assistant can only see this conversation.
        </div>
      ) : (
        <div className="list">
          {connected.map((c) => (
            <ConnectorRow
              key={c.id}
              connector={c}
              status="connected"
              onClick={() => emit({ type: 'select-connector', payload: { id: c.id } })}
            />
          ))}
        </div>
      )}

      <div className="section">
        <button
          className="sbtn sbtn-primary sbtn-block"
          data-sim-id="btn-add-connector"
          onClick={() => emit({ type: 'open-sheet', payload: { sheet: 'catalog' } })}
        >
          + Add connector
        </button>
      </div>
    </div>
  );
}

/** Everything on offer. Choosing the right one is a real decision. */
export function CatalogSheet({ sim, emit }: { sim: SimState; emit: (e: SimEvent) => void }) {
  return (
    <div className="sim-overlay" onClick={() => emit({ type: 'close-sheet' })}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab" />
        <div className="sheet-head">
          <div className="sheet-title">Add a connector</div>
          <div className="sheet-sub">Each one opens exactly one service. Pick the one that holds your data.</div>
        </div>
        <div className="sheet-body scroll">
          <div className="list">
            {CONNECTORS.map((c) => (
              <ConnectorRow
                key={c.id}
                connector={c}
                status={sim.connectorStatus[c.id]}
                onClick={() => emit({ type: 'select-connector', payload: { id: c.id } })}
              />
            ))}
          </div>
        </div>
        <div className="sheet-foot">
          <button className="sbtn sbtn-ghost" onClick={() => emit({ type: 'close-sheet' })}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/** One connector: what it is, what it would let the model do, and the switch. */
export function ConnectorDetail({ sim, emit }: { sim: SimState; emit: (e: SimEvent) => void }) {
  const connector = connectorById(sim.activeConnectorId ?? 'windsor');
  const status = sim.connectorStatus[connector.id];

  return (
    <div className="pad">
      <div className="detail-hero">
        <span className="conn-glyph" style={{ background: connector.tint, width: 44, height: 44, fontSize: 20 }} aria-hidden>
          {connector.glyph}
        </span>
        <div>
          <div className="detail-name">{connector.name}</div>
          <div className="conn-blurb">
            {connector.category} · {connector.blurb}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>{statusPill(status)}</div>
      </div>

      <div className="section">
        <div className="section-title">Tools this gives the assistant</div>
        {connector.tools.map((t) => (
          <div className="tool-row" key={t.name}>
            <div style={{ minWidth: 0 }}>
              <code>{t.name}</code>
              <small>{t.description}</small>
            </div>
            {status === 'connected' && (
              <button
                className="switch"
                role="switch"
                aria-checked={sim.permissions[t.name] !== false}
                aria-label={`Allow ${t.name}`}
                data-sim-id={`perm-${t.name}`}
                onClick={() =>
                  emit({
                    type: 'toggle-permission',
                    payload: { key: t.name, value: sim.permissions[t.name] === false },
                  })
                }
              />
            )}
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-title">Permissions requested</div>
        {connector.scopes.map((s) => (
          <div className="scope-row" key={s}>
            <span className="scope-tick" aria-hidden>
              ✓
            </span>
            {s}
          </div>
        ))}
      </div>

      <div className="section">
        {status === 'connected' ? (
          <button
            className="sbtn sbtn-block"
            data-sim-id="btn-disconnect"
            onClick={() => emit({ type: 'disconnect-connector', payload: { id: connector.id } })}
          >
            Disconnect {connector.name}
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

/** The simulated authorisation handshake. */
export function AuthSheet({ sim, emit }: { sim: SimState; emit: (e: SimEvent) => void }) {
  const connector = connectorById(sim.activeConnectorId ?? 'windsor');
  return (
    <div className="sim-overlay">
      <div className="sheet" style={{ maxWidth: 380 }}>
        <div className="sheet-grab" />
        <div className="sheet-head">
          <div className="auth-brandline">
            <span className="sim-mark" aria-hidden>
              ✳
            </span>
            <span className="auth-link" />
            <span className="conn-glyph" style={{ background: connector.tint }} aria-hidden>
              {connector.glyph}
            </span>
          </div>
          <div className="sheet-title" style={{ textAlign: 'center' }}>
            Allow access to {connector.name}?
          </div>
          <div className="sheet-sub" style={{ textAlign: 'center' }}>
            Simulated authorisation — no account is contacted.
          </div>
        </div>
        <div className="sheet-body">
          <div className="section-title">The assistant will be able to</div>
          {connector.scopes.map((s) => (
            <div className="scope-row" key={s}>
              <span className="scope-tick" aria-hidden>
                ✓
              </span>
              {s}
            </div>
          ))}
          <p className="conn-blurb" style={{ marginTop: 12 }}>
            You can switch individual tools off at any time, and revoke the whole connector in one click.
          </p>
        </div>
        <div className="sheet-foot">
          <button className="sbtn sbtn-ghost" onClick={() => emit({ type: 'close-sheet' })}>
            Cancel
          </button>
          <button
            className="sbtn sbtn-primary"
            data-sim-id="btn-authorize"
            onClick={() => emit({ type: 'authorize-connector', payload: { id: connector.id } })}
          >
            Authorise access
          </button>
        </div>
      </div>
    </div>
  );
}
