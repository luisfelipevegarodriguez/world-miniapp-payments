#!/usr/bin/env bash
# Generate all required secrets + add to Vercel in one shot
# Usage: VERCEL_TOKEN=xxxx bash scripts/gen-secrets.sh
set -euo pipefail

[ -z "${VERCEL_TOKEN:-}" ] && echo "❌ Set VERCEL_TOKEN first" && exit 1

ORG_SCOPE="luis-felipe-vega-s-projects"
PROJECT="world-miniapp-payments"

AGENT_SECRET=$(openssl rand -hex 32)
echo "✅ AGENT_CRON_SECRET generated: $AGENT_SECRET"

# Add to Vercel
echo "$AGENT_SECRET" | vercel env add AGENT_CRON_SECRET production --token="$VERCEL_TOKEN" --scope="$ORG_SCOPE" --yes 2>/dev/null || \
  vercel env rm AGENT_CRON_SECRET production --token="$VERCEL_TOKEN" --scope="$ORG_SCOPE" --yes 2>/dev/null && \
  echo "$AGENT_SECRET" | vercel env add AGENT_CRON_SECRET production --token="$VERCEL_TOKEN" --scope="$ORG_SCOPE" --yes

echo "✅ AGENT_CRON_SECRET added to Vercel production"
echo ""
echo "⚠️  Still need manual input:"
echo "   1. GROK_API_KEY=xai-xxxx  (get from console.x.ai)"
echo "   2. NEXT_PUBLIC_PAYMENT_RECEIVER=0x...  (your treasury wallet)"
echo "   3. WORLD_APP_ID=app_xxxx  (from developer.worldcoin.org)"
echo ""
echo "🔄 Run: vercel --prod --scope=$ORG_SCOPE --token=\$VERCEL_TOKEN to redeploy"
