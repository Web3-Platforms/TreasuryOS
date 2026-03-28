import { Keypair, Connection } from '@solana/web3.js';
import { WalletWhitelistClient, loadAuthorityKeypair } from '../packages/sdk/src/client/wallet-whitelist.js';

async function main() {
  const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
  const programId = '3ZaNXXp99xnWYYcaCJMJWnBfMxj2K4QpHkADV8D7321c';
  const authority = loadAuthorityKeypair('/Users/ekf/.config/solana/id.json');
  
  const client = new WalletWhitelistClient(programId, {
    url: 'http://127.0.0.1:8899',
    network: 'localnet',
    commitment: 'confirmed'
  });

  console.log('Sending transaction...');
  try {
    const result = await client.addWallet('pilot-eu-casp', 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH', authority);
    console.log('Success!', result);
  } catch (err) {
    console.error('Failed:', err);
  }
}

main().catch(console.error);
