import { loadRpcConfig } from '@treasuryos/sdk';

function main() {
  const rpc = loadRpcConfig();

  console.log(
    JSON.stringify(
      {
        message: 'Registry seeding scaffold is ready',
        rpc,
        nextStep: 'Implement wallet loading and program RPC calls once Anchor is installed',
      },
      null,
      2,
    ),
  );
}

main();
