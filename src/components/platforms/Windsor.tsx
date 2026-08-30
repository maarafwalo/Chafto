import type { Event, State } from '../../course/state';

const SOURCES = [
  { id: 'facebook', name: 'Facebook / Meta Ads', cat: 'Advertising', glyph: 'f', tint: '#0866FF' },
  { id: 'google_ads', name: 'Google Ads', cat: 'Advertising', glyph: 'G', tint: '#4285F4' },
  { id: 'tiktok', name: 'TikTok Ads', cat: 'Advertising', glyph: '♪', tint: '#111' },
  { id: 'ga4', name: 'Google Analytics 4', cat: 'Analytics', glyph: '▲', tint: '#E8710A' },
  { id: 'shopify', name: 'Shopify', cat: 'E-commerce', glyph: 'S', tint: '#5E8E3E' },
];

export function Windsor({ s, go }: { s: State; go: (e: Event) => void }) {
  const w = s.windsor;

  if (w.screen === 'landing') {
    return (
      <div className="pf pf-windsor">
        <header className="pf-nav">
          <span className="pf-logo" style={{ background: '#E07856' }}>❖</span>
          <strong>Windsor.ai</strong>
          <nav className="pf-links">
            <span>Connectors</span>
            <span>Pricing</span>
            <span>Docs</span>
          </nav>
        </header>
        <div className="pf-hero">
          <h1>All your marketing data, everywhere you need it.</h1>
          <p>Connect 350+ platforms and pipe the data into your tools — including AI assistants.</p>
          <button className="pf-btn pf-btn-primary pf-btn-lg" data-id="w-start" onClick={() => go({ type: 'w-start-trial' })}>
            Start free trial
          </button>
          <div className="pf-logos">
            <span>Meta Ads</span><span>Google Ads</span><span>TikTok</span><span>GA4</span><span>Shopify</span>
          </div>
        </div>
      </div>
    );
  }

  if (w.screen === 'signup') {
    return (
      <div className="pf pf-windsor">
        <header className="pf-nav">
          <span className="pf-logo" style={{ background: '#E07856' }}>❖</span>
          <strong>Windsor.ai</strong>
        </header>
        <div className="pf-form">
          <h2>Create your account</h2>
          <label className="pf-field">
            <span>Work email</span>
            <input readOnly value="you@example.com" />
          </label>
          <label className="pf-field">
            <span>Password</span>
            <input readOnly type="password" value="••••••••••" />
          </label>
          <button className="pf-btn pf-btn-primary pf-btn-block" data-id="w-create" onClick={() => go({ type: 'w-create-account' })}>
            Create account
          </button>
          <p className="pf-note">Simulated — no account is created and nothing is sent.</p>
        </div>
      </div>
    );
  }

  /* Dashboard: sources + API */
  return (
    <div className="pf pf-windsor pf-app">
      <aside className="pf-side">
        <div className="pf-side-brand">
          <span className="pf-logo" style={{ background: '#E07856' }}>❖</span> Windsor.ai
        </div>
        <button className="pf-side-item" aria-current={w.screen === 'sources'} onClick={() => go({ type: 'w-add-source' })}>
          Data sources
        </button>
        <button className="pf-side-item" data-id="w-api" aria-current={w.screen === 'api'} onClick={() => go({ type: 'w-open-api' })}>
          MCP &amp; API access
        </button>
        <button className="pf-side-item">Destinations</button>
        <button className="pf-side-item">Billing</button>
      </aside>

      <main className="pf-main">
        {w.screen === 'sources' && (
          <>
            <h2>Data sources</h2>
            <p className="pf-sub">Each source is one platform Windsor reads from.</p>

            {w.metaConnected ? (
              <div className="pf-row pf-row-ok">
                <span className="pf-badge" style={{ background: '#0866FF' }}>f</span>
                <div>
                  <strong>Facebook / Meta Ads</strong>
                  <small>Connected · ad account 120 4471 8890</small>
                </div>
                <span className="pf-pill pf-pill-ok">Active</span>
              </div>
            ) : (
              <div className="pf-empty">No data sources yet.</div>
            )}

            <div className="pf-section-head">
              <span>Available sources</span>
            </div>
            <div className="pf-grid">
              {SOURCES.map((src) => (
                <button
                  key={src.id}
                  className="pf-card"
                  data-id={`w-source-${src.id}`}
                  onClick={() => src.id === 'facebook' && go({ type: 'w-pick-meta' })}
                >
                  <span className="pf-badge" style={{ background: src.tint }}>{src.glyph}</span>
                  <div>
                    <strong>{src.name}</strong>
                    <small>{src.cat}</small>
                  </div>
                </button>
              ))}
            </div>
            <button className="pf-btn pf-btn-primary" data-id="w-add" onClick={() => go({ type: 'w-add-source' })}>
              + Add data source
            </button>
          </>
        )}

        {w.screen === 'api' && (
          <>
            <h2>MCP &amp; API access</h2>
            <p className="pf-sub">
              This is the address an AI assistant calls to reach your connected data.
            </p>
            <div className="pf-urlbox">
              <span className="pf-url mono">https://mcp.windsor.ai/v1/sse?key=wnd_sim_8f21c4</span>
              <button className="pf-btn" data-id="w-copy" onClick={() => go({ type: 'w-copy-url' })}>
                {w.copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div className="pf-warn">
              Treat this like a password. Anyone with this URL can read the data you connected.
            </div>
          </>
        )}
      </main>
    </div>
  );
}
