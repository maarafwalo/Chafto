import type { Progress } from '../engine/types';
import { CATALOG } from '../data/catalog';
import { CONCEPTS } from '../data/concepts';
import { SkillPanel, StatRow } from './Progress';
import { ConceptCard } from './guide/ConceptCard';

const LOOP = [
  { key: 'WATCH', body: 'See the workflow run end to end, so you know what "good" looks like.' },
  { key: 'UNDERSTAND', body: 'Every action comes with a why. Concepts land while you need them, not before.' },
  { key: 'DO', body: 'You click, you type, you approve. Nothing advances until you act.' },
  { key: 'MASTER', body: 'Then the Guide goes quiet and you run it again on your own.' },
];

/** A miniature of the product, built from the same visual language as the real thing. */
function HeroPreview() {
  return (
    <div className="preview" aria-hidden>
      <div className="preview-sim">
        <div className="preview-bar">
          <span className="preview-dot" />
          <span className="preview-dot" />
          <span className="preview-dot" />
          <span className="preview-flag">SIMULATED</span>
        </div>
        <div className="preview-chat">
          <div className="preview-user">Analyse my Meta Ads and tell me which campaign wins.</div>
          <div className="preview-ai">
            <span className="preview-avatar">✳</span>
            <span>I&rsquo;ll pull the numbers through your connector first.</span>
          </div>
          <div className="preview-tool">
            <span className="preview-tooltag">TOOL CALL</span>
            <span className="preview-toolname">windsor.get_campaign_performance()</span>
          </div>
          <div className="preview-rows">
            <span>Campaign A · ROAS 1.8</span>
            <span className="preview-best">Campaign B · ROAS 3.9</span>
            <span>Campaign C · ROAS 1.2</span>
          </div>
          <div className="preview-approve">
            ⚠ Approval required
            <span className="preview-btns">
              <i className="preview-btn-ok">Approve</i>
              <i className="preview-btn-no">Reject</i>
            </span>
          </div>
        </div>
        <span className="preview-ring" />
      </div>
      <div className="preview-guide">
        <span className="preview-eyebrow">STEP 5 OF 9</span>
        <strong className="preview-title">Watch Claude use a tool</strong>
        <span className="preview-do">DO THIS</span>
        <p className="preview-instr">Click the tool call block to inspect the request and its result.</p>
        <span className="preview-do">WHY?</span>
        <p className="preview-why">
          Claude is not reaching into Meta by magic. It asked for a tool, and the tool returned data.
        </p>
        <div className="preview-chips">
          <i>Tool Use</i>
          <i>Agents</i>
        </div>
      </div>
    </div>
  );
}

export function Home({
  progress,
  onStart,
  onOpenMission,
}: {
  progress: Progress;
  onStart: () => void;
  onOpenMission: (missionId: string) => void;
}) {
  return (
    <div className="page">
      <nav className="topnav">
        <div className="brand">
          <span className="brand-mark" aria-hidden>
            ◆
          </span>
          <span>
            <strong>AI Skill Simulator</strong>
            <span className="brand-sub">Learn AI by doing</span>
          </span>
        </div>
        <div className="topnav-right">
          {progress.xp > 0 && <span className="xp-chip">{progress.xp} XP</span>}
          <button className="btn btn-primary" onClick={onStart}>
            Start learning
          </button>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-copy">
          <span className="hero-tag">Simulated environment · nothing here touches a real account</span>
          <h1 className="display display-xl">
            Learn AI by <em>Doing</em>,<br />
            Not Watching
          </h1>
          <p className="lede">
            Step inside realistic AI workflows, follow the Guide, and learn how AI agents actually
            work — connectors, tool calls, approvals and all.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={onStart}>
              Start Learning
            </button>
            <a className="btn btn-ghost btn-lg" href="#missions">
              See the missions
            </a>
          </div>
          <p className="hero-note">
            No video. No slides. You drive a simulated AI app while a Guide explains every move.
          </p>
        </div>
        <HeroPreview />
      </header>

      <section className="band">
        <div className="loop">
          {LOOP.map((l, i) => (
            <div className="loop-card" key={l.key}>
              <span className="loop-num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="loop-key">{l.key}</h3>
              <p className="loop-body">{l.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-wrap" id="missions">
        <div className="section-head">
          <h2 className="display">Missions</h2>
          <p className="lede lede-sm">
            One mission, one practical skill. The first is fully playable — the rest are the roadmap,
            and every one of them runs on the same engine.
          </p>
        </div>
        <div className="mission-grid">
          {CATALOG.map((m) => (
            <article className="mission-card" key={m.id} data-status={m.status}>
              <div className="mission-top">
                <span className="mission-num">{String(m.order).padStart(2, '0')}</span>
                <span className="pill-dark">{m.difficulty}</span>
                {m.status === 'locked' && <span className="pill-dark pill-muted">Soon</span>}
              </div>
              <h3 className="mission-title">{m.title}</h3>
              <p className="mission-blurb">{m.blurb}</p>
              <div className="mission-foot">
                {m.status === 'available' ? (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => m.missionId && onOpenMission(m.missionId)}
                  >
                    {progress.missionsCompleted.includes(m.missionId ?? '') ? 'Replay' : 'Start'} mission
                  </button>
                ) : (
                  <span className="mission-locked">Locked</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-wrap">
        <div className="section-head">
          <h2 className="display">Your AI skills</h2>
          <p className="lede lede-sm">
            Skills move when you use them, not when you read about them. Progress is stored in this
            browser.
          </p>
        </div>
        <div className="progress-wrap">
          <SkillPanel progress={progress} />
          <StatRow progress={progress} />
        </div>
      </section>

      <section className="section-wrap">
        <div className="section-head">
          <h2 className="display">The vocabulary</h2>
          <p className="lede lede-sm">
            Ten ideas that make AI systems make sense. You collect them by meeting them inside a
            workflow, at the moment they matter.
          </p>
        </div>
        <div className="concept-grid">
          {CONCEPTS.map((c) => (
            <div key={c.id} data-locked={progress.conceptsUnlocked.includes(c.id) ? 'false' : 'true'}>
              <ConceptCard concept={c} />
            </div>
          ))}
        </div>
      </section>

      <footer className="foot">
        <p>
          <strong>Everything in this product is simulated.</strong> No AI model is called, no
          external service is contacted, and no data leaves your browser. The campaign numbers,
          connectors and tool results are fictional teaching material.
        </p>
        <p className="foot-sub">
          An original educational simulation inspired by modern AI assistants. Not affiliated with,
          or endorsed by, any of the services it depicts.
        </p>
      </footer>
    </div>
  );
}
