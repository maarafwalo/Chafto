import { useState } from 'react';

/**
 * Optional depth.
 *
 * The questions here are the ones someone who wants to be good at this actually
 * asks — "what would an expert do differently", "what breaks if I skip it". They
 * stay collapsed so they never slow down a learner who is moving.
 */
export function DeepDive({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [shown, setShown] = useState(false);

  if (!shown) {
    return (
      <button className="deep-toggle" onClick={() => setShown(true)}>
        <span aria-hidden>⌄</span> Go deeper on this step ({items.length})
      </button>
    );
  }

  return (
    <div className="deep">
      <div className="deep-head">
        <span className="do-label">Go deeper</span>
        <button className="linkish" onClick={() => setShown(false)}>
          Hide
        </button>
      </div>
      {items.map((it) => {
        const isOpen = open === it.q;
        return (
          <div className="deep-item" key={it.q} data-open={isOpen}>
            <button
              className="deep-q"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : it.q)}
            >
              <span className="deep-marker" aria-hidden>
                {isOpen ? '−' : '+'}
              </span>
              {it.q}
            </button>
            {isOpen && <p className="deep-a">{it.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
