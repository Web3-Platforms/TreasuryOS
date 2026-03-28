#!/bin/zsh
set -euo pipefail

NETWORK="${1:-devnet}"
KEYPAIR="${AUTHORITY_KEYPAIR_PATH:-$HOME/.config/solana/id.json}"

echo "Deploying TreasuryOS programs to ${NETWORK} using ${KEYPAIR}"

anchor build

for PROGRAM in compliance-registry wallet-whitelist tx-monitor; do
  echo "Deploying ${PROGRAM}"
  anchor deploy \
    --program-name "${PROGRAM}" \
    --provider.cluster "${NETWORK}" \
    --provider.wallet "${KEYPAIR}"
done

solana program show --programs --url "${NETWORK}"
