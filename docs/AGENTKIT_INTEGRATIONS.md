# AgentKit World ID — Integraciones disponibles
> Fuente: https://docs.world.org/agents/agent-kit/integrate

## Las 3 capacidades de AgentKit

| Capacidad | Qué hace | Archivo en este repo |
|---|---|---|
| **Delegación** | Agente acredita que actúa en nombre de humano real | `lib/agentkit.ts` |
| **Supervisión humana** | ZKP on-demand antes de acción sensible | `pages/api/agent-verify.ts` |
| **Comercio agéntico** | 1 humano = 1 agente = 1 asignación (anti-fraude) | `lib/agentkit.ts` |

## Partners integrados

### Vercel Workflow SDK
- **Qé**: Paso de verificación humana en cualquier workflow
- **Cómo**: `POST /api/agent-verify` retorna `workflow_continue: true`
- **Valor**: audit trail completo de aprobaciones humanas en logs Vercel
- **Npm**: `@vercel/workflow-sdk`

### Okta Human Principal (beta)
- **Qué**: API policy engine — distingue agentes verificados vs no verificados
- **Cómo**: World ID = primer partner en integrarse
- **Beta**: https://humanprincipal.ai
- **Valor**: limitar acciones por humano, proteger planes gratuitos

### Browserbase
- **Qué**: Navegación web para agentes con identidad humana verificada
- **Cómo**: `lib/browserbase.ts` → `X-World-Human-Principal` header
- **Valor**: agente pasa filtros antibot como tráfico legítimo
- **Docs**: https://browserbase.com

### Exa Search
- **Qué**: Búsqueda nativa para IA con 100 reqs/mes GRATIS para verificados
- **Cómo**: `lib/exa-search.ts` → World ID header + auto-fallback x402
- **Valor**: investigación DeFi, scraping yields, due diligence agentes
- **Docs**: https://exa.ai

### Shopify + UCP (Universal Commerce Protocol)
- **Qué**: E-commerce agéntico — 1 humano, 1 agente, 1 compra
- **Demo**: https://github.com/worldcoin/agentkit-shopify-demo
- **Estándar**: UCP por Shopify + Google

## Actions a registrar en Developer Portal

Además de `nexus-trust-payment-2026`, registrar estas actions en
https://developer.worldcoin.org para habilitar supervisión humana:

```
agent-oversight-payment    # Pagos > $50 USDC
agent-oversight-contract   # Firma de contratos (siempre)
agent-oversight-deploy     # Cambios en producción (siempre)
agent-oversight-purchase   # Compras > $100 USDC
```

## Flujo completo

```
Usuario (Orb-verified)
  │
  ├── Delega World ID → Agente recibe nullifier_hash
  │
  ├── Agente navega con Browserbase (tráfico humano legítimo)
  │
  ├── Agente busca con Exa (100 reqs/mes gratis)
  │
  ├── Acción sensible detectada (pago > $50)
  │     └── POST /api/agent-verify → MiniKit.verify(agent-oversight-payment)
  │     └── ZKP generado → audit trail en Vercel logs
  │
  └── Okta Human Principal valida policy → acción ejecutada
```
