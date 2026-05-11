# World Network Whitepapers — Alineación con Nexus Trust
> Whitepapers actualizados: 25 marzo 2026 | https://world.org/whitepaper
> Compliance: Título II Reglamento (UE) 2023/1114 (MiCA)

## Whitepaper 1 — Building World
> Red Mundial: Proof of Humanity + nueva infraestructura económica + red humana real

| Principio | Implementación en este repo |
|---|---|
| Proof of Humanity como capa base | `pages/api/verify.ts` — ZKP via `verifyCloudProof` |
| Nueva infraestructura económica | `contracts/NexusTrustFee.sol` — fees on-chain World Chain 480 |
| Red humana real (anti-sybil) | `lib/ratelimit.ts` — 1 nullifier = 1 usuario, sliding window |
| Empoderamiento individual | `lib/stablecoins.ts` — 8 stablecoins LATAM accesibles |
| Maximizar acceso financiero | `pages/api/minipay.ts` — Opera MiniPay Celo para LATAM |

## Whitepaper 2 — Achieving Proof of Humanity
> Cómo construir PoH alineado con empoderamiento individual

| Principio | Implementación |
|---|---|
| Verificación Orb sin PII | `pages/api/verify.ts` — solo `nullifier_hash` en DB, nunca datos biométricos |
| ZKP para privacidad | `lib/agentkit.ts` — `requestHumanApproval()` genera ZKP on-demand |
| Consent explícito | `pages/terms.tsx`, `pages/privacy.tsx` — GDPR/CCPA enforced antes de verify |
| Nullifier único por acción | `middleware.ts` — OFAC check + consent gate |
| Sin almacenamiento de datos | DB solo guarda `nullifier_hash` (no reversible a identidad) |

## Whitepaper 3 — Fostering Decentralization
> Cómo descentralizar y minimizar puntos centrales de fallo

| Principio | Implementación |
|---|---|
| Multi-chain (no vendor lock-in) | World Chain 480 + Celo 42220 (dual deploy) |
| Smart contracts auditables | `contracts/NexusTrustFee.sol` + `contracts/NexusTrustCelo.sol` |
| Fee capture on-chain | `collectFees()` solo owner — no custodia centralizada |
| Vercel regions redundantes | `vercel.json` — mad1 (Madrid) + gru1 (São Paulo) |
| Open source | Repo público — auditable por comunidad |
| AgentKit descentralizado | `lib/agentkit.ts` — delegación sin servidor central de confianza |

## Whitepaper 4 — Designing at Scale
> WLD para gobernanza, identidad y acceso financiero para cada persona verificada

| Principio | Implementación |
|---|---|
| WLD como token de gobernanza | `pages/dashboard.tsx` — Dev Rewards tracker en WLD |
| Identidad soberana | World ID via MiniKit — usuario controla su prueba |
| Acceso financiero universal | 8 stablecoins LATAM: wARS, wCOP, wMXN + USDC, WLD |
| Scale: 8.4M Orb-verified users | `pages/dashboard.tsx` — progress bar hacia 10K gate |
| Agentes verificados a escala | `lib/agentkit.ts` — delegación + supervisión + comercio agéntico |
| Compliance MiCA (UE 2023/1114) | `LEGAL_SECURITY_CHECKLIST.md` + GDPR consent enforcement |

## Compliance MiCA — Checklist

> Título II Reglamento (UE) 2023/1114 — aplicable a WLD y operaciones en EU

- [x] Whitepaper fair, clear, non-misleading (Art. 6)
- [x] Datos personales: solo nullifier_hash ZKP — sin PII (GDPR Art. 25)
- [x] Consent explícito antes de cualquier operación
- [x] Jurisdicciones restringidas: NY bloqueado via `middleware.ts` (OFAC)
- [x] WLD no distribuido en territorios restringidos — disclaimer en `pages/terms.tsx`
- [ ] Registro CNMV España (si volumen > umbral MiCA) — revisar con legal
- [ ] Auditoría smart contracts externa antes de $100K TVL

## Links directos Whitepapers

- [Whitepaper 1 — Building World](https://world.org/whitepaper/building-world)
- [Whitepaper 2 — Achieving Proof of Humanity](https://world.org/whitepaper/achieving-proof-of-humanity)
- [Whitepaper 3 — Fostering Decentralization](https://world.org/whitepaper/fostering-decentralization)
- [Whitepaper 4 — Designing at Scale](https://world.org/whitepaper/designing-at-scale)
- [AgentKit Docs](https://docs.world.org/agents/agent-kit/integrate)
- [Developer Portal](https://developer.worldcoin.org)
