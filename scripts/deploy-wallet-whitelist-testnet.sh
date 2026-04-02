#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROGRAM_SO="$REPO_ROOT/target/deploy/wallet_whitelist.so"
PROGRAM_KEYPAIR="$REPO_ROOT/target/deploy/wallet_whitelist-keypair.json"
WALLET_PATH="${1:-$HOME/.config/solana/treasuryos-testnet-authority.json}"
CLUSTER_URL="${SOLANA_DEPLOY_URL:-https://api.testnet.solana.com}"

if ! command -v solana >/dev/null 2>&1; then
  echo "solana CLI is required." >&2
  exit 1
fi

if ! command -v anchor >/dev/null 2>&1; then
  echo "anchor CLI is required." >&2
  exit 1
fi

if [[ ! -f "$WALLET_PATH" ]]; then
  echo "Authority wallet not found: $WALLET_PATH" >&2
  exit 1
fi

if [[ ! -f "$PROGRAM_SO" || ! -f "$PROGRAM_KEYPAIR" ]]; then
  echo "Build artifacts are missing. Run: anchor build -p wallet-whitelist" >&2
  exit 1
fi

AUTHORITY_PUBKEY="$(solana address -k "$WALLET_PATH")"
PROGRAM_ID="$(solana address -k "$PROGRAM_KEYPAIR")"
BALANCE="$(solana balance -k "$WALLET_PATH" --url "$CLUSTER_URL" || true)"

echo "Authority wallet: $AUTHORITY_PUBKEY"
echo "Wallet balance on target cluster: $BALANCE"
echo "Program ID: $PROGRAM_ID"
echo "Cluster URL: $CLUSTER_URL"
echo

solana program deploy \
  --url "$CLUSTER_URL" \
  --keypair "$WALLET_PATH" \
  --program-id "$PROGRAM_KEYPAIR" \
  "$PROGRAM_SO"

echo
echo "Deployment verification:"
solana program show "$PROGRAM_ID" --url "$CLUSTER_URL"
echo
echo "Explorer:"
echo "https://explorer.solana.com/address/$PROGRAM_ID?cluster=testnet"
