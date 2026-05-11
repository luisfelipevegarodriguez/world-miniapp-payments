# Nexus Trust — World Mini App

> Human-verified P2P payments on World Chain. Zero bots, zero sybils, real humans only.
> 🌎 LATAM financial inclusion — wARS, wCOP, wMXN, wBRL, wPEN, EURC

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/luisfelipevegarodriguez/world-miniapp-payments)
![Live](https://img.shields.io/badge/status-live-brightgreen)
![World ID](https://img.shields.io/badge/World%20ID-Orb%20verified-blue)
![MiniKit](https://img.shields.io/badge/MiniKit-2.0-purple)
![Celo](https://img.shields.io/badge/Celo-mainnet-yellow)

## Architecture

```
World ID ZKP → verify.ts → consent_log + nullifiers
     ↓
MiniKit 2.0 pay → confirm-payment.ts → payments table
     ↓
agent-run.ts (cron/10min) → DeFiLlama + Grok → agent_logs
     ↓
missions.ts → viral loops (deterministic, no gambling)
     ↓
metrics.ts → grant evidence → world.org/retro + prezenti.xyz
     ↓
middleware.ts → OFAC geo-block + TARGET_JURISDICTIONS
```

## Security (7 layers)

| Layer | Implementation |
|---|---|
| Human verification | World ID ZKP Orb level |
| Anti-sybil | nullifier_hash PRIMARY KEY (on-conflict reject) |
| Consent GDPR | consent_log per nullifier + version |
| Rate limiting | Upstash Redis 5 req/min sliding window |
| Geo-block | OFAC + allowlist via Vercel Edge middleware |
| Secret management | Vercel env vars only, no NEXT_PUBLIC_ for secrets |
| API security | Security headers: X-Frame-Options, nosniff, Permissions-Policy |

## Quick start

```bash
# 1. Clone + install
git clone https://github.com/luisfelipevegarodriguez/world-miniapp-payments
cd world-miniapp-payments && npm install

# 2. Copy env
cp .env.example .env.local
# Fill: WORLD_APP_ID, DATABASE_URL, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

# 3. Migrate DB
DATABASE_URL=postgresql://... node scripts/migrate.js

# 4. Dev
npm run dev

# 5. Production deploy
./world-miniapp-one-shot.sh
```

## Grant targets

| Grant | Amount | Deadline | Status |
|---|---|---|---|
| World Foundation Retroactive | $50K WLD | June 9, 2026 | ⏳ Applying |
| Celo Prezenti Anchor Pool | $25K | June 30, 2026 | ⏳ Applying |

**World Retroactive:** 10,000 verified humans → [world.org/retro](https://world.org/retro)
**Celo Prezenti:** 10K daily TX on Celo mainnet → [prezenti.xyz](https://www.prezenti.xyz)

## Live endpoints

- App: https://nexus-trust.vercel.app
- Metrics: https://nexus-trust.vercel.app/api/metrics
- Health: https://nexus-trust.vercel.app/api/health
- Terms: https://nexus-trust.vercel.app/terms
- Privacy: https://nexus-trust.vercel.app/privacy

## Supported countries

ES MX CO AR PE CL EC GT HN BO PY UY BR PT

*US excluded (money transmitter regulation). OFAC sanctioned countries blocked.*

## Legal

- [Terms of Service](/terms)
- [Privacy Policy](/privacy)
- Non-custodial: we never hold user funds
- GDPR/CCPA compliant
- Governing law: Spain (EU), Madrid courts
