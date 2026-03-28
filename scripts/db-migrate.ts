import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const migrationsDir = path.join(repoRoot, 'infra', 'db', 'migrations');
const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/treasury_os';
const checkOnly = process.argv.includes('--check');

function runPsql(args: string[], input?: string) {
  const result = spawnSync(
    'psql',
    [databaseUrl, '-v', 'ON_ERROR_STOP=1', ...args],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      input,
    },
  );

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `psql failed with exit code ${result.status}`);
  }

  return result.stdout.trim();
}

function ensureMigrationsTable() {
  runPsql([
    '-c',
    `
      create table if not exists schema_migrations (
        id bigserial primary key,
        name text not null unique,
        applied_at timestamptz not null default now()
      );
    `,
  ]);
}

function getAppliedMigrations() {
  const output = runPsql(['-t', '-A', '-c', 'select name from schema_migrations order by name;']);
  return new Set(output.split('\n').map((line) => line.trim()).filter(Boolean));
}

function applyMigration(fileName: string) {
  const fullPath = path.join(migrationsDir, fileName);
  runPsql(['-f', fullPath]);
  runPsql(['-c', `insert into schema_migrations(name) values ('${fileName}') on conflict (name) do nothing;`]);
  console.log(`Applied migration: ${fileName}`);
}

function main() {
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  ensureMigrationsTable();
  const applied = getAppliedMigrations();
  const migrations = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();
  const pending = migrations.filter((migration) => !applied.has(migration));

  if (checkOnly) {
    if (pending.length > 0) {
      console.error(`Pending migrations: ${pending.join(', ')}`);
      process.exit(1);
    }

    console.log('No pending migrations.');
    return;
  }

  for (const migration of pending) {
    applyMigration(migration);
  }

  console.log('Database migrations are up to date.');
}

main();
