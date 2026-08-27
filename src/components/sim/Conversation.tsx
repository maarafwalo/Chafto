import { useEffect, useRef } from 'react';
import type { SimEvent, SimMessage, SimState, ToolResult } from '../../engine/types';

/* ------------------------------------------------------------------ */
/* Tool call — the centrepiece of the simulation. Collapsed by default */
/* so that opening it is a real, teachable action.                     */
/* ------------------------------------------------------------------ */

function ToolResultView({ result }: { result: ToolResult }) {
  if (result.kind === 'campaigns') {
    return (
      <div>
        <div className="tool-label">Tool result</div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Spend</th>
              <th>CTR</th>
              <th>CPA</th>
              <th>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.id} data-best={r.best ? 'true' : 'false'}>
                <td>{r.name}</td>
                <td>{r.spend}</td>
                <td>{r.ctr}</td>
                <td>{r.cpa}</td>
                <td>{r.roas}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="tbl-note">{result.note}</p>
      </div>
    );
  }

  const { draft } = result;
  return (
    <div>
      <div className="tool-label">{result.kind === 'created' ? 'Simulated result' : 'Tool result'}</div>
      <div className={result.kind === 'created' ? 'receipt' : ''} style={{ marginTop: 6 }}>
        {result.kind === 'created' && (
          <div className="receipt-head">
            <span>✓</span> Campaign created in simulation · ref {result.reference}
          </div>
        )}
        <dl className="draft-grid">
          <dt>Campaign</dt>
          <dd>{draft.name}</dd>
          <dt>Objective</dt>
          <dd>{draft.objective}</dd>
          <dt>Budget</dt>
          <dd>{draft.budget}</dd>
          <dt>Audience</dt>
          <dd>{draft.audience}</dd>
          <dt>Creative</dt>
          <dd>{draft.creative}</dd>
          <dt>Based on</dt>
          <dd>{draft.basedOn}</dd>
          <dt>Status</dt>
          <dd>{result.kind === 'created' ? 'SIMULATED LIVE' : 'Awaiting approval'}</dd>
        </dl>
      </div>
    </div>
  );
}

function ToolCall({
  message,
  open,
  onToggle,
}: {
  message: Extract<SimMessage, { kind: 'tool' }>;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="tool" data-open={open ? 'true' : 'false'} data-sim-id={message.id}>
      <button className="tool-head" onClick={onToggle} aria-expanded={open}>
        <span className="tool-tag">TOOL CALL</span>
        <span className="tool-name">{message.tool}</span>
        <span className="tool-state">
          {message.status === 'running' ? (
            <>
              <span className="spinner" /> running
            </>
          ) : (
            <>
              <span style={{ color: '#2f7d55' }}>✓</span> {open ? 'hide' : 'inspect'}
              <span className="tool-chevron">›</span>
            </>
          )}
        </span>
      </button>
      {open && (
        <div className="tool-panel">
          <div>
            <div className="tool-label">Request from the model</div>
            <pre className="tool-code">{message.tool}</pre>
            <pre className="tool-code">{message.args}</pre>
          </div>
          {message.result ? (
            <ToolResultView result={message.result} />
          ) : (
            <div className="tool-label">Waiting for the connector to respond…</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Human approval gate                                                 */
/* ------------------------------------------------------------------ */

function Approval({
  message,
  emit,
}: {
  message: Extract<SimMessage, { kind: 'approval' }>;
  emit: (e: SimEvent) => void;
}) {
  return (
    <div className="approval">
      <div className="approval-head">
        <span aria-hidden>⚠️</span>
        <span className="approval-title">{message.title}</span>
        <span className="pill pill-warn" style={{ marginLeft: 'auto' }}>
          {message.status === 'pending' ? 'Awaiting you' : message.status}
        </span>
      </div>
      <div className="approval-body">
        <p className="approval-sum">{message.summary}</p>
        <dl className="draft-grid">
          <dt>Campaign</dt>
          <dd>{message.draft.name}</dd>
          <dt>Budget</dt>
          <dd>{message.draft.budget}</dd>
          <dt>Audience</dt>
          <dd>{message.draft.audience}</dd>
          <dt>Creative</dt>
          <dd>{message.draft.creative}</dd>
        </dl>
      </div>
      {message.status === 'pending' ? (
        <div className="approval-actions">
          <button
            className="sbtn sbtn-ok"
            data-sim-id="btn-approve"
            onClick={() => emit({ type: 'approval-decision', payload: { id: message.id, decision: 'approve' } })}
          >
            Approve
          </button>
          <button
            className="sbtn"
            data-sim-id="btn-reject"
            onClick={() => emit({ type: 'approval-decision', payload: { id: message.id, decision: 'reject' } })}
          >
            Reject
          </button>
        </div>
      ) : (
        <div className="approval-status" data-status={message.status}>
          {message.status === 'approved' ? '✓ Approved by you' : '✕ Rejected by you — nothing ran'}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function Conversation({
  sim,
  emit,
}: {
  sim: SimState;
  emit: (e: SimEvent) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [sim.messages.length, sim.busy, sim.expandedTools.length]);

  return (
    <div className="conv">
      {sim.messages.map((m) => {
        if (m.role === 'user') {
          return (
            <div className="msg-user" key={m.id}>
              {m.text}
            </div>
          );
        }
        if (m.kind === 'notice') {
          return (
            <div className="msg-notice" key={m.id}>
              {m.text}
            </div>
          );
        }
        return (
          <div className="msg-ai" key={m.id}>
            <div className="msg-avatar" aria-hidden>
              ✳
            </div>
            <div className="msg-body">
              {m.kind === 'text' && (
                <>
                  <p>{m.text}</p>
                  {m.evidence && (
                    <div className="evidence">
                      {m.evidence.map((e) => (
                        <span className="evidence-chip" key={e}>
                          {e}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
              {m.kind === 'tool' && (
                <ToolCall
                  message={m}
                  open={sim.expandedTools.includes(m.id)}
                  onToggle={() => emit({ type: 'inspect-tool-call', payload: { id: m.id } })}
                />
              )}
              {m.kind === 'approval' && <Approval message={m} emit={emit} />}
            </div>
          </div>
        );
      })}

      {sim.busy && (
        <div className="msg-ai">
          <div className="msg-avatar" aria-hidden>
            ✳
          </div>
          <div className="typing" aria-label="Assistant is working">
            <i />
            <i />
            <i />
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
