import fs from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import crypto from 'crypto';

import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

import { RpcConfig, rpcConfigSchema } from '../config/rpc.js';
import { hashInstitutionSeed } from './compliance-registry.js';

function expandHome(path: string) {
  return path.startsWith('~/') ? resolve(homedir(), path.slice(2)) : path;
}

function encodeAddWalletInstruction(institutionId: string, walletAddress: string) {
  const discriminator = crypto.createHash('sha256').update('global:add_wallet').digest().subarray(0, 8);
  const wallet = new PublicKey(walletAddress);

  return Buffer.concat([
    discriminator,
    hashInstitutionSeed(institutionId),
    wallet.toBuffer(),
  ]);
}

export class WalletWhitelistClient {
  readonly connection: Connection;
  readonly programId: PublicKey;

  constructor(programId: string, rpcConfig: RpcConfig) {
    const parsedConfig = rpcConfigSchema.parse(rpcConfig);
    this.connection = new Connection(parsedConfig.url, parsedConfig.commitment);
    this.programId = new PublicKey(programId);
  }

  deriveWhitelistEntry(institutionId: string, walletAddress: string) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('wallet'),
        hashInstitutionSeed(institutionId),
        new PublicKey(walletAddress).toBuffer(),
      ],
      this.programId,
    );
  }

  buildAddWalletInstruction(institutionId: string, walletAddress: string, authority: PublicKey) {
    const [whitelistEntry] = this.deriveWhitelistEntry(institutionId, walletAddress);

    return {
      whitelistEntry,
      instruction: new TransactionInstruction({
        programId: this.programId,
        keys: [
          { pubkey: whitelistEntry, isSigner: false, isWritable: true },
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: encodeAddWalletInstruction(institutionId, walletAddress),
      }),
    };
  }

  async addWallet(
    institutionId: string,
    walletAddress: string,
    authority: Keypair,
  ) {
    const { whitelistEntry, instruction } = this.buildAddWalletInstruction(
      institutionId,
      walletAddress,
      authority.publicKey,
    );
    const transaction = new Transaction().add(instruction);
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [authority],
      { commitment: 'confirmed' },
    );

    return {
      signature,
      whitelistEntry: whitelistEntry.toBase58(),
    };
  }
}

export function isValidSolanaAddress(value: string) {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

export function loadAuthorityKeypair(keypairPath: string) {
  const resolvedPath = expandHome(keypairPath);
  const contents = fs.readFileSync(resolvedPath, 'utf8');
  const secretKey = Uint8Array.from(JSON.parse(contents));
  return Keypair.fromSecretKey(secretKey);
}
