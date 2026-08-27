import type { SkillId } from '../engine/types';

/**
 * The roadmap. Only the first entry is a real, playable mission — the rest are
 * declared here so the catalogue shows where the product is going and so the
 * shape of a mission definition stays honest against real future content.
 */
export interface CatalogEntry {
  id: string;
  order: number;
  title: string;
  blurb: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  skills: SkillId[];
  status: 'available' | 'locked';
  missionId?: string;
}

export const CATALOG: CatalogEntry[] = [
  {
    id: 'meta-ads',
    order: 1,
    title: 'Teach Claude to Analyze Meta Ads',
    blurb: 'Connect a marketing-data source, get a grounded analysis, approve a prepared action.',
    difficulty: 'Intermediate',
    skills: ['connectors', 'toolUse', 'agents', 'safety'],
    status: 'available',
    missionId: 'meta-ads',
  },
  { id: 'gmail', order: 2, title: 'Connect Claude to your email', blurb: 'Read-only scopes, drafts instead of sends, and why that ordering matters.', difficulty: 'Beginner', skills: ['connectors', 'safety'], status: 'locked' },
  { id: 'drive', order: 3, title: 'Connect Claude to your files', blurb: 'Point a model at a folder and ask questions of documents you never opened.', difficulty: 'Beginner', skills: ['connectors', 'dataAnalysis'], status: 'locked' },
  { id: 'supabase', order: 4, title: 'Connect Claude to a database', blurb: 'Schema first, read-only queries, and the blast radius of write access.', difficulty: 'Intermediate', skills: ['connectors', 'dataAnalysis'], status: 'locked' },
  { id: 'csv', order: 5, title: 'Analyse a CSV with Claude', blurb: 'Upload messy data and get to a defensible conclusion.', difficulty: 'Beginner', skills: ['dataAnalysis', 'prompting'], status: 'locked' },
  { id: 'code', order: 6, title: 'Build a website with Claude Code', blurb: 'Work in a terminal-shaped agent that edits real files.', difficulty: 'Intermediate', skills: ['agents', 'toolUse'], status: 'locked' },
  { id: 'research', order: 7, title: 'Make Claude research competitors', blurb: 'Multi-source research, and how to spot an unsupported claim.', difficulty: 'Intermediate', skills: ['toolUse', 'prompting'], status: 'locked' },
  { id: 'content', order: 8, title: 'Make Claude create marketing content', blurb: 'Brand voice, constraints, and iterating without losing the thread.', difficulty: 'Beginner', skills: ['prompting'], status: 'locked' },
  { id: 'process', order: 9, title: 'Automate a business process', blurb: 'Turn a recurring manual task into a reviewed, repeatable run.', difficulty: 'Advanced', skills: ['automation', 'agents'], status: 'locked' },
  { id: 'apis', order: 10, title: 'Make Claude use APIs', blurb: 'What an API call looks like from the model’s side of the table.', difficulty: 'Advanced', skills: ['toolUse'], status: 'locked' },
  { id: 'agent', order: 11, title: 'Build an AI agent', blurb: 'Goal, tools, memory, stopping condition.', difficulty: 'Advanced', skills: ['agents'], status: 'locked' },
  { id: 'automation', order: 12, title: 'Build an automation with AI', blurb: 'Triggers, schedules and what happens when a run fails at 3am.', difficulty: 'Advanced', skills: ['automation'], status: 'locked' },
  { id: 'give-tools', order: 13, title: 'Give an agent its tools', blurb: 'Write tool definitions a model can actually use correctly.', difficulty: 'Advanced', skills: ['toolUse', 'agents'], status: 'locked' },
  { id: 'approval', order: 14, title: 'Design a human-approval workflow', blurb: 'Draw the line between what runs alone and what needs a signature.', difficulty: 'Intermediate', skills: ['safety', 'automation'], status: 'locked' },
  { id: 'system', order: 15, title: 'Build a complete AI marketing system', blurb: 'Every earlier mission, assembled into one working pipeline.', difficulty: 'Advanced', skills: ['agents', 'automation', 'connectors', 'safety'], status: 'locked' },
];
