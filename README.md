# AI Skill Simulator

**Learn AI by doing, not watching.**

An interactive learning product that teaches people how to use AI applications by
putting them *inside* a realistic simulated AI environment. The learner drives a
fake-but-convincing AI app while a Guide beside them explains what to do, where
to do it, why it matters, and what they are learning.

Not a video. Not an animation. The learner performs every action themselves, and
nothing advances until they do.

> **Everything in this product is simulated.** No AI model is called, no external
> service is contacted, and no data leaves the browser. Campaign numbers,
> connectors and tool results are fictional teaching material.

---

## Mission 01 — Teach Claude to Analyze Meta Ads

The one mission built end to end for the MVP. Nine steps, 8–12 minutes:

| # | Step | Skill taught |
|---|------|--------------|
| 1 | Open Connectors | Connectors |
| 2 | Pick the right connector (Windsor.ai) | MCP / integrations |
| 3 | Read the scopes and authorise | Permissions |
| 4 | **Type your own instruction** — evaluated locally | Prompting |
| 5 | Open the tool call and read the request/result | Tool Use |
| 6 | Answer a question about the analysis | Grounded answers |
| 7 | Push the assistant from analysis to action | Agents |
| 8 | Approve or reject the prepared campaign | Human-in-the-loop |
| 9 | Read the receipt | Agent workflows |

Finishing it unlocks a **Challenge run**: the same world, compressed to four
outcomes, with the Guide switched off and the draft request typed rather than
picked from a suggestion.

## What is actually interactive

Tap buttons, open menus, type messages, browse a connector catalogue, run a
simulated authorisation flow, toggle individual tool permissions, attach files,
expand tool calls to inspect arguments and results, approve or reject an action —
and every one of those changes simulation state. Picking the wrong connector
really opens the wrong connector; the Guide notices and coaches.

## Features

- **Phone / Desktop switcher** — two genuinely different simulated layouts
  (bottom sheets and a tab bar vs. a sidebar and modals). The same mission works
  in both and the Guide rewrites its instructions to match the active one. You can
  switch mid-mission.
- **Spotlight overlay** — dims the simulated app, rings the exact target, numbers
  it, and anchors a caption bubble to it. It tracks the element every frame, so it
  stays welded on through scrolling, re-renders and device scaling.
- **Show me** — animates a pointer onto the target and demonstrates the action
  *without completing it for you*.
- **Why?** — a plain-language reason on every step, expandable into the mechanics.
- **Concept cards** — ten collectible definitions (Connector, Tool, Agent,
  Human-in-the-loop, MCP, API…), unlocked at the moment they become relevant.
- **Three learning modes** — Guided (exact instruction + highlight), Practice
  (objective only, hints on request), Challenge (objective only, hints and
  demonstrations locked until you are genuinely stuck). Harder modes are worth
  more XP.
- **Local answer evaluation** — the typed-instruction steps score input against a
  rubric offline and accept many reasonable phrasings, coaching weak ones instead
  of rejecting them. The simulated assistant asks a clarifying question, exactly
  as a real one would.
- **Scoring and progress** — XP, accuracy, assists used, a Gold/Silver/Bronze
  rank, and seven skill meters persisted to `localStorage`.
- **Responsive product** — on a phone the Guide becomes a bottom sheet that still
  shows the current instruction while collapsed, and the simulated device keeps
  the screen.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
npm run preview
```

Requires Node 20+. No environment variables, no API keys, no backend.

## Architecture

Three layers, deliberately kept apart so each can be replaced on its own.

```
src/
  engine/            layer 3 — the mission engine
    types.ts           every domain type (missions, steps, sim state, progress)
    simReducer.ts      simulation state + semantic event → action mapping
    missionEngine.ts   useMissionEngine(): wires simulation to mission content
    matcher.ts         declarative event/context/target matching
    evaluators.ts      offline scoring of free-form learner input
    scoring.ts         XP, accuracy, rank, skill distribution
    progress.ts        localStorage persistence
  data/              layer 2 — content, as pure data
    missions/          metaAds.ts, metaAdsChallenge.ts, index.ts (registry)
    concepts.ts        concept cards
    connectors.ts      simulated connector catalogue
    catalog.ts         the 15-mission roadmap
  components/        layer 1 — the simulated app + the tutor
    sim/               shells (phone/desktop), screens, conversation, connectors
    guide/             Guide panel, concept card, flow diagram
    overlay/           Spotlight (dim, ring, bubble, pointer demo)
```

**The rule that holds it together:** every learner interaction inside the
simulation emits one semantic `SimEvent`. That single event is handed both to the
simulation reducer (which changes what is on screen) and to the mission engine
(which decides whether the step is complete). The Guide is rendered purely from
engine state, so it *cannot* disagree with the app beside it.

### Adding a mission

Write one data file and add it to the registry in `src/data/missions/index.ts`.
No UI changes. A step is:

```ts
{
  id, title, objective, actionType, concept, why, explanation, hint,
  successMessage, learning, xp,
  devices: { phone: { instruction, target[], note }, desktop: { ... } },
  expect: { event, where?, evaluator? },   // what counts as doing it
  allow?: [...],                           // on-path moves that are not mistakes
  simulationResult?: [...],                // scripted beats fired on success
  weakResult?: [...],                      // beats fired on a weak typed answer
  quiz?, teach?, advance?
}
```

`target` is a list of rules resolved against live simulation state, which is how
one step can highlight the `+` button, then the menu item it reveals.

### Swapping in real AI later

The simulation layer is the only place that invents assistant behaviour, and it
does so through `ScenarioBeat[]` — timed `SimAction`s. Replacing them with a real
streaming response means implementing one adapter that emits the same actions;
the mission engine, Guide, scoring and progress are untouched. Tool calls already
carry a connector id, tool name, arguments and a typed result, matching the shape
a real tool-use loop returns.

## Roadmap

The catalogue ships all fifteen planned missions with the first playable. The
rest — email, files, databases, CSV analysis, Claude Code, research, content,
process automation, APIs, agent building, tool definitions, approval workflows,
and a complete marketing system — are declared in `src/data/catalog.ts`.

## A note on branding

This is an original, clearly labelled educational simulation inspired by modern
AI assistants. It uses no proprietary assets, and every screen is marked
`SIMULATED ENVIRONMENT`. It is not affiliated with or endorsed by any of the
services it depicts.
