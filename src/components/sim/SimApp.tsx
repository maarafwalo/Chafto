import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { DeviceMode, SimEvent, SimState } from '../../engine/types';
import { Conversation } from './Conversation';
import { Composer, ModelMenu, PlusMenu, ToolsMenu } from './Composer';
import { AuthSheet, ConnectorDetail, DirectorySheet, SettingsScreen } from './Settings';
import { InstructionsSheet, KnowledgeSheet, ProjectScreen } from './Project';
import { ArtifactPanel } from './Artifact';

/* ------------------------------------------------------------------ */
/* Scale-to-fit                                                        */
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
  fill?: boolean;
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
      setBox(fill ? { w: Math.max(w, r.width / s), h: Math.max(h, r.height / s) } : { w, h });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h, fill, minScale]);

  return (
    <div ref={ref} className="sim-fit scroll" style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <div style={{ width: box.w * scale, height: box.h * scale, margin: 'auto', flex: '0 0 auto' }}>
        <div style={{ width: box.w, height: box.h, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

interface ShellProps {
  sim: SimState;
  emit: (e: SimEvent) => void;
  setComposer: (t: string) => void;
}

function ChatPane({ sim, emit, setComposer, device }: ShellProps & { device: DeviceMode }) {
  return (
    <div className="sim-screen">
      <div className="sim-scroll scroll">
        <Conversation sim={sim} emit={emit} />
      </div>
      <div className="composer-wrap">
        <Composer sim={sim} emit={emit} setComposer={setComposer} device={device} />
        {sim.sheet === 'plus' && <PlusMenu emit={emit} />}
        {sim.sheet === 'tools' && <ToolsMenu sim={sim} emit={emit} />}
        {sim.sheet === 'account' && <ModelMenu sim={sim} emit={emit} />}
      </div>
    </div>
  );
}

function Screen({ sim, emit, setComposer, device }: ShellProps & { device: DeviceMode }) {
  if (sim.screen === 'chat') return <ChatPane sim={sim} emit={emit} setComposer={setComposer} device={device} />;
  return (
    <div className="sim-screen">
      <div className="sim-scroll scroll">
        {sim.screen === 'settings' && <SettingsScreen sim={sim} emit={emit} />}
        {sim.screen === 'connector-detail' && <ConnectorDetail sim={sim} emit={emit} />}
        {sim.screen === 'project' && <ProjectScreen sim={sim} emit={emit} />}
      </div>
    </div>
  );
}

/** Overlays that sit above the whole app rather than inside the composer. */
function Overlays({ sim, emit }: { sim: SimState; emit: (e: SimEvent) => void }) {
  return (
    <>
      {sim.sheet === 'directory' && <DirectorySheet sim={sim} emit={emit} />}
      {sim.sheet === 'auth' && <AuthSheet sim={sim} emit={emit} />}
      {sim.sheet === 'instructions' && <InstructionsSheet emit={emit} />}
      {sim.sheet === 'plus' && sim.screen === 'project' && <KnowledgeSheet sim={sim} emit={emit} />}
      {sim.toast && <div className="sim-toast">✓ {sim.toast.text}</div>}
    </>
  );
}

const SCREEN_TITLE = (sim: SimState) =>
  sim.screen === 'settings'
    ? 'Settings'
    : sim.screen === 'connector-detail'
      ? 'Connector'
      : sim.screen === 'project'
        ? (sim.project?.name ?? 'Project')
        : (sim.chats.find((c) => c.id === sim.activeChatId)?.title ?? 'New chat');

/* ------------------------------------------------------------------ */
/* Desktop shell — sidebar, conversation, artifact panel               */
/* ------------------------------------------------------------------ */

function DesktopShell({ sim, emit, setComposer }: ShellProps) {
  const recents = sim.chats.slice(0, 4);
  return (
    <div className="dsk">
      <div className="dsk-outer">
        <div className="dsk-chrome">
          <span className="dsk-dot" />
          <span className="dsk-dot" />
          <span className="dsk-dot" />
          <span className="dsk-url mono">claude.ai/chat</span>
          <span className="sim-badge">SIMULATED ENVIRONMENT</span>
        </div>

        <div className="dsk-body">
          <aside className="dsk-rail">
            <div className="sim-brand">
              <span className="sim-mark" aria-hidden>✳</span>
              <span className="sim-brand-name">Claude</span>
            </div>

            <button
              className="rail-new"
              data-sim-id="new-chat"
              onClick={() => emit({ type: 'new-chat', payload: { inProject: sim.inProject } })}
            >
              <span aria-hidden>✎</span> New chat
            </button>
            <button className="rail-item" data-sim-id="rail-search">
              <span className="rail-glyph" aria-hidden>⌕</span> Search chats
            </button>

            <div className="rail-group">Recents</div>
            {recents.map((c) => (
              <button
                key={c.id}
                className="rail-item rail-chat"
                data-sim-id={`chat-${c.id}`}
                aria-current={sim.screen === 'chat' && c.id === sim.activeChatId}
                onClick={() => emit({ type: 'open-screen', payload: { screen: 'chat' } })}
              >
                {c.title}
              </button>
            ))}

            {sim.project && (
              <>
                <div className="rail-group">Projects</div>
                <button
                  className="rail-item"
                  data-sim-id="rail-project"
                  aria-current={sim.screen === 'project'}
                  onClick={() => emit({ type: 'open-screen', payload: { screen: 'project' } })}
                >
                  <span className="rail-glyph" aria-hidden>▣</span>
                  {sim.project.name}
                </button>
              </>
            )}

            <div className="rail-foot">
              <button
                className="rail-account"
                data-sim-id="account-chip"
                onClick={() => emit({ type: 'open-settings', payload: { section: 'connectors' } })}
              >
                <span className="rail-avatar" aria-hidden>YO</span>
                <span style={{ minWidth: 0 }}>
                  <span className="rail-account-name">Your workspace</span>
                  <span className="rail-account-plan">Settings</span>
                </span>
              </button>
            </div>
          </aside>

          <main className="dsk-main">
            <header className="sim-head">
              <div style={{ minWidth: 0 }}>
                <div className="sim-title">{SCREEN_TITLE(sim)}</div>
                <div className="sim-sub">
                  {sim.screen === 'chat'
                    ? sim.inProject
                      ? `In project · ${sim.project?.name ?? ''}`
                      : sim.chatConnectors.length > 0
                        ? `${sim.chatConnectors.length} connector on in this chat`
                        : 'No connectors on in this chat'
                    : ' '}
                </div>
              </div>
              {sim.screen === 'chat' && sim.brief.length > 0 && !sim.artifactOpen && (
                <button
                  className="sbtn"
                  data-sim-id="artifact-reopen"
                  onClick={() => emit({ type: 'open-artifact', payload: { open: true } })}
                >
                  ▤ Campaign brief
                </button>
              )}
            </header>

            <div className="dsk-split" data-artifact={sim.artifactOpen}>
              <div className="dsk-conv">
                <Screen sim={sim} emit={emit} setComposer={setComposer} device="desktop" />
              </div>
              {sim.artifactOpen && (
                <ArtifactPanel
                  sim={sim}
                  emit={emit}
                  onClose={() => emit({ type: 'open-artifact', payload: { open: false } })}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Phone shell — drawer navigation, no tab bar                         */
/* ------------------------------------------------------------------ */

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
          <button
            className="ph-icon-btn"
            data-sim-id="phone-menu"
            aria-label="Open menu"
            onClick={() => emit({ type: 'open-menu', payload: { menu: 'drawer' } })}
          >
            ☰
          </button>
          <div style={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
            <div className="sim-title">{SCREEN_TITLE(sim)}</div>
            <div className="sim-badge sim-badge-sm">SIMULATED</div>
          </div>
          <button
            className="ph-icon-btn"
            data-sim-id="phone-new-chat"
            aria-label="New chat"
            onClick={() => emit({ type: 'new-chat', payload: { inProject: sim.inProject } })}
          >
            ✎
          </button>
        </header>

        {sim.artifactOpen ? (
          <ArtifactPanel
            sim={sim}
            emit={emit}
            onClose={() => emit({ type: 'open-artifact', payload: { open: false } })}
          />
        ) : (
          <Screen sim={sim} emit={emit} setComposer={setComposer} device="phone" />
        )}

        {sim.sheet === 'drawer' && (
          <div className="sim-overlay ph-drawer-wrap" onClick={() => emit({ type: 'close-menu' })}>
            <nav className="ph-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="sim-brand">
                <span className="sim-mark" aria-hidden>✳</span>
                <span className="sim-brand-name">Claude</span>
              </div>
              <button
                className="rail-new"
                data-sim-id="new-chat"
                onClick={() => emit({ type: 'new-chat', payload: { inProject: sim.inProject } })}
              >
                <span aria-hidden>✎</span> New chat
              </button>
              <div className="rail-group">Recents</div>
              {sim.chats.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  className="rail-item rail-chat"
                  onClick={() => emit({ type: 'open-screen', payload: { screen: 'chat' } })}
                >
                  {c.title}
                </button>
              ))}
              {sim.project && (
                <>
                  <div className="rail-group">Projects</div>
                  <button
                    className="rail-item"
                    data-sim-id="rail-project"
                    onClick={() => emit({ type: 'open-screen', payload: { screen: 'project' } })}
                  >
                    <span className="rail-glyph" aria-hidden>▣</span>
                    {sim.project.name}
                  </button>
                </>
              )}
              <div className="rail-foot">
                <button
                  className="rail-account"
                  data-sim-id="account-chip"
                  onClick={() => emit({ type: 'open-settings', payload: { section: 'connectors' } })}
                >
                  <span className="rail-avatar" aria-hidden>YO</span>
                  <span style={{ minWidth: 0 }}>
                    <span className="rail-account-name">Your workspace</span>
                    <span className="rail-account-plan">Settings</span>
                  </span>
                </button>
              </div>
            </nav>
          </div>
        )}

        <Overlays sim={sim} emit={emit} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function SimApp({ sim, emit, setComposer, device }: ShellProps & { device: DeviceMode }) {
  return (
    <div className="sim-stage" data-device={device} id="sim-stage">
      {device === 'phone' ? (
        <Fit w={372} h={748}>
          <PhoneShell sim={sim} emit={emit} setComposer={setComposer} />
        </Fit>
      ) : (
        <Fit w={1000} h={640} fill minScale={0.62}>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <DesktopShell sim={sim} emit={emit} setComposer={setComposer} />
            <Overlays sim={sim} emit={emit} />
          </div>
        </Fit>
      )}
    </div>
  );
}
