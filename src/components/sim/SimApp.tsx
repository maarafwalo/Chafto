import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { DeviceMode, SimEvent, SimState } from '../../engine/types';
import { Conversation } from './Conversation';
import { AuthSheet, CatalogSheet, ConnectorDetail, ConnectorsScreen } from './Connectors';
import { connectorById } from '../../data/connectors';

const SCREEN_TITLES: Record<SimState['screen'], string> = {
  chat: 'Conversation',
  connectors: 'Connectors',
  'connector-detail': 'Connector',
  files: 'Files',
  settings: 'Settings',
};

/* ------------------------------------------------------------------ */
/* Scale-to-fit. Keeps the simulated device intact on small viewports  */
/* while leaving real DOM rects correct, so the spotlight still lands. */
/* ------------------------------------------------------------------ */

function Fit({
  w,
  h,
  fill = false,
  minScale = 0,
  children,
}: {
  w: number;
  h: number;
  /** Grow into spare room rather than letterboxing (desktop shell wants this). */
  fill?: boolean;
  /** Never shrink past this, scroll instead — legibility beats fitting. */
  minScale?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [box, setBox] = useState({ w, h });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const s = Math.max(minScale, Math.min(1, r.width / w, r.height / h));
      setScale(s);
      // At scale 1 the shell can stretch into whatever room is left over;
      // once it is shrinking, it keeps its designed proportions.
      setBox(fill ? { w: Math.max(w, r.width / s), h: Math.max(h, r.height / s) } : { w, h });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h, fill, minScale]);

  return (
    <div ref={ref} className="sim-fit scroll" style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      {/* Outer box reserves the *scaled* size so scrolling works; the inner box
          keeps its design size and is transformed down onto it. */}
      <div style={{ width: box.w * scale, height: box.h * scale, margin: 'auto', flex: '0 0 auto' }}>
        <div
          style={{
            width: box.w,
            height: box.h,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

function Composer({
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
      <div className="composer-row">
        {device === 'phone' ? (
          <button
            className="round-btn"
            data-sim-id="phone-plus"
            aria-label="More options"
            onClick={() => emit({ type: 'open-sheet', payload: { sheet: 'plus' } })}
          >
            +
          </button>
        ) : (
          <button
            className="round-btn"
            data-sim-id="desktop-attach"
            aria-label="Attach a file"
            onClick={() => emit({ type: 'attach-file', payload: { name: 'q3-report.csv', meta: 'Simulated · 12 KB' } })}
          >
            ⎗
          </button>
        )}
        <textarea
          className="composer-input"
          data-sim-id="composer-input"
          rows={1}
          value={sim.composer}
          placeholder={sim.busy ? 'Working…' : 'Message the assistant…'}
          disabled={sim.busy}
          onChange={(e) => setComposer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button
          className="round-btn round-btn-send"
          data-sim-id="composer-send"
          aria-label="Send message"
          disabled={!sim.composer.trim() || sim.busy}
          onClick={send}
        >
          ↑
        </button>
      </div>
      <p className="composer-hint">Simulated assistant · responses are pre-written, nothing leaves your browser</p>
    </div>
  );
}

function FilesScreen({ sim, emit }: { sim: SimState; emit: (e: SimEvent) => void }) {
  return (
    <div className="pad">
      <p className="conn-blurb" style={{ marginBottom: 14 }}>
        Files you attach live in the conversation. The assistant can read them — it cannot reach
        anything you have not given it.
      </p>
      <div className="section-title">In this conversation ({sim.files.length})</div>
      {sim.files.length === 0 ? (
        <div className="empty">No files attached yet.</div>
      ) : (
        <div className="list">
          {sim.files.map((f) => (
            <div className="conn-card" key={f.id} style={{ cursor: 'default' }}>
              <span className="conn-glyph" style={{ background: '#8d8378' }} aria-hidden>
                ▤
              </span>
              <span>
                <span className="conn-name" style={{ display: 'block' }}>
                  {f.name}
                </span>
                <span className="conn-blurb">{f.meta}</span>
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="section">
        <button
          className="sbtn sbtn-block"
          data-sim-id="btn-upload"
          onClick={() => emit({ type: 'attach-file', payload: { name: 'campaign-notes.csv', meta: 'Simulated · 8 KB' } })}
        >
          ⎗ Attach a simulated file
        </button>
      </div>
    </div>
  );
}

function SettingsScreen({ sim, emit }: { sim: SimState; emit: (e: SimEvent) => void }) {
  const windsor = connectorById('windsor');
  return (
    <div className="pad">
      <div className="section-title">Tool permissions</div>
      <p className="conn-blurb" style={{ marginBottom: 10 }}>
        Every tool can be switched off independently. This is the difference between an assistant
        that can read your data and one that can act on it.
      </p>
      {windsor.tools.map((t) => (
        <div className="tool-row" key={t.name}>
          <div style={{ minWidth: 0 }}>
            <code>{t.name}</code>
            <small>{t.description}</small>
          </div>
          <button
            className="switch"
            role="switch"
            aria-checked={sim.permissions[t.name] !== false}
            aria-label={`Allow ${t.name}`}
            data-sim-id={`setting-${t.name}`}
            onClick={() =>
              emit({ type: 'toggle-permission', payload: { key: t.name, value: sim.permissions[t.name] === false } })
            }
          />
        </div>
      ))}
      <div className="section">
        <div className="section-title">Approvals</div>
        <div className="tool-row">
          <div>
            <code>require_human_approval</code>
            <small>Actions that spend money or change live systems stop and ask you first.</small>
          </div>
          <button className="switch" role="switch" aria-checked="true" aria-label="Require approval (locked on)" disabled />
        </div>
        <p className="conn-blurb" style={{ marginTop: 8 }}>
          Locked on for this simulation — turning it off is exactly the decision this mission is
          teaching you to think about.
        </p>
      </div>
    </div>
  );
}

function ScreenBody({
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
  if (sim.screen === 'chat') {
    return (
      <div className="sim-screen">
        <div className="sim-scroll scroll">
          <Conversation sim={sim} emit={emit} />
        </div>
        <Composer sim={sim} emit={emit} setComposer={setComposer} device={device} />
      </div>
    );
  }
  return (
    <div className="sim-screen">
      <div className="sim-scroll scroll">
        {sim.screen === 'connectors' && <ConnectorsScreen sim={sim} emit={emit} />}
        {sim.screen === 'connector-detail' && <ConnectorDetail sim={sim} emit={emit} />}
        {sim.screen === 'files' && <FilesScreen sim={sim} emit={emit} />}
        {sim.screen === 'settings' && <SettingsScreen sim={sim} emit={emit} />}
      </div>
    </div>
  );
}

function Sheets({ sim, emit }: { sim: SimState; emit: (e: SimEvent) => void }) {
  if (sim.sheet === 'catalog') return <CatalogSheet sim={sim} emit={emit} />;
  if (sim.sheet === 'auth') return <AuthSheet sim={sim} emit={emit} />;
  if (sim.sheet === 'plus') {
    return (
      <div className="sim-overlay" onClick={() => emit({ type: 'close-sheet' })}>
        <div className="sheet" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-grab" />
          <div className="sheet-body">
            <button
              className="menu-item"
              data-sim-id="sheet-connectors"
              onClick={() => emit({ type: 'open-screen', payload: { screen: 'connectors' } })}
            >
              <span className="menu-glyph" aria-hidden>
                ⇄
              </span>
              <span>
                Connectors
                <br />
                <span className="conn-blurb">Give the assistant access to a service</span>
              </span>
            </button>
            <button
              className="menu-item"
              data-sim-id="sheet-files"
              onClick={() => emit({ type: 'attach-file', payload: { name: 'campaign-notes.csv', meta: 'Simulated · 8 KB' } })}
            >
              <span className="menu-glyph" aria-hidden>
                ⎗
              </span>
              <span>
                Attach a file
                <br />
                <span className="conn-blurb">Add a simulated file to this conversation</span>
              </span>
            </button>
            <button
              className="menu-item"
              data-sim-id="sheet-settings"
              onClick={() => emit({ type: 'open-screen', payload: { screen: 'settings' } })}
            >
              <span className="menu-glyph" aria-hidden>
                ⚙
              </span>
              <span>
                Settings
                <br />
                <span className="conn-blurb">Tool permissions and approvals</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Shells                                                              */
/* ------------------------------------------------------------------ */

const NAV = [
  { screen: 'chat' as const, label: 'Chat', glyph: '✳', id: 'nav-chat' },
  { screen: 'files' as const, label: 'Files', glyph: '▤', id: 'nav-files' },
  { screen: 'connectors' as const, label: 'Connectors', glyph: '⇄', id: 'nav-connectors' },
  { screen: 'settings' as const, label: 'Settings', glyph: '⚙', id: 'nav-settings' },
];

interface ShellProps {
  sim: SimState;
  emit: (e: SimEvent) => void;
  setComposer: (t: string) => void;
}

function DesktopShell({ sim, emit, setComposer }: ShellProps) {
  const connectedCount = Object.values(sim.connectorStatus).filter((s) => s === 'connected').length;
  return (
    <div className="dsk">
      <div className="dsk-outer">
        <div className="dsk-chrome">
          <span className="dsk-dot" />
          <span className="dsk-dot" />
          <span className="dsk-dot" />
          <span className="dsk-url mono">simulated.local/assistant</span>
        </div>
        <div className="dsk-body">
          <aside className="dsk-rail">
            <div className="sim-brand">
              <span className="sim-mark" aria-hidden>
                ✳
              </span>
              <span>
                <span className="sim-brand-name" style={{ display: 'block' }}>
                  Assistant
                </span>
                <span className="sim-brand-sub">Simulated</span>
              </span>
            </div>
            {NAV.map((n) => (
              <button
                key={n.id}
                className="rail-item"
                data-sim-id={n.id}
                aria-current={
                  sim.screen === n.screen || (n.screen === 'connectors' && sim.screen === 'connector-detail')
                }
                onClick={() => emit({ type: 'open-screen', payload: { screen: n.screen } })}
              >
                <span className="rail-glyph" aria-hidden>
                  {n.glyph}
                </span>
                {n.label}
                {n.screen === 'connectors' && connectedCount > 0 && (
                  <span className="rail-badge">{connectedCount}</span>
                )}
              </button>
            ))}
            <div className="rail-sep" />
            <div className="rail-item" style={{ cursor: 'default', fontSize: 11.5 }}>
              <span className="rail-glyph" aria-hidden>
                ◷
              </span>
              Recent conversation
            </div>
            <div className="rail-foot">
              <span className="rail-avatar" aria-hidden>
                YOU
              </span>
              <span style={{ fontSize: 12, color: 'var(--sim-ink-2)' }}>Learner workspace</span>
            </div>
          </aside>

          <main className="dsk-main">
            <header className="sim-head">
              <div>
                <div className="sim-title">{SCREEN_TITLES[sim.screen]}</div>
                <div className="sim-sub">
                  {sim.screen === 'chat'
                    ? connectedCount > 0
                      ? `${connectedCount} connector active`
                      : 'No connectors — the assistant can only see this conversation'
                    : 'Simulated workspace'}
                </div>
              </div>
              <span className="sim-badge">SIMULATED ENVIRONMENT</span>
            </header>
            <ScreenBody sim={sim} emit={emit} setComposer={setComposer} device="desktop" />
          </main>
        </div>
      </div>
    </div>
  );
}

function PhoneShell({ sim, emit, setComposer }: ShellProps) {
  return (
    <div className="phone">
      <div className="phone-pill" />
      <div className="phone-screen">
        <div className="phone-status">
          <span>9:41</span>
          <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <span aria-hidden>▮▮▮</span>
            <span aria-hidden>⏻</span>
          </span>
        </div>
        <header className="ph-top">
          {sim.screen === 'connector-detail' ? (
            <button
              className="ph-icon-btn"
              data-sim-id="phone-back"
              aria-label="Back"
              onClick={() => emit({ type: 'open-screen', payload: { screen: 'connectors' } })}
            >
              ‹
            </button>
          ) : (
            <span className="sim-mark" aria-hidden>
              ✳
            </span>
          )}
          <div style={{ minWidth: 0 }}>
            <div className="sim-title">{SCREEN_TITLES[sim.screen]}</div>
          </div>
          <span className="sim-badge" style={{ fontSize: 8 }}>
            SIMULATED
          </span>
        </header>
        <ScreenBody sim={sim} emit={emit} setComposer={setComposer} device="phone" />
        <nav className="ph-tabs">
          {NAV.map((n) => (
            <button
              key={n.id}
              className="ph-tab"
              data-sim-id={`tab-${n.screen}`}
              aria-current={
                sim.screen === n.screen || (n.screen === 'connectors' && sim.screen === 'connector-detail')
              }
              onClick={() => emit({ type: 'open-screen', payload: { screen: n.screen } })}
            >
              <span aria-hidden>{n.glyph}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <Sheets sim={sim} emit={emit} />
        {sim.toast && <div className="sim-toast">✓ {sim.toast.text}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function SimApp({
  sim,
  emit,
  setComposer,
  device,
}: ShellProps & { device: DeviceMode }) {
  return (
    <div className="sim-stage" data-device={device} id="sim-stage">
      {device === 'phone' ? (
        <Fit w={372} h={748}>
          <PhoneShell sim={sim} emit={emit} setComposer={setComposer} />
        </Fit>
      ) : (
        <Fit w={940} h={620} fill minScale={0.62}>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <DesktopShell sim={sim} emit={emit} setComposer={setComposer} />
            <Sheets sim={sim} emit={emit} />
            {sim.toast && <div className="sim-toast">✓ {sim.toast.text}</div>}
          </div>
        </Fit>
      )}
    </div>
  );
}
