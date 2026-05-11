# 🏆 Grant Applications — Nexus Trust 2026

## World Foundation Retroactive — $50K WLD
**Deadline: June 9, 2026** → https://world.org/retro

### Action registration description (paste in Developer Portal)
```
Action ID: nexus-trust-payment-2026

Description:
Nexus Trust Payment Verification 2026 — Human-verified P2P payments on World Chain.
Every transaction is cryptographically tied to a unique real human via World ID (ZKP/Orb).
Anti-sybil: nullifier_hash deduplication prevents bots and duplicate identities.
Supports LATAM stablecoins (wARS, wCOP, wMXN, wBRL, wPEN) to fight inflation for
unbanked populations across 14 countries. Zero custody, zero bots, zero data selling.
```

### Grant application body (World Retroactive)
```
Project: Nexus Trust
Category: Payments + Financial Inclusion
Impact: Human-verified P2P payments for 14 LATAM + EU countries

**Problem solved:**
300M+ unbanked adults in LATAM lack access to safe, low-cost digital finance.
Inflation in AR (200%+), VE, CO destroys purchasing power with no hedge available.
Existing DeFi is inaccessible to non-technical users and full of bots.

**Our solution:**
Non-custodial payment mini app verified by World ID (Orb level).
Every user = 1 real human. Anti-sybil on-chain. No bots. No fake accounts.
AI agent (Grok + DeFiLlama) surfaces best yield opportunities automatically.
Build once, deploy web + World App via MiniKit 2.0.

**Tech stack:**
- World ID ZKP + verifyCloudProof (server-side)
- MiniKit 2.0: verify + pay + walletAuth
- Upstash Redis rate limiting (5 req/min sliding window)
- LATAM stablecoins: wARS, wCOP, wMXN, wBRL, wPEN, EURC
- GDPR/CCPA compliant: consent_log, nullifier dedup, data minimization
- OFAC geo-block + 14-country allowlist via Vercel Edge middleware
- Celo mainnet deploy for dual-chain presence

**Live evidence:**
- App: https://nexus-trust.vercel.app
- Metrics: https://nexus-trust.vercel.app/api/metrics
- Health: https://nexus-trust.vercel.app/api/health
- Repo: https://github.com/luisfelipevegarodriguez/world-miniapp-payments

**Grant use of funds:**
- 40% → user acquisition campaigns (LATAM, Spain)
- 30% → protocol integrations (Aave, Morpho, Pendle on World Chain)
- 20% → security audit (smart contract + backend)
- 10% → legal/compliance (MiCA filing)
```

---

## Celo Prezenti Anchor Pool — $25K
**Deadline: June 30, 2026** → https://www.prezenti.xyz

### Grant application body (Celo Prezenti)
```
Project: Nexus Trust — LATAM Financial Inclusion on Celo
Category: DeFi / Payments / Financial Access
Chain: Celo Mainnet (chainId 42220)

**Problem:**
Celo’s mission is financial inclusion for the unbanked. 300M+ LATAM adults
lack safe access to DeFi. Inflation destroys savings. Bots dominate existing protocols.

**Solution:**
First World ID-gated payment app on Celo. Every user is a verified human.
Non-custodial USDC + CELO payments with AI yield optimization.
Native support for wARS, wCOP, wMXN, wBRL, wPEN stablecoins.

**Celo-specific:**
- NexusTrustCelo.sol deployed on Celo mainnet
- Supports Celo native tokens (CELO, cUSD, cEUR)
- Target: 10,000 daily transactions via LATAM user base
- Carbon-neutral by design (Celo’s PoS)

**KPIs:**
- 10K verified humans (World ID Orb) by grant end
- 10K daily TX on Celo mainnet
- 14 LATAM/EU countries served

**Team:**
- Full-stack blockchain engineer, Madrid/LATAM
- DeFi protocol experience: Aave, Morpho, Pendle, Convex

**Live:**
- Contract: [post-deploy address from deploy-celo.sh]
- Celoscan: https://celoscan.io/address/[CONTRACT_ADDRESS]
- Metrics: https://nexus-trust.vercel.app/api/metrics
```

---

## Timeline

| Date | Action |
|---|---|
| May 12, 2026 | Register World action + add Vercel vars + redeploy |
| May 13, 2026 | Execute Celo mainnet deploy (deploy-celo.sh) |
| May 14, 2026 | Apply World Foundation Retroactive (world.org/retro) |
| May 30, 2026 | Apply Celo Prezenti (prezenti.xyz) |
| June 9, 2026 | **World Foundation deadline** |
| June 30, 2026 | **Celo Prezenti deadline** |
