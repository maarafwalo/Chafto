# AI Skill Simulator

**A step-by-step course for a real task, across every website it actually takes.**

You want Claude to do something. You have read that it can. Then you try, and it
turns out the job is not one website but three, in a specific order, with buttons
nobody told you about — and you give up somewhere in the middle.

This walks the whole path once, simulated, so the second time you do it for real
you already know where everything is.

> Everything here is simulated. No account is contacted, no data leaves your
> browser, and nothing you click is real.

## The first course

**Get Claude to analyse your Meta Ads** — 16 steps, about 10 minutes, three
websites:

| Leg | Where | What happens there |
|-----|-------|--------------------|
| 1 | **Windsor.ai** | Sign up, add a data source, pick Meta Ads |
| 2 | **Meta / Facebook** | Log in, choose which ad account, grant read access |
| 3 | **Windsor.ai** | Open API access, copy the MCP server URL |
| 4 | **Claude** | Settings → add custom connector → paste → enable in the chat → ask → allow the tool → read the answer |

Claude is the last leg and the shortest. Everything before it is where people
actually get stuck, so that is where most of the course lives.

## How it works

Two screens.

**The outline** shows the task, the journey across the four legs, what you need
before starting, and every step grouped by the website it happens on. This is the
map — you can read the whole path before touching anything.

**The player** puts a simulated browser on the left and one instruction on the
right. The address bar changes as you move between sites, the current site is
highlighted in the journey map at the top, and the one thing to click is ringed
and captioned. Nothing advances until you do it.

Each step carries at most one line of *why* — the reason that step exists, not a
lesson.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
```

Node 20+. No API keys, no backend, no accounts.

## Structure

```
src/
  course/
    types.ts      Course, CourseStep, and the platform registry
    state.ts      one reducer for all three simulated sites
    metaAds.ts    the course itself — 16 steps as data
  components/
    course/       Overview (the outline), Player, JourneyMap
    platforms/    Windsor.tsx, Meta.tsx, Claude.tsx
    overlay/      Spotlight — dims the site, rings the target
```

A step is:

```ts
{
  id, platform,        // which website this happens on
  title, instruction,  // the one action
  why,                 // one line, optional
  target,              // data-id of the element to ring
  expect,              // the event that completes the step
}
```

### Adding a course

Write a `Course` in `src/course/`, and add any new website as a component in
`components/platforms/` plus a branch in the `reduce` function. The player and
the outline render whatever the data describes — they do not know what a course
is about.

### Adding a platform

A platform is a plain component that renders a fake website and calls `go(event)`
when something is clicked. Give the clickable elements a `data-id` so steps can
point at them. That is the whole contract.
