async function main() {
  const API_URL = `http://127.0.0.1:3001/api`;

  console.log('Logging in as admin to get token for API...');
  
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@treasuryos.com', password: 'admin' })
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed: ${await loginRes.text()}`);
  }

  const { accessToken } = await loginRes.json();
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };

  console.log('Fetching approved entity ID...');
  const entitiesRes = await fetch(`${API_URL}/entities`, { headers: authHeaders });
  const { entities } = await entitiesRes.json();
  
  if (!entities || entities.length === 0) {
    console.error('No entities found. Create an entity first.');
    return;
  }
  
  const entityId = entities[0].id;
  console.log(`Using Entity ID: ${entityId}`);

  const dummyTransactions = [
    {
      amount: 450000,
      asset: 'USDC',
      destinationWallet: '8R1Qz...dummyWalletX',
      entityId,
      jurisdiction: 'EU',
      notes: 'High volume transfer',
      referenceId: `TX-SIM-${Date.now()}-1`,
      sourceWallet: '4cfb2...dummyWalletY',
    },
    {
      amount: 120,
      asset: 'USDT',
      destinationWallet: '9Ujk...dummyWalletZ',
      entityId,
      jurisdiction: 'US',
      notes: 'Small random test case',
      referenceId: `TX-SIM-${Date.now()}-2`,
      sourceWallet: 'AbCde...dummyWalletW',
    }
  ];

  for (const tx of dummyTransactions) {
    console.log(`Submitting screening for ${tx.referenceId}...`);
    const screeningRes = await fetch(`${API_URL}/transaction-cases`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(tx)
    });

    if (!screeningRes.ok) {
      console.error(`Failed to submit ${tx.referenceId}:`, await screeningRes.text());
    } else {
      const data = await screeningRes.json();
      console.log(`Screening created successfully: ID ${data.id} - Risk Level: ${data.riskLevel}`);
    }
  }

  console.log('Simulation complete! Check the dashboard Transaction Queue.');
}

main().catch(console.error);
