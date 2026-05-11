# Nexus Trust — Ecosystem Map & Cross-Repo Integration
> Last sync: 2026-05-12 | Head Engineer: luisfelipevegarodriguez

## REPOS ACTIVOS — Inventario completo (Feb 2024 → May 2026)

| Repo | Stack | Estado | Revenue Link | Prioridad |
|---|---|---|---|---|
| **world-miniapp-payments** | TypeScript/Next.js | 🟢 PRODUCCIÓN | WLD+USDC fees, Dev Rewards, Retro Grant | **P0** |
| **grok-world-orchestrator** | JavaScript | 🟢 ACTIVO | DeFi yields 24/7 autopilot | **P0** |
| **mcp-coo-defi** | JavaScript | 🟢 ACTIVO | Aave/Morpho/Pendle yield optimizer | **P0** |
| **worldid-max-stack-2026** | Shell/TS | 🟡 STAGING | Retro grant evidence, n8n | **P1** |
| **elite-monorepo-template** | TypeScript | 🟡 ACTIVO | Plantilla reutilizable | **P1** |
| **nexus-trust-v4** | - | 🔴 STALE (Mar 2026) | Merge → world-miniapp-payments | **DEPRECATE** |
| **crypto-explorer** | TypeScript | 🟡 ACTIVO | Block explorer LATAM | **P2** |
| **real-execution-engine-v1** | JavaScript | 🟡 ACTIVO | n8n + Stripe pipeline | **P2** |
| **defi-autocorrective-bot** | - | 🟡 ACTIVO | Rebalancing + scoring | **P2** |
| **value-extraction-pipeline** | HTML | 🟡 ACTIVO | Ideas → deploy → monetize | **P2** |
| **worldid-github-n8n-stack** | - | 🔴 DUPLICADO | Merge → worldid-max-stack-2026 | **MERGE** |
| **dropship-ai-system** | Python | 🔴 COLD | No World App integration | **ARCHIVE** |
| **gemini-ai-chatbot** | TypeScript | 🔴 COLD | Reemplazado por Grok | **ARCHIVE** |
| **mi-proyecto-** | - | 🔴 COLD | GitHub Actions tutorial only | **ARCHIVE** |
| **luis-pipeline-mvp** | JavaScript | 🟡 ACTIVO | Webhook → LLM → deploy | **P3** |
| **-mi-nft-proyecto** | Python | 🔴 COLD | Archetype NFT, no activo | **ARCHIVE** |

## INTEGRACIÓN CROSS-REPO — Flujo de valor

```
world-miniapp-payments (P0 — Revenue principal)
    │
    ├──► grok-world-orchestrator
    │       └── Grok AI brain → optimiza yields en tiempo real
    │       └── World ID anti-sybil → nullifier_hash compartido
    │
    ├──► mcp-coo-defi  
    │       └── Aave + Morpho + Pendle → APY data → /api/agent-run
    │       └── GitHub Copilot agentic workflows → auto-rebalance
    │
    ├──► worldid-max-stack-2026
    │       └── n8n workflows → missions + viral loops
    │       └── Retro grant evidence collector
    │
    └──► elite-monorepo-template
            └── CI/CD OIDC → GHA workflows reutilizables
            └── ESLint + Husky + Renovate estándar
```

## REVENUE CONSOLIDADO — Todos los repos

| Fuente | Repo | Revenue/año | Deadline |
|---|---|---|---|
| World Dev Rewards ($100K/week pool) | world-miniapp-payments | $104K–520K WLD | Ongoing |
| Retroactive Grant (50K WLD) | worldid-max-stack-2026 | ~$150K one-time | **9 jun 2026** |
| DeFi yields autopilot (Morpho/Pendle) | grok-world-orchestrator | Variable (APY actual) | Ongoing |
| MiniPay Opera Celo ($1M pool) | world-miniapp-payments | Hasta $1M CELO | **30 jun 2026** |
| On-chain fees 0.5% | world-miniapp-payments | $182K–912K/año | Post-deploy |
| n8n + Stripe pipeline | real-execution-engine-v1 | Variable | Ongoing |
| **TOTAL POTENCIAL Y1** | | **$461K–1.5M+** | |

## ACCIONES PENDIENTES — Orden de ejecución

1. **[HOY]** Registrar `nexus-trust-payment-2026` → https://developer.worldcoin.org
2. **[HOY]** Conectar Upstash → https://vercel.com/marketplace/upstash
3. **[HOY]** Añadir 3 vars Vercel: `WORLD_API_KEY`, `GROK_API_KEY`, `NEXT_PUBLIC_PAYMENT_RECEIVER`
4. **[Esta semana]** Merge `nexus-trust-v4` → `world-miniapp-payments` (liquidar código útil)
5. **[Esta semana]** Merge `worldid-github-n8n-stack` → `worldid-max-stack-2026`
6. **[Antes 9 jun]** Submit Retroactive Grant → https://world.org/retro
7. **[Antes 30 jun]** Deploy Celo mainnet + Prezenti → https://www.prezenti.xyz
8. **[Archive]** `dropship-ai-system`, `gemini-ai-chatbot`, `mi-proyecto-`

## SEGURIDAD — Estado secrets cross-repo

| Secret | world-miniapp-payments | grok-world-orchestrator | mcp-coo-defi |
|---|---|---|---|
| `WORLD_API_KEY` | ⚠️ Pendiente Vercel | ⚠️ Verificar | ⚠️ Verificar |
| `GROK_API_KEY` | ⚠️ Pendiente Vercel | ✅ Configurado | ✅ Configurado |
| `DEPLOYER_PRIVATE_KEY` | ⚠️ Pendiente | N/A | ✅ Hardhat |
| `UPSTASH_REDIS_REST_*` | ⚠️ Pendiente | N/A | N/A |
| `DATABASE_URL` | ⚠️ Pendiente | N/A | N/A |
| `AGENT_CRON_SECRET` | ⚠️ Pendiente | N/A | N/A |

> ⚠️ = Añadir en Vercel Dashboard → Settings → Environment Variables
> Scripts: `bash scripts/gen-secrets.sh` auto-inyecta en Vercel
