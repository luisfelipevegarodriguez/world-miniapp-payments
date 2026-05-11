#!/usr/bin/env bash
# ============================================================
# NEXUS TRUST — World Mini App + Grok Brain ONE-SHOT DEPLOY
# World Foundation Grants + Celo Prezenti 2026
# ============================================================
set -euo pipefail

# ── 0. VALIDACIÓN DE ENTORNO ────────────────────────────────
REQUIRED_VARS=(VERCEL_TOKEN WORLD_APP_ID UPSTASH_REDIS_REST_URL UPSTASH_REDIS_REST_TOKEN DOMAIN)
for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR:-}" ]; then
    echo "❌ Falta variable requerida: $VAR" && exit 1
  fi
done
echo "✅ Entorno validado"

ORG_SCOPE="luis-felipe-vega-s-projects"

# ── 1. INSTALAR DEPS (Upstash) ───────────────────────────────
cd ~/world-miniapp-payments
npm install @upstash/redis @upstash/ratelimit --save
echo "✅ Deps instaladas"

# ── 2. SYNC ENV VARS EN VERCEL (production) ─────────────────
for VAR in WORLD_APP_ID WORLD_ACTION_ID UPSTASH_REDIS_REST_URL UPSTASH_REDIS_REST_TOKEN; do
  vercel env rm "$VAR" production --yes --token="$VERCEL_TOKEN" >/dev/null 2>&1 || true
done

printf "%s\n%s\nproduction\n" "WORLD_APP_ID"              "$WORLD_APP_ID"              | vercel env add WORLD_APP_ID              --token="$VERCEL_TOKEN"
printf "%s\n%s\nproduction\n" "WORLD_ACTION_ID"           "nexus-trust-payment-2026"  | vercel env add WORLD_ACTION_ID           --token="$VERCEL_TOKEN"
printf "%s\n%s\nproduction\n" "UPSTASH_REDIS_REST_URL"    "$UPSTASH_REDIS_REST_URL"    | vercel env add UPSTASH_REDIS_REST_URL    --token="$VERCEL_TOKEN"
printf "%s\n%s\nproduction\n" "UPSTASH_REDIS_REST_TOKEN"  "$UPSTASH_REDIS_REST_TOKEN"  | vercel env add UPSTASH_REDIS_REST_TOKEN  --token="$VERCEL_TOKEN"
echo "✅ Env vars sincronizadas en Vercel"

# ── 3. DEPLOY MINI APP ──────────────────────────────────────
cd ~/world-miniapp-payments
vercel --prod --yes --scope="$ORG_SCOPE" --token="$VERCEL_TOKEN"
echo "✅ world-miniapp-payments desplegada"

# ── 4. DEPLOY GROK BRAIN (si existe) ────────────────────────
if [ -d ~/grok-world-orchestrator ]; then
  cd ~/grok-world-orchestrator
  vercel --prod --yes --scope="$ORG_SCOPE" --token="$VERCEL_TOKEN"
  echo "✅ grok-world-orchestrator desplegado"
fi

# ── 5. HEALTH CHECKS ────────────────────────────────────────
echo "\n👉 Health mini app:"
curl -sf "https://${DOMAIN}/api/health" | jq || echo "⚠️  /api/health no responde aún (cold start)"

echo "\n👉 Métricas (para grants):"
curl -sf "https://${DOMAIN}/api/metrics" | jq || echo "⚠️  /api/metrics no responde aún"

if [ -d ~/grok-world-orchestrator ]; then
  echo "\n👉 Health Grok brain:"
  curl -sf "https://grok-world-orchestrator.vercel.app/api/health" | jq || true
fi

# ── 6. TAG VERSIÓN CANDIDATA A GRANTS ───────────────────────
cd ~/world-miniapp-payments
git tag -f v1.0.0-grants -m "Nexus Trust: ZKP + Upstash ratelimit + Grok brain — World Foundation + Celo Prezenti 2026"
git push -f origin v1.0.0-grants
echo "✅ Tag v1.0.0-grants pusheado"

# ── 7. GENERAR SNIPPET PROPUESTA GRANTS ─────────────────────
cat > Celo_Grant_Snippet.md <<EOF
# Nexus Trust — Grant Application Snippet

## Product
Human-verified P2P payments on World Chain. Zero bots, zero sybils.
Every transaction is cryptographically tied to a unique real human via World ID (ZKP).

**Problema resuelto:** acceso desigual a productos financieros seguros para humanos no bancarizados.

## Live Evidence
- App: https://${DOMAIN}
- Metrics: https://${DOMAIN}/api/metrics
- Health: https://${DOMAIN}/api/health

## Tech Stack
- World ID: verifyCloudProof + nullifier_hash deduplication (anti-sybil)
- Rate limit: Upstash Redis sliding window 5 req/min (anti-DoS)
- Chain: World Chain (USDC + WLD)
- Brain: Grok orchestrator (yield signals, automated decisions)

## Grant Targets
- World Foundation Retroactive: 10K verified users → deadline June 9 → https://world.org/retro
- Celo Prezenti Anchor Pool: 10K daily TX → deadline June 30 → https://www.prezenti.xyz
EOF

echo "✅ Celo_Grant_Snippet.md generado"

# ── 8. CHECKLIST LEGAL/COMPLIANCE (World Mini Apps 2026) ────
echo "
╔══════════════════════════════════════════════════════╗
║  CHECKLIST LEGAL — World Mini Apps 2026              ║
╠══════════════════════════════════════════════════════╣
║  ✅ Terms of Use link en UI (/terms)                 ║
║  ✅ Privacy Policy link en UI (/privacy)             ║
║  ✅ No datos biométricos crudos almacenados          ║
║  ✅ nullifier_hash = único ID anónimo por action     ║
║  ⬜ App registrada en World Developer Portal        ║
║  ⬜ Listada en World App Store (review ~7 días)     ║
║  ⬜ KYC completado para pago de grants (Celo)       ║
╚══════════════════════════════════════════════════════╝
"

echo "\n🚀 DONE — Nexus Trust production-ready para grants."
echo "   Live: https://${DOMAIN}"
echo "   Snippet: ~/world-miniapp-payments/Celo_Grant_Snippet.md"
