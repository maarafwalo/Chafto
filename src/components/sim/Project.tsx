import type { SimEvent, SimState } from '../../engine/types';

const SUGGESTED_INSTRUCTIONS =
  'You are working on paid acquisition for this business. Always state your assumptions explicitly and mark them as assumptions. Never invent a number — if you need one I have not supplied, leave a blank and ask. Judge every cost against the margins in project knowledge.';

/**
 * A project page, laid out the way the real one is: chats on the left, and a
 * right-hand rail holding project knowledge and instructions. Everything in
 * that rail is available to every chat in the project — which is what makes it
 * the right home for facts you would otherwise retype.
 */
export function ProjectScreen({ sim, emit }: { sim: SimState; emit: (e: SimEvent) => void }) {
  const project = sim.project;
  const added = sim.context.filter((c) => c.added);
  const chats = sim.chats.filter((c) => c.project === project?.id);

  if (!project) {
    return (
      <div className="pad">
        <div className="empty">No project open.</div>
      </div>
    );
  }

  return (
    <div className="proj">
      <div className="proj-main scroll">
        <div className="pad">
          <h2 className="proj-name">{project.name}</h2>
          <p className="conn-blurb">{project.description}</p>

          <button
            className="proj-newchat"
            data-sim-id="project-new-chat"
            onClick={() => emit({ type: 'new-chat', payload: { inProject: true } })}
          >
            <span aria-hidden>✳</span> New chat in this project
          </button>

          <div className="section">
            <div className="section-title">Chats in this project ({chats.length})</div>
            {chats.length === 0 ? (
              <div className="empty">
                No chats yet. Anything you start here can see the knowledge and instructions on the
                right.
              </div>
            ) : (
              <div className="list">
                {chats.map((c) => (
                  <button
                    key={c.id}
                    className="conn-card"
                    onClick={() => emit({ type: 'open-screen', payload: { screen: 'chat' } })}
                  >
                    <span className="conn-glyph" style={{ background: '#c8bfb3' }} aria-hidden>✳</span>
                    <span className="conn-name">{c.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="proj-rail scroll">
        <div className="rail-block">
          <div className="rail-block-head">
            <span className="section-title" style={{ margin: 0 }}>Project knowledge</span>
            <button
              className="rail-add"
              data-sim-id="knowledge-add"
              aria-label="Add content"
              onClick={() => emit({ type: 'open-menu', payload: { menu: 'plus' } })}
            >
              +
            </button>
          </div>
          {added.length === 0 ? (
            <p className="rail-empty">
              Nothing here yet. Claude knows only what you type into a message.
            </p>
          ) : (
            <div className="knw-list">
              {added.map((c) => (
                <div className="knw" key={c.id}>
                  <span className="knw-glyph" aria-hidden>▤</span>
                  <span style={{ minWidth: 0 }}>
                    <span className="knw-name">{c.label}</span>
                    <span className="knw-detail">{c.detail}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="rail-sub">Available to every chat in this project</div>
        </div>

        <div className="rail-block">
          <div className="rail-block-head">
            <span className="section-title" style={{ margin: 0 }}>Instructions</span>
            <button
              className="rail-add"
              data-sim-id="instructions-add"
              aria-label="Set instructions"
              onClick={() => emit({ type: 'open-menu', payload: { menu: 'instructions' } })}
            >
              +
            </button>
          </div>
          {project.instructions ? (
            <p className="rail-instructions">{project.instructions}</p>
          ) : (
            <p className="rail-empty">
              No instructions set. Claude will behave the way it does in any other chat.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

/** The sheet for adding a document to project knowledge. */
export function KnowledgeSheet({ sim, emit }: { sim: SimState; emit: (e: SimEvent) => void }) {
  const available = sim.context.filter((c) => !c.added);
  return (
    <div className="sim-overlay" onClick={() => emit({ type: 'close-menu' })}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab" />
        <div className="sheet-head">
          <div className="sheet-title">Add to project knowledge</div>
          <div className="sheet-sub">
            Everything you add is read on every message in this project. Add what changes a
            decision, not everything that is true.
          </div>
        </div>
        <div className="sheet-body scroll">
          {available.length === 0 ? (
            <div className="empty">Everything available has been added.</div>
          ) : (
            <div className="list">
              {available.map((c) => (
                <div className="ctx-card" key={c.id}>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span className="conn-name" style={{ display: 'block' }}>{c.label}</span>
                    <span className="conn-blurb">{c.detail}</span>
                  </span>
                  <button
                    className="sbtn"
                    data-sim-id={`context-add-${c.id}`}
                    onClick={() => emit({ type: 'add-context', payload: { id: c.id } })}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="sheet-foot">
          <button className="sbtn sbtn-ghost" onClick={() => emit({ type: 'close-menu' })}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/** The sheet for setting project instructions. */
export function InstructionsSheet({ emit }: { emit: (e: SimEvent) => void }) {
  return (
    <div className="sim-overlay" onClick={() => emit({ type: 'close-menu' })}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab" />
        <div className="sheet-head">
          <div className="sheet-title">Set project instructions</div>
          <div className="sheet-sub">
            How Claude should behave in every chat in this project.
          </div>
        </div>
        <div className="sheet-body">
          <div className="instr-preview">{SUGGESTED_INSTRUCTIONS}</div>
          <p className="conn-blurb" style={{ marginTop: 10 }}>
            Note what this does: it forces assumptions to be labelled and forbids invented numbers.
            Two sentences that change every answer you will get in here.
          </p>
        </div>
        <div className="sheet-foot">
          <button className="sbtn sbtn-ghost" onClick={() => emit({ type: 'close-menu' })}>
            Cancel
          </button>
          <button
            className="sbtn sbtn-primary"
            data-sim-id="btn-save-instructions"
            onClick={() => emit({ type: 'set-instructions', payload: { text: SUGGESTED_INSTRUCTIONS } })}
          >
            Save instructions
          </button>
        </div>
      </div>
    </div>
  );
}
