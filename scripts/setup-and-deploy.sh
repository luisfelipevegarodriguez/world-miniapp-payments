#!/bin/bash
set -euo pipefail

echo "🚀 NEXUS TRUST — SETUP & DEPLOY OMEGA"
echo "======================================"

# ── 1. VALIDAR VARIABLES OBLIGATORIAS ──────────────────────────
REQUIRED_VARS=(
  NEXT_PUBLIC_WORLD_APP_ID
  WORLD_API_KEY
  NEXT_PUBLIC_WORLD_ACTION_ID
  DATABASE_URL
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  UPSTASH_REDIS_REST_URL
  UPSTASH_REDIS_REST_TOKEN
  NEXT_PUBLIC_PAYMENT_RECEIVER
  GROK_API_KEY
  AGENT_CRON_SECRET
  VERCEL_TOKEN
)

for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR:-}" ]; then
    echo "❌ FALTA: $VAR — añádela en Vercel y en tu shell antes de continuar"
    echo "→ https://vercel.com/luis-felipe-vega-s-projects/world-miniapp-payments/settings/environment-variables"
    exit 1
  fi
done
echo "✅ Variables OK"

# ── 2. SUPABASE — CREAR TABLAS ──────────────────────────────────
echo "📦 Creando tablas en Supabase..."
psql "$DATABASE_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS nullifiers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nullifier_hash text UNIQUE NOT NULL,
  action text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tx_hash text UNIQUE,
  user_id text,
  amount numeric(20,6),
  token text,
  chain text,
  status text DEFAULT 'pending',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS agent_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  action text NOT NULL,
  status text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS consent_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nullifier_hash text,
  action text,
  consented_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_nullifiers_hash ON nullifiers(nullifier_hash);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_tx ON payments(tx_hash);
CREATE INDEX IF NOT EXISTS idx_agent_logs_action ON agent_logs(action);
ALTER TABLE nullifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_log ENABLE ROW LEVEL SECURITY;
SQL
echo "✅ Supabase OK"

# ── 3. VERCEL — INYECTAR VARIABLES EN PRODUCCIÓN ────────────────
echo "⚙️  Sincronizando variables en Vercel..."
SECRETS=(
  "NEXT_PUBLIC_WORLD_APP_ID=$NEXT_PUBLIC_WORLD_APP_ID"
  "WORLD_API_KEY=$WORLD_API_KEY"
  "NEXT_PUBLIC_WORLD_ACTION_ID=$NEXT_PUBLIC_WORLD_ACTION_ID"
  "DATABASE_URL=$DATABASE_URL"
  "SUPABASE_URL=$SUPABASE_URL"
  "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY"
  "UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL"
  "UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN"
  "NEXT_PUBLIC_PAYMENT_RECEIVER=$NEXT_PUBLIC_PAYMENT_RECEIVER"
  "GROK_API_KEY=$GROK_API_KEY"
  "AGENT_CRON_SECRET=$AGENT_CRON_SECRET"
)

for SECRET in "${SECRETS[@]}"; do
  KEY="${SECRET%%=*}"
  VALUE="${SECRET#*=}"
  echo "$VALUE" | vercel env add "$KEY" production --token="$VERCEL_TOKEN" --yes 2>/dev/null || \
  echo "$VALUE" | vercel env rm "$KEY" production --token="$VERCEL_TOKEN" --yes 2>/dev/null && \
  echo "$VALUE" | vercel env add "$KEY" production --token="$VERCEL_TOKEN" --yes
done
echo "✅ Variables Vercel OK"

# ── 4. DEPLOY PRODUCCIÓN ────────────────────────────────────────
echo "🚢 Deploying to production..."
npm install --frozen-lockfile
vercel --prod --token="$VERCEL_TOKEN" --yes
echo "✅ Deploy OK"

# ── 5. SMOKE TESTS ──────────────────────────────────────────────
echo "🔍 Smoke tests..."
APP_URL="https://nexus-trust.vercel.app"

HEALTH=$(curl -sf "$APP_URL/api/health" | jq -r '.status' 2>/dev/null || echo "FAIL")
if [ "$HEALTH" != "ok" ]; then
  echo "❌ Health check FAILED"
  exit 1
fi
echo "✅ Health: $HEALTH"

METRICS=$(curl -sf "$APP_URL/api/metrics" | jq '{verified_users,total_transactions,total_volume_usd}')
echo "📊 Metrics: $METRICS"

echo ""
echo "════════════════════════════════════════"
echo "✅ NEXUS TRUST EN PRODUCCIÓN REAL"
echo "════════════════════════════════════════"
echo "App:     $APP_URL"
echo "Metrics: $APP_URL/api/metrics"
echo "Health:  $APP_URL/api/health"
echo ""
echo "⏰ GRANTS PENDIENTES:"
echo "  World Retroactive $50K WLD → https://world.org/retro (deadline 9 jun)"
echo "  Celo Prezenti $25K         → https://prezenti.xyz   (deadline 30 jun)"
echo "════════════════════════════════════════"
