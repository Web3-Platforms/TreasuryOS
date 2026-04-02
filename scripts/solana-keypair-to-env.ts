import fs from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

import { Keypair } from '@solana/web3.js';

function expandHome(inputPath: string) {
  return inputPath.startsWith('~/') ? path.join(homedir(), inputPath.slice(2)) : inputPath;
}

function usage() {
  console.error(
    [
      'Usage:',
      '  npm run solana:keypair:export -- [path-to-keypair.json] [--raw]',
      '',
      'Examples:',
      '  npm run solana:keypair:export -- ~/.config/solana/id.json',
      '  npm run solana:keypair:export -- ~/.config/solana/id.json --raw',
    ].join('\n'),
  );
}

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  usage();
  process.exit(0);
}

const rawOnly = args.includes('--raw');
const keypairPathArg = args.find((arg) => !arg.startsWith('--')) ?? '~/.config/solana/id.json';
const keypairPath = path.resolve(expandHome(keypairPathArg));

if (!fs.existsSync(keypairPath)) {
  console.error(`Keypair file not found: ${keypairPath}`);
  process.exit(1);
}

const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, 'utf8')));
const keypair = Keypair.fromSecretKey(secretKey);
const normalizedJson = JSON.stringify(Array.from(secretKey));

if (rawOnly) {
  console.log(normalizedJson);
  process.exit(0);
}

console.log(`# Solana authority public key: ${keypair.publicKey.toBase58()}`);
console.log('# Copy the next lines into Railway Variables for the API service.');
console.log('SOLANA_SIGNING_MODE=environment');
console.log(`AUTHORITY_KEYPAIR_JSON=${normalizedJson}`);
console.log('# Keep SOLANA_SYNC_ENABLED=false until /api/health/ready passes on testnet.');
