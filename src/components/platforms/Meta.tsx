import type { Event, State } from '../../course/state';

const ACCOUNTS = [
  { id: '1204471 8890', name: 'Main store — EU', spend: '$4,180 last 30d' },
  { id: '1209983 2210', name: 'Test account', spend: '$0 last 30d' },
];

export function Meta({ s, go }: { s: State; go: (e: Event) => void }) {
  const m = s.meta;

  return (
    <div className="pf pf-meta">
      <header className="pf-meta-top">
        <span className="pf-logo" style={{ background: '#0866FF' }}>f</span>
        <strong>Facebook</strong>
      </header>

      <div className="pf-consent">
        {m.screen === 'login' && (
          <>
            <div className="pf-avatar">M</div>
            <h2>Continue to Windsor.ai</h2>
            <p className="pf-sub">Windsor.ai will receive your name, profile picture and the ad accounts you choose.</p>
            <button className="pf-btn pf-btn-meta pf-btn-block" data-id="m-continue" onClick={() => go({ type: 'm-continue' })}>
              Continue as Marouane
            </button>
            <button className="pf-btn pf-btn-block">Cancel</button>
          </>
        )}

        {m.screen === 'accounts' && (
          <>
            <h2>Which ad accounts?</h2>
            <p className="pf-sub">Choose what Windsor.ai may read. You can change this later.</p>
            {ACCOUNTS.map((a, i) => (
              <button
                key={a.id}
                className="pf-choice"
                data-id={`m-account-${i + 1}`}
                onClick={() => go({ type: 'm-pick-account', account: a.id })}
              >
                <span className="pf-radio" />
                <span>
                  <strong>{a.name}</strong>
                  <small>{a.id} · {a.spend}</small>
                </span>
              </button>
            ))}
          </>
        )}

        {m.screen === 'permissions' && (
          <>
            <h2>What Windsor.ai can do</h2>
            <p className="pf-sub">Account {m.account}</p>
            <div className="pf-perm">
              <span className="pf-perm-tick">✓</span>
              <span>
                <strong>Read ad performance</strong>
                <small>Spend, clicks, conversions and results</small>
              </span>
              <span className="pf-switch pf-switch-on" />
            </div>
            <div className="pf-perm pf-perm-off">
              <span className="pf-perm-tick">—</span>
              <span>
                <strong>Manage campaigns</strong>
                <small>Create, edit or pause ads · not requested</small>
              </span>
              <span className="pf-switch" />
            </div>
            <div className="pf-warn pf-warn-good">
              Read only. Nothing here allows anyone to spend your budget.
            </div>
            <button className="pf-btn pf-btn-meta pf-btn-block" data-id="m-save" onClick={() => go({ type: 'm-save' })}>
              Save
            </button>
          </>
        )}
      </div>
    </div>
  );
}
