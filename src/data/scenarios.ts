import type { ToolResult } from '../engine/types';

/**
 * What each connector actually returns when Claude calls it.
 *
 * A composed walkthrough is only worth doing if the tool result is real enough
 * to reason about, so every connector here returns data with a genuine finding
 * in it — something the learner can point at and defend.
 */
export interface ConnectorScenario {
  /** The read tool Claude reaches for first. */
  readTool: string;
  readArgs: string;
  readSummary: string;
  result: ToolResult;
  /** What Claude concludes, and the evidence chips under it. */
  finding: string;
  evidence: string[];
  /** The follow-up action, when the learner wants Claude to do something. */
  actionTool: string;
  actionArgs: string;
  actionLabel: string;
  actionIntro: string;
  action: ToolResult;
  /** Approval-gate copy for the action. */
  approvalTitle: string;
  approvalSummary: string;
  /** A quiz that can only be answered from the result above. */
  quiz: { prompt: string; right: string; rightWhy: string; wrong: [string, string][] };
}

export const SCENARIOS: Record<string, ConnectorScenario> = {
  gmail: {
    readTool: 'mail.search_threads()',
    readArgs: '{\n  "query": "is:unread newer_than:7d",\n  "max_results": 50\n}',
    readSummary: 'Reads subject lines, senders and dates from your inbox. It does not send anything.',
    result: {
      kind: 'table',
      columns: ['Thread', 'From', 'Waiting', 'Status'],
      rows: [
        ['Invoice 4471 overdue', 'accounts@supplier.co', '9 days', 'No reply sent'],
        ['Re: contract renewal', 'legal@bigclient.com', '6 days', 'No reply sent'],
        ['Quick question about pricing', 'hello@newlead.io', '5 days', 'No reply sent'],
        ['Weekly newsletter', 'news@industry.com', '2 days', 'No action needed'],
      ],
      note: '4 of 38 unread threads are waiting on you · simulated data',
    },
    finding:
      'Three threads are genuinely waiting on you, and one is not. The overdue invoice is nine days old and from a supplier — that is the one with a cost attached to waiting. The newsletter needs nothing.',
    evidence: ['9 days overdue', '3 need replies', '1 is noise'],
    actionTool: 'mail.create_draft()',
    actionArgs: '{\n  "thread_id": "th_4471",\n  "tone": "direct, friendly",\n  "send": false\n}',
    actionLabel: 'Draft a reply to the overdue invoice',
    actionIntro: 'I can draft a reply to the supplier. I will not send it — you read it first.',
    action: {
      kind: 'record',
      title: 'Draft reply',
      fields: [
        { label: 'To', value: 'accounts@supplier.co' },
        { label: 'Subject', value: 'Re: Invoice 4471 overdue' },
        { label: 'Body', value: 'Apologies for the delay — I am checking this with our finance side today and will confirm payment timing by Friday.' },
        { label: 'Status', value: 'Draft, not sent' },
      ],
    },
    approvalTitle: 'Approval required — send email',
    approvalSummary: 'Sending leaves your account and cannot be recalled. It needs a human decision.',
    quiz: {
      prompt: 'Which thread should be handled first, and why?',
      right: 'The overdue invoice — longest wait and a real cost to delay',
      rightWhy: 'Right. Nine days and it is money owed. Age alone would not decide it; age plus consequence does.',
      wrong: [
        ['The newest one, to stay on top of things', 'Recency is not urgency. The newest thread here is a newsletter that needs nothing at all.'],
        ['The newsletter, to clear the inbox', 'Clearing noise feels productive and moves nothing. The tool result marks it as needing no action.'],
      ],
    },
  },

  drive: {
    readTool: 'drive.search_files()',
    readArgs: '{\n  "query": "Q3 report",\n  "modified_after": "2026-06-01"\n}',
    readSummary: 'Lists file names, owners and dates. It reads; it does not change or delete anything.',
    result: {
      kind: 'table',
      columns: ['File', 'Owner', 'Modified', 'Note'],
      rows: [
        ['Q3 report FINAL.docx', 'you', '12 Aug', 'Shared with 4 people'],
        ['Q3 report FINAL v2.docx', 'you', '19 Aug', 'Not shared'],
        ['Q3 report FINAL v2 (Ann edits).docx', 'ann@', '24 Aug', 'Not shared'],
        ['Q3 numbers.xlsx', 'you', '11 Aug', 'Source data'],
      ],
      note: '4 files match · simulated data',
    },
    finding:
      'The file everyone is reading is not the newest one. "FINAL" is shared with four people and is twelve days older than Ann’s edits, which nobody outside you can see. That is a versioning problem, not a search problem.',
    evidence: ['Shared copy is 12 days stale', 'Newest edits unshared', '3 near-identical names'],
    actionTool: 'drive.share_file()',
    actionArgs: '{\n  "file": "Q3 report FINAL v2 (Ann edits).docx",\n  "with": "existing viewers of FINAL"\n}',
    actionLabel: 'Share the newest version with the same people',
    actionIntro: 'I can share Ann’s version with the four people who currently have the stale one.',
    action: {
      kind: 'record',
      title: 'Sharing change',
      fields: [
        { label: 'File', value: 'Q3 report FINAL v2 (Ann edits).docx' },
        { label: 'Share with', value: '4 existing viewers of "FINAL"' },
        { label: 'Access', value: 'Can view' },
        { label: 'Old file', value: 'Left in place, not deleted' },
      ],
    },
    approvalTitle: 'Approval required — change sharing',
    approvalSummary: 'This exposes a document to four people. Sharing is hard to un-see once done.',
    quiz: {
      prompt: 'What does the result actually tell you?',
      right: 'The version people can see is not the current one',
      rightWhy: 'Exactly. Four people hold a copy from 12 August; the real latest work is unshared. The names hid it — the dates and sharing columns did not.',
      wrong: [
        ['There are too many files and they need tidying', 'Tidying is a symptom fix. The problem is that the shared copy is stale, which renaming would not solve.'],
        ['Ann should not have edited the file', 'Nothing in the data says that. Ann did the most recent work; it simply never reached the readers.'],
      ],
    },
  },

  supabase: {
    readTool: 'db.run_query()',
    readArgs: '{\n  "sql": "select plan, count(*), avg(days_active) from users group by plan",\n  "mode": "read_only"\n}',
    readSummary: 'Runs a read-only query. It cannot write, update or drop anything.',
    result: {
      kind: 'table',
      columns: ['Plan', 'Users', 'Avg days active', 'Churn 30d'],
      rows: [
        ['free', '8,410', '3.2', '—'],
        ['pro', '612', '18.7', '4.1%'],
        ['team', '84', '24.9', '1.2%'],
        ['pro (trial→paid)', '97', '6.1', '22.8%'],
      ],
      note: '4 segments · read-only query · simulated data',
    },
    finding:
      'Trial converts are churning at 22.8%, roughly five times your normal pro churn, and they are only active six days against pro’s eighteen. People are paying and then not using it — the problem is onboarding, not pricing.',
    evidence: ['22.8% vs 4.1% churn', '6.1 vs 18.7 days active', '97 users affected'],
    actionTool: 'db.run_query()',
    actionArgs: '{\n  "sql": "select id, email from users where plan=\'pro\' and source=\'trial\' and days_active < 7",\n  "mode": "read_only"\n}',
    actionLabel: 'Pull the list of at-risk trial converts',
    actionIntro: 'I can pull the specific accounts behind that number so you can act on them.',
    action: {
      kind: 'record',
      title: 'At-risk accounts',
      fields: [
        { label: 'Matching users', value: '71' },
        { label: 'Criteria', value: 'Trial → pro, under 7 days active' },
        { label: 'Oldest', value: 'Converted 26 days ago' },
        { label: 'Export', value: 'Read-only — nothing was changed' },
      ],
    },
    approvalTitle: 'Approval required — export user records',
    approvalSummary: 'This returns personal data (emails). Exporting it is a decision a human should make.',
    quiz: {
      prompt: 'What is the actual finding here?',
      right: 'Trial converts churn 5× more and barely use the product',
      rightWhy: 'Right — and the two columns together are what make it a finding. High churn alone could be price; high churn plus six days active says they never got started.',
      wrong: [
        ['Free users are the problem — there are 8,410 of them', 'Volume is not a problem. Free users have no churn figure at all; nothing in the row suggests an issue.'],
        ['Team plan is underperforming with only 84 users', 'Team has the lowest churn and the highest engagement in the table. Small is not the same as failing.'],
      ],
    },
  },

  windsor: {
    readTool: 'windsor.get_campaign_performance()',
    readArgs: '{\n  "platform": "meta",\n  "date_range": "last_14_days",\n  "metrics": ["spend", "ctr", "cpa", "roas"]\n}',
    readSummary: 'Reads spend, click-through rate, cost per action and return on ad spend. Read-only.',
    result: {
      kind: 'table',
      columns: ['Campaign', 'Spend', 'CTR', 'CPA', 'ROAS'],
      rows: [
        ['Campaign A · Retargeting', '$4,180', '1.2%', '$14.20', '1.8'],
        ['Campaign B · Lookalike video', '$3,940', '2.7%', '$6.40', '3.9'],
        ['Campaign C · Broad interest', '$2,610', '0.9%', '$19.80', '1.2'],
      ],
      note: '3 active campaigns · last 14 days · simulated data',
    },
    finding:
      'Campaign B is the strongest and it is not close: 3.9x return at $6.40 a purchase, against Campaign C spending $2,610 to return 1.2x. C is the one to pause.',
    evidence: ['ROAS 3.9', 'CPA $6.40', 'C returns 1.2x'],
    actionTool: 'windsor.create_campaign_draft()',
    actionArgs: '{\n  "based_on": "campaign_b",\n  "daily_budget": 50\n}',
    actionLabel: 'Draft a new campaign based on the winner',
    actionIntro: 'I can prepare a new campaign reusing what works in Campaign B. Nothing goes live without you.',
    action: {
      kind: 'record',
      title: 'Campaign draft',
      fields: [
        { label: 'Name', value: 'Meta — Campaign B (Improved)' },
        { label: 'Budget', value: '$50 / day' },
        { label: 'Audience', value: 'Lookalike 1% — purchasers' },
        { label: 'Creative', value: 'Video variation #2' },
      ],
    },
    approvalTitle: 'Approval required — create campaign',
    approvalSummary: 'This action would spend budget. It needs a human decision before it runs.',
    quiz: {
      prompt: 'What in the data justifies picking Campaign B?',
      right: 'Highest ROAS (3.9) at the lowest cost per action ($6.40)',
      rightWhy: 'Exactly. It returns most per pound spent and acquires each customer most cheaply — those two together are the case.',
      wrong: [
        ['It spent the most money', 'Campaign A spent more and returned far less. Spend is not performance.'],
        ['Claude knows Meta Ads best practice', 'General knowledge did not decide this. The tool result did — that is what a connector changes.'],
      ],
    },
  },

  vercel: {
    readTool: 'deploy.list()',
    readArgs: '{\n  "project": "your-app",\n  "limit": 5\n}',
    readSummary: 'Lists recent deployments and their build status. Read-only.',
    result: {
      kind: 'table',
      columns: ['Deployment', 'Branch', 'State', 'Build time'],
      rows: [
        ['dpl_9f2a', 'main', 'READY', '48s'],
        ['dpl_8c1b', 'main', 'ERROR', '12s'],
        ['dpl_7b04', 'fix/login', 'READY', '51s'],
        ['dpl_6a91', 'main', 'READY', '2m 14s'],
      ],
      note: '5 recent deployments · simulated data',
    },
    finding:
      'One build on main failed after twelve seconds — too fast to have compiled anything, which points at install or config rather than your code. The build before it took over two minutes, so something changed between them.',
    evidence: ['Failed in 12s', 'On main', 'Previous build 2m 14s'],
    actionTool: 'deploy.get_build_logs()',
    actionArgs: '{\n  "deployment": "dpl_8c1b",\n  "errors_only": true\n}',
    actionLabel: 'Pull the failing build log',
    actionIntro: 'I can fetch just the error lines from that failed build.',
    action: {
      kind: 'record',
      title: 'Build failure',
      fields: [
        { label: 'Deployment', value: 'dpl_8c1b' },
        { label: 'Stage', value: 'Install dependencies' },
        { label: 'Error', value: 'lockfile out of sync with package.json' },
        { label: 'Fix', value: 'Commit an updated lockfile' },
      ],
    },
    approvalTitle: 'Approval required — read build logs',
    approvalSummary: 'Build logs can contain environment details. Worth a conscious yes.',
    quiz: {
      prompt: 'What does a 12-second failure tell you?',
      right: 'It failed before compiling — so install or config, not your code',
      rightWhy: 'Right. A build that dies faster than it could possibly compile is almost never a code bug. The duration was the clue.',
      wrong: [
        ['The code on main is broken', 'Possible in general, but not here — twelve seconds is not long enough to reach your code.'],
        ['The server was overloaded', 'Nothing in the result suggests that, and the other builds on the same branch succeeded.'],
      ],
    },
  },
};

/** Anything without bespoke content falls back to a generic but honest scenario. */
export const genericScenario = (name: string): ConnectorScenario => ({
  readTool: `${name.toLowerCase().replace(/[^a-z]/g, '')}.list_items()`,
  readArgs: '{\n  "limit": 25,\n  "since": "last_30_days"\n}',
  readSummary: `Reads a list of items from ${name}. Read-only — it changes nothing.`,
  result: {
    kind: 'table',
    columns: ['Item', 'Updated', 'State'],
    rows: [
      ['Item 1', '3 days ago', 'Needs attention'],
      ['Item 2', '9 days ago', 'Stale'],
      ['Item 3', 'today', 'Fine'],
    ],
    note: `3 items from ${name} · simulated data`,
  },
  finding: `The nine-day-old item is the one worth looking at — it is the only thing here that has gone quiet without being finished.`,
  evidence: ['1 stale item', '9 days untouched'],
  actionTool: `${name.toLowerCase().replace(/[^a-z]/g, '')}.update_item()`,
  actionArgs: '{\n  "item": "item_2",\n  "confirm": false\n}',
  actionLabel: 'Prepare an update for the stale item',
  actionIntro: `I can prepare a change in ${name}. You approve it before anything happens.`,
  action: {
    kind: 'record',
    title: 'Prepared change',
    fields: [
      { label: 'Target', value: 'Item 2' },
      { label: 'Change', value: 'Mark for review and notify owner' },
      { label: 'Status', value: 'Prepared, not applied' },
    ],
  },
  approvalTitle: `Approval required — change data in ${name}`,
  approvalSummary: 'This writes to an external service. It needs a human decision first.',
  quiz: {
    prompt: 'Which item deserves attention first?',
    right: 'The one untouched for nine days and not finished',
    rightWhy: 'Right — age only matters when the thing is also unfinished. Today’s item is fine and needs nothing.',
    wrong: [
      ['The newest one', 'Recency is not a reason. That item is marked fine.'],
      ['All of them equally', 'The result already distinguishes them. Treating everything as urgent is the same as having no priorities.'],
    ],
  },
});
