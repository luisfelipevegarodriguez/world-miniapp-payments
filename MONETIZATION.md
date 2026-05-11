# Nexus Trust — Monetization Strategy 2026

## Revenue streams (implemented)

| Stream | Implementation | Potential Year 1 |
|---|---|---|
| World Dev Rewards | `/api/dev-rewards.ts` — 10K users | $104K–520K (WLD) |
| Retroactive Grant | `GRANT_APPLICATIONS.md` | $150K one-time |
| 0.5% tx fee | `NexusTrustFee.sol` on-chain | $182K (10K daily tx × $10) |
| Celo Prezenti + MiniPay | `scripts/deploy-celo.sh` | $25K–$1M CELO |
| In-app subscriptions | Premium yield alerts | TBD |
| **Total conservative** | | **$461K Year 1** |

## World Dev Rewards qualification

- Pool: **$100K/week** shared among top apps
- Source: https://world.org/blog/announcements/dev-rewards-pilot-increases-to-100k-per-week
- Minimum: **10,000 verified humans** (Orb level)
- Tracking: `/api/dev-rewards` endpoint
- Dashboard: `/dashboard`

## Retroactive grant ($50K WLD ≈ $150K)

- Deadline: **June 9, 2026**
- Apply: https://world.org/retro
- Text ready: `GRANT_APPLICATIONS.md`

## Fee capture model (NexusTrustFee.sol)

```
0.5% fee on every payment processed through smart contract
Revenue = daily_tx × avg_amount × 0.005
At 10K tx/day × $10 avg = $500/day = $182,500/year
At 10K tx/day × $50 avg = $2,500/day = $912,500/year
```

## MiniPay (Opera) — $1M CELO pool

- Source: https://press.opera.com/2026/04/22/minipay-builders-incentive-and-roadshow/
- Deadline: June 30, 2026
- Same codebase: MiniKit compatible
- Apply alongside Celo Prezenti

## Growth loop

```
Verify (World ID)
  → First payment → Mission “First Human” (+XP)
  → Daily yield check → Mission “Yield Hunter” (+XP)
  → Referral → Mission “Ambassador” (+XP)
  → Leaderboard → WLD prize pool
  → More users → Dev Rewards qualification
```

## NOT allowed (compliance)

- ❌ Selling user data (GDPR/World policy)
- ❌ Promising fixed yields (securities law)
- ❌ Chance-based rewards without disclosure
- ❌ Custodying user funds
- ❌ Using “World” or “Worldcoin” in app name
