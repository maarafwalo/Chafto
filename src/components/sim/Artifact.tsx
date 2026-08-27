import type { SimEvent, SimState } from '../../engine/types';

const STATUS_LABEL: Record<string, string> = {
  empty: 'Open',
  assumed: 'Assumed',
  confirmed: 'Confirmed',
};

/**
 * The artifact panel: a document Claude built, sitting beside the conversation
 * with a version selector — the same shape as the real thing.
 *
 * Deliberately, the "why this line matters" annotations do NOT live in here. A
 * real artifact is just the document. Selecting a line surfaces the teaching
 * note in the Guide instead, which keeps the simulated product honest.
 */
export function ArtifactPanel({
  sim,
  emit,
  onClose,
}: {
  sim: SimState;
  emit: (e: SimEvent) => void;
  onClose: () => void;
}) {
  const groups = Array.from(new Set(sim.brief.map((f) => f.group)));
  const confirmed = sim.brief.filter((f) => f.status === 'confirmed').length;
  const assumed = sim.brief.filter((f) => f.status === 'assumed').length;

  return (
    <div className="artifact" data-sim-id="artifact-panel">
      <header className="art-head">
        <button className="art-close" data-sim-id="artifact-close" aria-label="Close artifact" onClick={onClose}>
          |←
        </button>
        <div style={{ minWidth: 0 }}>
          <div className="art-title">Campaign brief</div>
          <div className="art-sub">Document · {sim.brief.length} lines</div>
        </div>
        <button className="art-version" data-sim-id="artifact-version">
          Version {sim.artifactVersion} <span aria-hidden>⌄</span>
        </button>
      </header>

      <div className="art-body scroll">
        <div className="art-doc">
          <h1 className="art-h1">Campaign brief</h1>
          <p className="art-lede">
            {confirmed} of {sim.brief.length} decisions confirmed
            {assumed > 0 && ` · ${assumed} still assumed`}
          </p>

          {groups.map((group) => (
            <section key={group}>
              <h2 className="art-h2">{group}</h2>
              <div className="art-rows">
                {sim.brief
                  .filter((f) => f.group === group)
                  .map((f) => (
                    <button
                      key={f.id}
                      className="art-row"
                      data-sim-id={`brief-field-${f.id}`}
                      data-status={f.status}
                      aria-pressed={sim.openField === f.id}
                      onClick={() =>
                        emit({
                          type: 'open-brief-field',
                          payload: { fieldId: sim.openField === f.id ? null : f.id },
                        })
                      }
                    >
                      <span className="art-row-label">{f.label}</span>
                      <span className="art-row-value">{f.value ?? '—'}</span>
                      <span className={`brief-status brief-status-${f.status}`}>
                        {STATUS_LABEL[f.status]}
                      </span>
                    </button>
                  ))}
              </div>
            </section>
          ))}

          <p className="art-foot">
            Generated in a simulated environment. Select any line to see why it exists.
          </p>
        </div>
      </div>
    </div>
  );
}

/** The card in the conversation that opens the artifact. */
export function ArtifactCard({
  title,
  subtitle,
  version,
  emit,
}: {
  title: string;
  subtitle: string;
  version: number;
  emit: (e: SimEvent) => void;
}) {
  return (
    <button
      className="art-card"
      data-sim-id="artifact-card"
      onClick={() => emit({ type: 'open-artifact', payload: { open: true } })}
    >
      <span className="art-card-glyph" aria-hidden>▤</span>
      <span style={{ minWidth: 0 }}>
        <span className="art-card-title">{title}</span>
        <span className="art-card-sub">{subtitle} · Version {version}</span>
      </span>
      <span className="art-card-open">Open</span>
    </button>
  );
}
