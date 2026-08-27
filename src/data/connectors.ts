import type { ConnectorDef } from '../engine/types';

/**
 * The connector catalogue shown inside the simulation. These are *simulated*
 * integrations — none of them make a network call. Tool names are written the
 * way a real MCP-style server would expose them so the vocabulary transfers.
 */
export const CONNECTORS: ConnectorDef[] = [
  {
    id: 'gmail',
    name: 'Mail',
    category: 'Communication',
    blurb: 'Read, draft and search email threads.',
    glyph: '✉',
    tint: '#5B8DEF',
    tools: [
      { name: 'mail.search_threads()', description: 'Find threads matching a query' },
      { name: 'mail.create_draft()', description: 'Prepare a reply for review' },
    ],
    scopes: ['Read messages', 'Create drafts'],
  },
  {
    id: 'drive',
    name: 'Drive',
    category: 'Files',
    blurb: 'Open documents and spreadsheets stored in the cloud.',
    glyph: '▲',
    tint: '#39B27A',
    tools: [
      { name: 'drive.search_files()', description: 'Locate a file by name' },
      { name: 'drive.read_file()', description: 'Read a document’s contents' },
    ],
    scopes: ['Read files', 'List folders'],
  },
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'Database',
    blurb: 'Query application tables and inspect schema.',
    glyph: '⬢',
    tint: '#3ECF8E',
    tools: [
      { name: 'db.list_tables()', description: 'Describe the schema' },
      { name: 'db.run_query()', description: 'Run a read-only query' },
    ],
    scopes: ['Read tables'],
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'Deployment',
    blurb: 'Inspect deployments and build logs.',
    glyph: '◭',
    tint: '#E6E1D8',
    tools: [{ name: 'deploy.list()', description: 'List recent deployments' }],
    scopes: ['Read deployments'],
  },
  {
    id: 'windsor',
    name: 'Windsor.ai',
    category: 'Marketing data',
    blurb: 'Bridge to advertising and marketing platforms.',
    glyph: '❖',
    tint: '#E07856',
    tools: [
      {
        name: 'windsor.get_campaign_performance()',
        description: 'Pull spend, CTR, CPA and ROAS per campaign',
      },
      {
        name: 'windsor.create_campaign_draft()',
        description: 'Prepare a new campaign for human approval',
      },
    ],
    scopes: ['Read ad performance', 'Prepare campaign drafts (approval required)'],
  },
  {
    id: 'canva',
    name: 'Canva',
    category: 'Design',
    blurb: 'Generate and fetch creative assets.',
    glyph: '◔',
    tint: '#8B7BE8',
    tools: [{ name: 'design.list_assets()', description: 'List brand assets' }],
    scopes: ['Read designs'],
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'Automation',
    blurb: 'Trigger multi-step automations in other apps.',
    glyph: '⚡',
    tint: '#F2915C',
    tools: [{ name: 'zap.run()', description: 'Run a saved automation' }],
    scopes: ['Run automations'],
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    category: 'Models',
    blurb: 'Search open models and datasets.',
    glyph: '◉',
    tint: '#F5C24C',
    tools: [{ name: 'hf.search_models()', description: 'Search the model hub' }],
    scopes: ['Read public models'],
  },
];

export const connectorById = (id: string): ConnectorDef =>
  CONNECTORS.find((c) => c.id === id) ?? CONNECTORS[0];
