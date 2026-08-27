import type { SimEvent, SimState } from '../../engine/types';

const STATUS_LABEL: Record<string, string> = {
  empty: 'Not decided',
  assumed: 'Assumed',
  confirmed: 'Confirmed',
};

/**
 * The campaign specification.
 *
 * This is the mission's real artefact: every decision a campaign needs, each one
 * either confirmed by a human, derived from evidence, or — the dangerous case —
 * quietly assumed by the model. Any line can be opened to see why it exists and
 * what breaks when it is wrong, which is where the depth lives.
 */
export function BriefScreen({ sim, emit }: { sim: SimState; emit: (e: SimEvent) => void }) {
  const groups = Array.from(new Set(sim.brief.map((f) => f.group)));
  const confirmed = sim.brief.filter((f) => f.status === 'confirmed').length;
  const assumed = sim.brief.filter((f) => f.status === 'assumed').length;
  const empty = sim.brief.filter((f) => f.status === 'empty').length;
  const pct = sim.brief.length ? Math.round((confirmed / sim.brief.length) * 100) : 0;

  if (sim.brief.length === 0) {
    return (
      <div className="pad">
        <div className="empty">
          No campaign brief yet.
          <br />
          Ask the assistant to build one and every decision will appear here.
        </div>
      </div>
    );
  }

  return (
    <div className="pad">
      <div className="brief-meter">
        <div className="brief-meter-top">
          <strong>
            {confirmed} of {sim.brief.length} decisions confirmed
          </strong>
          <span className="brief-pct">{pct}%</span>
        </div>
        <div className="brief-track" aria-hidden>
          <span className="brief-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="brief-legend">
          {assumed > 0 && <span className="pill pill-warn">{assumed} assumed</span>}
          {empty > 0 && <span className="pill">{empty} open</span>}
          <span className="pill pill-ok">{confirmed} confirmed</span>
        </div>
      </div>

      {groups.map((group) => (
        <div className="section" key={group}>
          <div className="section-title">{group}</div>
          <div className="brief-list">
            {sim.brief
              .filter((f) => f.group === group)
              .map((f) => {
                const open = sim.openField === f.id;
                return (
                  <div className="brief-row" key={f.id} data-status={f.status} data-open={open}>
                    <button
                      className="brief-head"
                      data-sim-id={`brief-field-${f.id}`}
                      aria-expanded={open}
                      onClick={() =>
                        emit({ type: 'open-brief-field', payload: { fieldId: open ? null : f.id } })
                      }
                    >
                      <span className="brief-label">{f.label}</span>
                      <span className="brief-value">{f.value ?? '—'}</span>
                      <span className={`brief-status brief-status-${f.status}`}>
                        {STATUS_LABEL[f.status]}
                      </span>
                      <span className="tool-chevron" aria-hidden>
                        ›
                      </span>
                    </button>
                    {open && (
                      <div className="brief-drawer">
                        <div>
                          <div className="tool-label">Why this line exists</div>
                          <p className="brief-copy">{f.why}</p>
                        </div>
                        <div>
                          <div className="tool-label">What goes wrong if it is wrong</div>
                          <p className="brief-copy brief-risk">{f.risk}</p>
                        </div>
                        {f.source && (
                          <div>
                            <div className="tool-label">Where this value came from</div>
                            <p className="brief-copy">{f.source}</p>
                          </div>
                        )}
                        {f.status === 'assumed' && (
                          <p className="brief-warn">
                            No one decided this. The assistant filled the blank to keep moving — which
                            is reasonable, and is exactly why it is marked rather than hidden.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The context screen: what the assistant knows before you ask it anything.
 * Choosing what belongs here is the highest-leverage skill in the mission.
 */
export function ContextScreen({ sim, emit }: { sim: SimState; emit: (e: SimEvent) => void }) {
  const added = sim.context.filter((c) => c.added);
  return (
    <div className="pad">
      <p className="conn-blurb" style={{ marginBottom: 14 }}>
        Anything in here is available to the assistant on every message in this workspace. It is the
        difference between advice about campaigns in general and a decision about <em>your</em>{' '}
        campaign.
      </p>

      <div className="section-title">Loaded ({added.length})</div>
      {added.length === 0 ? (
        <div className="empty">
          Nothing loaded. The assistant knows only what you type into a message.
        </div>
      ) : (
        <div className="list">
          {added.map((c) => (
            <div className="ctx-card" key={c.id} data-added="true">
              <span className="ctx-tick" aria-hidden>
                ✓
              </span>
              <span style={{ minWidth: 0 }}>
                <span className="conn-name" style={{ display: 'block' }}>
                  {c.label}
                </span>
                <span className="conn-blurb">{c.detail}</span>
                {c.unlocks && <span className="ctx-unlocks">Now possible: {c.unlocks}</span>}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="section">
        <div className="section-title">Available to load</div>
        <div className="list">
          {sim.context
            .filter((c) => !c.added)
            .map((c) => (
              <div className="ctx-card" key={c.id}>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span className="conn-name" style={{ display: 'block' }}>
                    {c.label}
                  </span>
                  <span className="conn-blurb">{c.detail}</span>
                </span>
                <button
                  className="sbtn"
                  data-sim-id={`context-add-${c.id}`}
                  onClick={() => emit({ type: 'add-context', payload: { id: c.id } })}
                >
                  Load
                </button>
              </div>
            ))}
        </div>
        {sim.context.every((c) => c.added) && (
          <div className="empty" style={{ marginTop: 8 }}>
            Everything available is loaded.
          </div>
        )}
      </div>
    </div>
  );
}
