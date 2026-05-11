# CHECKLIST MÁXIMO — Nexus Trust World App
> 2026-05-12 01:10 CEST | Ejecutar en orden estricto

---

## 🔴 BLOQUE 1 — DESBLOQUEO PRODUCCIÓN (HOY, 30 min)

- [ ] **1.1** Abrir https://developer.worldcoin.org
- [ ] **1.2** Crear/seleccionar app → copiar `APP_ID` (formato `app_xxxx`)
- [ ] **1.3** Registrar 5 actions:
  - `nexus-trust-payment-2026`
  - `agent-oversight-payment`
  - `agent-oversight-contract`
  - `agent-oversight-deploy`
  - `agent-oversight-purchase`
- [ ] **1.4** Copiar `WORLD_API_KEY` del portal
- [ ] **1.5** Abrir https://vercel.com/luis-felipe-vega-s-projects → Settings → Env
- [ ] **1.6** Añadir vars:
  ```
  NEXT_PUBLIC_WORLD_APP_ID=app_xxxx
  WORLD_API_KEY=api_xxxx
  GROK_API_KEY=xai-xxxx
  NEXT_PUBLIC_PAYMENT_RECEIVER=0xTU_WALLET
  AGENT_CRON_SECRET=$(openssl rand -hex 32)
  DATABASE_URL=postgresql://...
  ```
- [ ] **1.7** Conectar Upstash → https://vercel.com/marketplace/upstash (auto-inyecta `UPSTASH_*`)
- [ ] **1.8** Vercel → Redeploy → verificar build verde ✅
- [ ] **1.9** World App → escanear QR de la app desplegada → test pago real

---

## 🟠 BLOQUE 2 — CELO MAINNET (Esta semana, deadline 30 jun)

- [ ] **2.1** Añadir a Vercel: `DEPLOYER_PRIVATE_KEY`, `CELO_PRIVATE_KEY`, `CELOSCAN_API_KEY`
- [ ] **2.2** `bash scripts/deploy-celo.sh`
- [ ] **2.3** `bash scripts/verify-celo-contract.sh`
- [ ] **2.4** Copiar `CELO_CONTRACT_ADDRESS` → añadir a Vercel
- [ ] **2.5** Submit Prezenti → https://www.prezenti.xyz (**deadline 30 jun**)
- [ ] **2.6** Añadir a Vercel: `EXA_API_KEY`, `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID`

---

## 🟡 BLOQUE 3 — GRANT RETROACTIVO (deadline 9 JUNIO ⚠️)

- [ ] **3.1** Verificar `/api/metrics` devuelve datos reales (evidencia para jurado)
- [ ] **3.2** Abrir `GRANT_APPLICATIONS.md` → revisar texto
- [ ] **3.3** Submit → https://world.org/retro
  - Adjuntar: URL app, repo GitHub, métricas `/api/metrics`
  - Valor: **50K WLD ≈ $150K** (pago 20 jun)
- [ ] **3.4** Submit `worldid-max-stack-2026` como proyecto secundario si aplica

---

## 🟢 BLOQUE 4 — REPO CLEANUP (Esta semana)

- [ ] **4.1** Merge `nexus-trust-v4` → `world-miniapp-payments` (rescatar código útil)
- [ ] **4.2** Merge `worldid-github-n8n-stack` → `worldid-max-stack-2026`
- [ ] **4.3** Archive en GitHub: `dropship-ai-system`, `gemini-ai-chatbot`, `mi-proyecto-`
- [ ] **4.4** Unificar secrets entre `grok-world-orchestrator` y `mcp-coo-defi`
- [ ] **4.5** Apuntarse a Okta Human Principal beta → https://humanprincipal.ai

---

## 🔵 BLOQUE 5 — GROWTH (Post-producción)

- [ ] **5.1** Activar World Dev Rewards tracking → `/dashboard` → meta 10K humans
- [ ] **5.2** Activar missions virales → `/api/missions`
- [ ] **5.3** Configurar Shopify UCP demo → https://github.com/worldcoin/agentkit-shopify-demo
- [ ] **5.4** PR a awesome-world-apps para visibilidad
- [ ] **5.5** Submit a World App Store listing oficial

---

## 📊 REVENUE ESPERADO POR BLOQUE

| Bloque | Acción | Revenue |
|---|---|---|
| 1 | Producción live | $0 → activa contador |
| 2 | Celo + Prezenti | Hasta $1M CELO pool |
| 3 | Retroactive Grant | **$150K one-time** (9 jun) |
| 5 | Dev Rewards @10K users | $2K–10K/semana WLD |
| 5 | Fees 0.5% on-chain | $182K–912K/año |
| **Total Y1** | | **$461K–1.5M+** |

---

## ⚡ ESTADO ACTUAL

```
Código:     ████████████████████ 100% ✅
Contratos:  ████████████████████ 100% ✅  
Docs:       ████████████████████ 100% ✅
Secrets:    ░░░░░░░░░░░░░░░░░░░░   0% ⏳ (Bloque 1)
Producción: ░░░░░░░░░░░░░░░░░░░░   0% ⏳ (Bloque 1)
Revenue:    ░░░░░░░░░░░░░░░░░░░░   0% ⏳ (Bloque 1)
```

**Todo el código está listo. Solo falta ejecutar Bloque 1 (30 min).**
