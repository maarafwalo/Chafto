/** The DATA → ANALYSIS → DECISION → ACTION spine of an agent workflow. */
export function FlowDiagram({ nodes }: { nodes: string[] }) {
  return (
    <div className="flow" role="img" aria-label={nodes.join(' then ')}>
      {nodes.map((n, i) => (
        <div className="flow-node" key={n} style={{ animationDelay: `${i * 0.12}s` }}>
          <span className="flow-dot" />
          <span className="flow-label">{n}</span>
          {i < nodes.length - 1 && <span className="flow-arrow" aria-hidden />}
        </div>
      ))}
    </div>
  );
}
