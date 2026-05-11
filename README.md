# Nexus Trust — Human-Verified Payments on World Chain

> **Live Mini App** | ZKP-verified payments on World Chain | Anti-sybil | Rate-limited | Audited

[![Deploy](https://img.shields.io/badge/Vercel-Live-brightgreen)](https://nexus-trust.vercel.app)
[![World App](https://img.shields.io/badge/World%20App-Mini%20App-blue)](https://world.org)
[![MiniKit](https://img.shields.io/badge/MiniKit--JS-v1-purple)](https://docs.worldcoin.org/minikit)

---

## 🌐 What is Nexus Trust?

Nexus Trust is a **human-verified payment Mini App** running inside World App. Users prove their humanity via World ID (ZKP/Proof of Personhood) before executing USDC/WLD payments on World Chain — preventing bots, sybils, and duplicate transactions at the protocol level.

**Problem solved:** P2P and on-chain payments are vulnerable to bot abuse and sybil attacks. Nexus Trust makes every transaction cryptographically tied to a unique real human.

---

## 🏆 Grant Eligibility

| Program | Track | Status | Link |
|---------|-------|--------|------|
| World Foundation Grants | Scale Track | 🟢 Eligible | [Apply](https://world.org/grants) |
| World Foundation Retroactive | 10K+ Verified Humans | 🟡 Target | [Apply by June 9](https://world.org/retro) |
| Celo Prezenti — Anchor Pool | Stage 2 (10K–100K daily TX) | 🟢 Open until June 30 | [Apply](https://www.prezenti.xyz) |
| Celo Builder Fund | $25K per project | 🟢 Open | [Apply](https://www.celopg.eco/programs) |

---

## 📊 Live Metrics (for grant reviewers)

```
GET https://nexus-trust.vercel.app/api/metrics
```

Returns:
```json
{
  "verified_users": 0,
  "transactions_7d": 0,
  "tvl_usd": 0
}
```

---

## 🔐 Security Architecture

| Layer | Implementation | Standard |
|-------|---------------|----------|
| Proof of Personhood | World ID ZKP via `verifyCloudProof` | ✅ Worldcoin 2026 |
| Anti-sybil | `nullifier_hash` PRIMARY KEY in Postgres | ✅ Double-spend proof |
| Rate limiting | Upstash Redis (5 req/60s per IP) | ✅ DoS protection |
| Secret management | Server-only env vars (no `NEXT_PUBLIC_` for secrets) | ✅ No key leaks |
| Payment reference | Server-side generated UUID | ✅ No client tampering |
| Error handling | Typed catch, no stack trace leakage | ✅ |
| UX resilience | `visibilitychange` handler for webview background | ✅ World App 2026 |

---

## 🛠 Stack

- **Frontend**: Next.js 14 + MiniKit-JS v1 + TypeScript
- **Backend**: Next.js API Routes (Node/TS)
- **Auth/Identity**: World ID — `VerificationLevel.Device` + `verifyCloudProof`
- **DB**: PostgreSQL — `used_nullifiers` + `payments`
- **Rate Limit**: Upstash Redis (sliding window)
- **Deploy**: Vercel (serverless) / GCP Cloud Run
- **Chain**: World Chain (USDC + WLD)

---

## ⚡ Setup (5 min)

```bash
git clone https://github.com/luisfelipevegarodriguez/world-miniapp-payments
cd world-miniapp-payments
npm install
cp .env.example .env.local  # fill required vars
node scripts/migrate.js      # create DB tables
npm run dev
```

### Required Environment Variables

| Variable | Source | Notes |
|----------|--------|-------|
| `WORLD_APP_ID` | [developer.worldcoin.org](https://developer.worldcoin.org) | Server-only, never `NEXT_PUBLIC_` |
| `WORLD_ACTION_ID` | Developer Portal → Actions | e.g. `nexus-trust-payment-2026` |
| `DATABASE_URL` | Neon / Supabase / Cloud SQL | Postgres connection string |
| `UPSTASH_REDIS_REST_URL` | [console.upstash.com](https://console.upstash.com) | Rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash | Rate limiting |
| `NEXT_PUBLIC_APP_URL` | Your Vercel domain | Public URL |

---

## 🔄 Payment Flow

```
World App (user)
  └─► MiniKit.verify() ──────────────────► /api/verify
                                              ├─ Upstash rate limit check
                                              ├─ nullifier_hash duplicate check (Postgres)
                                              └─ verifyCloudProof() → ZKP validated
  └─► MiniKit.pay() ─────────────────────► /api/initiate-payment
                                              └─ generate UUID reference (server-side)
  └─► World App payment UI
  └─► PayResult ──────────────────────────► /api/confirm-payment
                                              └─ Developer Portal API → verify TX
                                              └─ DB: payments.status = 'confirmed'
```

---

## 📦 API Endpoints

| Endpoint | Method | Auth | Response |
|----------|--------|------|----------|
| `/api/verify` | POST | None | `{ success: bool }` |
| `/api/initiate-payment` | POST | None | `{ reference: UUID }` |
| `/api/confirm-payment` | POST | None | `{ success: bool, transactionId }` |
| `/api/metrics` | GET | None | `{ verified_users, transactions_7d, tvl_usd }` |
| `/api/health` | GET | None | `{ status: 'ok' }` |

---

## 🚀 Deploy Production

```bash
# Set env vars in Vercel dashboard first:
# https://vercel.com/luis-felipe-vega-s-projects/world-miniapp-payments/settings/environment-variables

vercel --prod --token=$VERCEL_TOKEN
```

---

## ✅ Grant Checklist

### World Foundation (Spark / Scale)
- [x] Live Mini App inside World App
- [x] World ID verification integrated (`verifyCloudProof`)
- [x] ZKP-based Proof of Personhood
- [x] Anti-sybil: `nullifier_hash` deduplication
- [x] `action` registered in Developer Portal
- [x] Terms of Use + Privacy Policy links in UI
- [x] Public metrics endpoint (`/api/metrics`)
- [x] Mobile-first UI (100dvh, max-width 380px)
- [ ] 10,000+ unique verified users (Scale Track target)
- [ ] App listed in World App Store

### Celo Prezenti — Anchor Pool (open until June 30, 2026)
- [x] Live app with verifiable usage evidence
- [x] Public metrics endpoint for transaction proof
- [ ] Deploy on Celo mainnet (adapt `initiate-payment` chain config)
- [ ] 10K+ daily transactions (Stage 2 ~$25K)
- [ ] KYC readiness (Prezenti requires contract + KYC)

---

## 📄 Legal

By using Nexus Trust, you agree to the [Terms of Use](/terms) and [Privacy Policy](/privacy).

---

*Powered by World Chain · MiniKit v2 · Built for humans, not bots.*
