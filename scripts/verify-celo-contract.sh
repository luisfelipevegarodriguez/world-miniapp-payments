#!/usr/bin/env bash
# Verify NexusTrustCelo.sol on Celoscan after deploy
# Required for Prezenti grant evidence
set -euo pipefail

[ -z "${CELO_CONTRACT_ADDRESS:-}" ] && echo "❌ Set CELO_CONTRACT_ADDRESS" && exit 1
[ -z "${CELOSCAN_API_KEY:-}" ] && echo "❌ Set CELOSCAN_API_KEY (https://celoscan.io/myapikey)" && exit 1

npx hardhat verify \
  --config hardhat.config.celo.ts \
  --network celo \
  --api-url https://api.celoscan.io/api \
  --api-key "$CELOSCAN_API_KEY" \
  "$CELO_CONTRACT_ADDRESS"

echo "✅ Contract verified on Celoscan"
echo "   https://celoscan.io/address/$CELO_CONTRACT_ADDRESS"
echo ""
echo ">> Add to GRANT_APPLICATIONS.md: Contract address + Celoscan link"
