import fs from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import crypto from 'crypto';
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionInstruction, } from '@solana/web3.js';
import { rpcConfigSchema } from '../config/rpc.js';
import { hashInstitutionSeed } from './compliance-registry.js';
function expandHome(path) {
    return path.startsWith('~/') ? resolve(homedir(), path.slice(2)) : path;
}
function encodeAddWalletInstruction(institutionId, walletAddress) {
    const discriminator = crypto.createHash('sha256').update('global:add_wallet').digest().subarray(0, 8);
    const wallet = new PublicKey(walletAddress);
    return Buffer.concat([
        discriminator,
        hashInstitutionSeed(institutionId),
        wallet.toBuffer(),
    ]);
}
export class WalletWhitelistClient {
    connection;
    programId;
    constructor(programId, rpcConfig) {
        const parsedConfig = rpcConfigSchema.parse(rpcConfig);
        this.connection = new Connection(parsedConfig.url, parsedConfig.commitment);
        this.programId = new PublicKey(programId);
    }
    deriveWhitelistEntry(institutionId, walletAddress) {
        return PublicKey.findProgramAddressSync([
            Buffer.from('wallet'),
            hashInstitutionSeed(institutionId),
            new PublicKey(walletAddress).toBuffer(),
        ], this.programId);
    }
    buildAddWalletInstruction(institutionId, walletAddress, authority) {
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
    async addWallet(institutionId, walletAddress, authority) {
        const { whitelistEntry, instruction } = this.buildAddWalletInstruction(institutionId, walletAddress, authority.publicKey);
        const transaction = new Transaction().add(instruction);
        const signature = await sendAndConfirmTransaction(this.connection, transaction, [authority], { commitment: 'confirmed' });
        return {
            signature,
            whitelistEntry: whitelistEntry.toBase58(),
        };
    }
}
export function isValidSolanaAddress(value) {
    try {
        new PublicKey(value);
        return true;
    }
    catch {
        return false;
    }
}
export function loadAuthorityKeypair(keypairPath) {
    const resolvedPath = expandHome(keypairPath);
    const contents = fs.readFileSync(resolvedPath, 'utf8');
    return loadAuthorityKeypairFromJson(contents);
}
export function loadAuthorityKeypairFromJson(contents) {
    const secretKey = Uint8Array.from(JSON.parse(contents));
    return Keypair.fromSecretKey(secretKey);
}
//# sourceMappingURL=wallet-whitelist.js.map