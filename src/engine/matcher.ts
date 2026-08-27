import type { ExpectRule, SimContext, SimEvent, TargetRule } from './types';

/** Every key present in `where` must shallow-equal the same key on the payload. */
export function payloadMatches(
  where: Record<string, unknown> | undefined,
  payload: Record<string, unknown> | undefined,
): boolean {
  if (!where) return true;
  const p = payload ?? {};
  return Object.entries(where).every(([k, v]) => p[k] === v);
}

export function eventMatches(rule: ExpectRule, event: SimEvent): boolean {
  if (rule.event !== event.type) return false;
  return payloadMatches(rule.where, event.payload as Record<string, unknown>);
}

/** Same shallow-subset rule, applied to the flattened simulation context. */
export function contextMatches(when: Partial<SimContext> | undefined, ctx: SimContext): boolean {
  if (!when) return true;
  return (Object.keys(when) as (keyof SimContext)[]).every((k) => when[k] === ctx[k]);
}

/**
 * Resolve the element to spotlight right now. Steps can list several targets so
 * that a multi-click path (tap +, then tap Connectors) still highlights the one
 * thing that is actually on screen.
 */
export function resolveTarget(targets: TargetRule[], ctx: SimContext): TargetRule | null {
  for (const t of targets) {
    if (contextMatches(t.when, ctx)) return t;
  }
  return targets.length ? targets[targets.length - 1] : null;
}
