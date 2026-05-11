# 🛡️ Legal + Security Pre-Submit Checklist — Nexus Trust (World App 2026)

> Gate obligatorio antes de enviar a World App Store y aplicar a grants.
> Basado en: [World Mini Apps Policy](https://docs.world.org/mini-apps/guidelines/policy) · [Aurum Law Guide 2026](https://aurum.law/newsroom/World-Mini-Apps-2026-The-Legal-and-Compliance-Guide-for-Developers) · GDPR · CCPA/CPRA · MiCA

---

## 1. Legal Foundation

- [ ] T&C propios (no copiados) accesibles en `/terms` — incluye: scope, limitación de responsabilidad, jurisdicción
- [ ] Privacy Policy propia en `/privacy` — incluye: qué datos, por qué, cuánto tiempo, con quién se comparte
- [ ] Ambos documentos linkeados en la UI antes de cualquier acción del usuario
- [ ] Jurisdicciones objetivo definidas (`TARGET_JURISDICTIONS`) — bloqueo o aviso en países excluidos
- [ ] No custodias claves ni fondos: diseño non-custodial puro (usuario paga desde su wallet)
- [ ] Sin promesas de retorno fijo ni pooling centralizado (evita perímetro MiCA/SEC valores mobiliarios)

---

## 2. Consentimiento de Usuario (GDPR Art. 7 + CCPA)

- [ ] Pantalla de consentimiento in-app **antes** de cualquier tracking o pago
- [ ] Sin dark patterns: checkbox desactivado por defecto, lenguaje claro
- [ ] `consent_status` almacenado por `nullifier_hash` en DB con timestamp y versión de texto
- [ ] Backend enforcement: ningún flujo de negocio ejecuta si `consent !== 'granted'`
- [ ] Botón de revocación / borrado de datos visible en settings o footer
- [ ] Audit log de consentimiento (timestamp, acción, versión del texto aceptado)

```ts
// enforcement mínimo en cada handler sensible
function assertConsent(body: unknown) {
  if ((body as any)?.consent !== 'granted') throw new Error('ConsentRequired');
}
```

---

## 3. Privacidad de Datos (GDPR + CCPA/CPRA)

- [ ] Data minimization: solo se recopila lo estrictamente necesario para la función
- [ ] Finalidad definida por campo: `nullifier_hash` (anti-sybil), `created_at` (audit), nada más
- [ ] Sin biométricos crudos almacenados — solo `nullifier_hash` (anónimo por diseño)
- [ ] Retención definida: `used_nullifiers` → TTL 365 días máximo
- [ ] Sin venta ni compartición de datos con terceros sin base legal
- [ ] SDKs de terceros (Upstash, Vercel, Grok API) declarados en Privacy + DPA firmado
- [ ] Procedimiento de acceso/borrado/corrección documentado (link en Privacy Policy)

---

## 4. Pagos Cripto — Regulación (MiCA / PSD2 / Money Transmitter)

- [ ] Modelo non-custodial confirmado: `MiniKit.pay()` = usuario firma desde su wallet
- [ ] No intermedias pagos para terceros como PSP — si lo haces, integra procesador regulado
- [ ] No ofreces yield gestionado centralmente ni retorno garantizado
- [ ] Volumen < umbrales AML (UE: €1.000/TX para cripto sin KYC) — si superas, integrar proveedor AML
- [ ] Refund/chargeback policy documentada para usuarios UE/US (consumer protection)
- [ ] Sin exposición a jurisdicciones prohibidas (OFAC sanctions list)

---

## 5. Seguridad Backend (MiniKit Security Audit)

- [ ] `verify`, `pay`, `walletAuth` — todos validados server-side, nunca confianza ciega en cliente
- [ ] `verifyCloudProof()` con `WORLD_APP_ID` server-only (sin `NEXT_PUBLIC_`)
- [ ] `nullifier_hash` PRIMARY KEY en DB — anti-sybil / double-spend proof
- [ ] Rate limiting Upstash (5 req/min escritura, 30 req/min lectura) en todos los endpoints críticos
- [ ] No stack traces expuestos al cliente — solo mensajes genéricos
- [ ] Secrets en env vars / Secret Manager — nunca en código ni logs
- [ ] TLS en todas las rutas (Vercel lo enforcea por defecto)
- [ ] Segregación dev/staging/production (env vars separadas)
- [ ] `visibilitychange` handler en cliente — evita estados colgados en webview
- [ ] Botones desactivados durante loading — previene double-submit

---

## 6. Checklist Técnico World App Store

- [ ] App registrada en [developer.worldcoin.org](https://developer.worldcoin.org)
- [ ] `action` registrado en Developer Portal: `nexus-trust-payment-2026`
- [ ] `WORLD_APP_ID` verificado y activo
- [ ] App abre correctamente en World App webview (no solo browser)
- [ ] `MiniKit.isInstalled()` comprobado antes de cualquier comando
- [ ] UI Mobile First: `max-width 380px`, `100dvh`, touch targets ≥ 44px
- [ ] Sin iframes externos no aprobados
- [ ] Sin tracking SDKs sin declarar

---

## 7. Grants — Evidence Gate

- [ ] `/api/metrics` público y respondiendo: `verified_users`, `transactions_7d`, `tvl_usd`
- [ ] `/api/health` respondiendo `{ status: 'ok' }`
- [ ] Tag `v1.0.0-grants` pusheado en git
- [ ] `Celo_Grant_Snippet.md` generado con links live + métricas
- [ ] **World Foundation Retroactive** → [world.org/retro](https://world.org/retro) — deadline **9 junio 2026**
- [ ] **Celo Prezenti Anchor Pool** → [prezenti.xyz](https://www.prezenti.xyz) — deadline **30 junio 2026**
- [ ] KYC completado para cobro de grants (Celo requiere contrato + KYC)

---

*Actualizado: mayo 2026 · Nexus Trust · [github.com/luisfelipevegarodriguez/world-miniapp-payments](https://github.com/luisfelipevegarodriguez/world-miniapp-payments)*
