import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';

import { Keypair, PublicKey } from '@solana/web3.js';

import { WalletWhitelistClient, isValidSolanaAddress } from '../packages/sdk/src/index.js';

test('wallet whitelist client builds deterministic whitelist entries and instruction data', () => {
  const authority = Keypair.generate();
  const wallet = Keypair.generate().publicKey.toBase58();
  const client = new WalletWhitelistClient('FXFMG4hzBcuRu33mVXyTHESH7FnsmUD6Fajr17FugbRt', {
    url: 'https://api.devnet.solana.com',
    network: 'devnet',
    commitment: 'confirmed',
  });

  const [derivedEntry] = client.deriveWhitelistEntry('pilot-eu-casp', wallet);
  const { whitelistEntry, instruction } = client.buildAddWalletInstruction(
    'pilot-eu-casp',
    wallet,
    authority.publicKey,
  );

  assert.equal(whitelistEntry.toBase58(), derivedEntry.toBase58());
  assert.equal(instruction.programId.toBase58(), 'FXFMG4hzBcuRu33mVXyTHESH7FnsmUD6Fajr17FugbRt');
  assert.equal(instruction.keys.length, 3);
  assert.equal(instruction.keys[0]?.pubkey.toBase58(), whitelistEntry.toBase58());
  assert.equal(instruction.keys[1]?.pubkey.toBase58(), authority.publicKey.toBase58());
  assert.equal(instruction.data.length, 72);
  assert.deepEqual(
    instruction.data.subarray(0, 8),
    createHash('sha256').update('global:add_wallet').digest().subarray(0, 8),
  );
  assert.deepEqual(
    instruction.data.subarray(40, 72),
    new PublicKey(wallet).toBuffer(),
  );
});

test('solana wallet validation accepts and rejects expected addresses', () => {
  assert.equal(isValidSolanaAddress(Keypair.generate().publicKey.toBase58()), true);
  assert.equal(isValidSolanaAddress('not-a-solana-wallet'), false);
});
