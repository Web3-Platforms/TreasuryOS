#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();

const requiredCommands = [
  { name: 'node', args: ['--version'] },
  { name: 'npm', args: ['--version'] },
  { name: 'git', args: ['--version'] },
  { name: 'curl', args: ['--version'] },
];

const recommendedCommands = [
  { name: 'gh', args: ['--version'] },
  { name: 'jq', args: ['--version'] },
  { name: 'sqlite3', args: ['--version'] },
  { name: 'psql', args: ['--version'] },
  { name: 'docker', args: ['--version'] },
  { name: 'uvx', args: ['--version'] },
];

const repoArtifacts = [
  'README.md',
  '.github/copilot-instructions.md',
  '.github/workflows/copilot-setup-steps.yml',
  'scripts/agent-stack-doctor.mjs',
];

const envChecks = [
  {
    name: 'GITHUB_PERSONAL_ACCESS_TOKEN',
    label: 'GitHub MCP / GitHub API automation',
  },
  {
    name: 'READONLY_DATABASE_URL',
    label: 'read-only Postgres MCP access',
  },
  {
    name: 'OPENROUTER_API_KEY',
    label: 'AI research and advisory agents',
  },
  {
    name: 'RAILWAY_TOKEN',
    label: 'Railway deploy and environment automation',
  },
  {
    name: 'VERCEL_TOKEN',
    label: 'Vercel deploy and environment automation',
  },
  {
    name: 'SLACK_BOT_TOKEN',
    label: 'Slack agent notifications and support triage',
  },
  {
    name: 'NOTION_TOKEN',
    label: 'Notion knowledge and business ops connectors',
  },
];

function runVersion(command, args) {
  try {
    return execFileSync(command, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .trim()
      .split('\n')[0];
  } catch {
    return null;
  }
}

function printStatus(kind, message) {
  console.log(`[${kind}] ${message}`);
}

let hardFailures = 0;

console.log('TreasuryOS Agent Doctor');
console.log(`Repository: ${repoRoot}`);
console.log('');

const nodeVersion = runVersion('node', ['--version']);
if (!nodeVersion) {
  printStatus('FAIL', 'Node.js is missing.');
  hardFailures += 1;
} else {
  const majorMatch = nodeVersion.match(/v?(\d+)/);
  const major = majorMatch ? Number(majorMatch[1]) : 0;
  if (major < 22) {
    printStatus('FAIL', `Node.js ${nodeVersion} found, but TreasuryOS expects >= 22.`);
    hardFailures += 1;
  } else {
    printStatus('OK', `Node.js ${nodeVersion}`);
  }
}

for (const check of requiredCommands.filter((item) => item.name !== 'node')) {
  const version = runVersion(check.name, check.args);
  if (!version) {
    printStatus('FAIL', `${check.name} is missing.`);
    hardFailures += 1;
  } else {
    printStatus('OK', `${check.name}: ${version}`);
  }
}

for (const check of recommendedCommands) {
  const version = runVersion(check.name, check.args);
  if (!version) {
    printStatus('WARN', `${check.name} is not installed (recommended for the portable agent stack).`);
  } else {
    printStatus('OK', `${check.name}: ${version}`);
  }
}

console.log('');
for (const relPath of repoArtifacts) {
  const absolutePath = path.join(repoRoot, relPath);
  if (existsSync(absolutePath)) {
    printStatus('OK', `Repo artifact present: ${relPath}`);
  } else {
    printStatus('FAIL', `Missing repo artifact: ${relPath}`);
    hardFailures += 1;
  }
}

console.log('');
for (const envCheck of envChecks) {
  if (process.env[envCheck.name]) {
    printStatus('OK', `${envCheck.name} is set (${envCheck.label}).`);
  } else {
    printStatus('WARN', `${envCheck.name} is not set (${envCheck.label}).`);
  }
}

console.log('');
if (hardFailures > 0) {
  printStatus('FAIL', `Agent environment is not ready. Hard failures: ${hardFailures}.`);
  process.exitCode = 1;
} else {
  printStatus('OK', 'Core agent environment is ready. Optional integrations may still need secrets.');
}
