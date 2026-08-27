import { useState } from 'react';
import type { Concept } from '../../engine/types';

/** A small collectible vocabulary card. Tapping it expands the full definition. */
export function ConceptCard({ concept, defaultOpen = false }: { concept: Concept; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="concept" data-open={open ? 'true' : 'false'}>
      <button className="concept-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="concept-glyph" aria-hidden>
          {concept.glyph}
        </span>
        <span style={{ minWidth: 0 }}>
          <span className="concept-eyebrow">Concept card</span>
          <span className="concept-term">{concept.term}</span>
        </span>
        <span className="concept-toggle" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      <p className="concept-short">{concept.short}</p>
      {open && (
        <div className="concept-more">
          <p>{concept.long}</p>
          <p className="concept-analogy">“{concept.analogy}”</p>
        </div>
      )}
    </div>
  );
}
