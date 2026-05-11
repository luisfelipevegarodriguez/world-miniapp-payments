# World Ecosystem — Guía de Integración Máxima
> Fuentes oficiales: https://docs.world.org | https://developer.worldcoin.org
> Última actualización sincronizada: 2026-05-12

## Datos Clave del Ecosistema

| Componente | Detalles Técnicos | Link |
|---|---|---|
| **World ID** | ZKP anónima, verificación Orb (iris), autocustodia. `nullifier_hash` único por app. Niveles: Device / Orb | [docs.world.org/world-id](https://docs.world.org/world-id) |
| **World App** | Wallet gasless (Safe AA), USDC + WLD + ENS, >10M usuarios, World Chain nativa | [world.org/app](https://world.org/app) |
| **Orb** | Hardware open-source (GitHub Eagle), verifica singularidad biológica, datos biométricos eliminados post-verificación | [world.org/orb](https://world.org/orb) |
| **Mini Apps** | Web apps dentro de World App. MiniKit JS para ID + wallet + pay. Gas sponsored. Solo mainnet. | [docs.world.org/mini-apps](https://docs.world.org/mini-apps) |
| **MiniKit JS** | SDK oficial: `verify`, `pay`, `walletAuth`, `sendTransaction`. Reemplaza IDKit para mini apps | [docs.world.org/minikit](https://docs.world.org/minikit) |
| **AgentKit** | Delegación + supervisión humana + comercio agéntico. Integrado con Vercel/Okta/Exa/Browserbase | [docs.world.org/agents](https://docs.world.org/agents/agent-kit/integrate) |
| **Privacidad** | MPC (Multi-Party Computation) fragmenta secrets, RGPD compliant, cero PII almacenada | [world.org/privacy](https://world.org/privacy) |
| **WLD** | No disponible US/NY. Requiere verificación Orb. Ver riesgos antes de integrar | [world.org/risks](https://world.org/risks) |

## Corrección al Flujo de Integración

> Los pasos originales (Nginx + Ngrok) son para desarrollo local.
> Este repo usa el flujo de producción directo:

### Flujo Producción (este repo)

1. **Developer Portal** → [developer.worldcoin.org](https://developer.worldcoin.org)
   - Crear app → obtener `APP_ID` y `API_KEY`
   - Registrar action: `nexus-trust-payment-2026` (+ 4 agent-oversight actions)
2. **Vercel** → Añadir env vars: `NEXT_PUBLIC_WORLD_APP_ID`, `WORLD_API_KEY`
3. **Deploy** → `git push` → Vercel auto-deploys
4. **World App** → Ingresar URL de producción en Developer Portal
5. **Test** → Escanear QR en World App (dispositivo real)

### Flujo Desarrollo Local (para nuevas features)

```bash
git clone https://github.com/worldcoin/minikit-react-template.git
pnpm i
cp .env.example .env.local  # llenar APP_ID y API_KEY
npx ngrok http 3000          # exponer localhost
# Actualizar app URL en Developer Portal con URL ngrok
pnpm dev
```

## App Guidelines Compliance — [docs.world.org/mini-apps/guidelines](https://docs.world.org/mini-apps/guidelines/app-guidelines)

| Regla | Estado en este repo |
|---|---|
| No gambling / no sweepstakes | ✅ `pages/api/missions.ts` — viral missions sin loteras |
| Requiere verificación humana real | ✅ `verify.ts` — `VerificationLevel.Orb` obligatorio |
| No venta de datos | ✅ Solo `nullifier_hash` en DB, sin PII |
| Terms + Privacy obligatorios | ✅ `pages/terms.tsx` + `pages/privacy.tsx` |
| `health` endpoint para review | ✅ `pages/api/health.ts` |
| Gas sponsored para usuarios | ✅ World Chain — `pay` via MiniKit (gasless) |
| Solo mainnet para submissions | ✅ `hardhat.config.world.ts` — chain 480 |
| No phishing / no fake World UI | ✅ Componentes propios, sin imitar World UI |
| HTTPS obligatorio | ✅ Vercel enforced |
| Content Security Policy | ✅ `next.config.js` CSP headers |

## Casos de Uso Validados (Mini Apps reales)

| App | Mécanica | Relevancia para Nexus Trust |
|---|---|---|
| **Polls** | 1 humano = 1 voto | → Misiones de gobernanza |
| **Microlending** | Préstamos solo a humanos verificados | → DeFi LATAM con World ID gate |
| **USDC Payments** | Pago gasless + verify (Circle) | → **Core de este repo** |
| **eSIM / WLD Gifts** | Compra digital verificada | → IAP premium features |
| **Comercio agéntico** | Shopify + UCP + delegación | → AgentKit integrado |

## Stack Final Integrado

```
Nexus Trust Mini App
├─ World ID (ZKP Orb) → verify.ts
├─ MiniKit JS 2.0 → verify + pay + walletAuth
├─ AgentKit → delegación + supervisión + comercio
├─ Exa Search → 100 reqs/mes gratis para agentes
├─ Browserbase → navegación humana verificada
├─ Okta Human Principal → policy engine (beta)
├─ Vercel Workflow SDK → audit trail humano
├─ World Chain 480 + Celo 42220 → dual-chain
├─ DeFiLlama + Grok → yields autopilot
└─ MiniPay Opera → $1M CELO pool acceso
```

## Referencias Técnicas

- [MiniKit Docs](https://docs.world.org/minikit)
- [IDKit (web fallback)](https://docs.world.org/world-id/idkit/integrate)
- [App Guidelines](https://docs.world.org/mini-apps/guidelines/app-guidelines)
- [Mini Apps FAQ](https://docs.world.org/mini-apps/more/faq)
- [Circle USDC Integration](https://www.circle.com/blog/accepting-usdc-instantly-in-world-app-mini-apps-with-minikit-js)
- [Starter Kit](https://github.com/worldcoin/world-id-starter)
- [MiniKit React Template](https://github.com/worldcoin/minikit-react-template)
- [Video: Build Mini App en 10 min](https://www.youtube.com/watch?v=QJ0htHP6lb0)
