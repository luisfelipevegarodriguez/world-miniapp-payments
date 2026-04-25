# World Mini App — Payments Boilerplate

Cobra **WLD y USDC** en World Chain desde una Mini App, con gas sponsoreado para humanos verificados.

## Stack
- **Frontend**: Next.js 14 + MiniKit-JS
- **Backend**: Next.js API routes (Node/TS)
- **DB**: PostgreSQL (tabla `payments`)
- **Deploy**: Vercel / GCP Cloud Run

## Setup rápido

```bash
npm install
cp .env.example .env.local   # rellenar APP_ID, DEV_PORTAL_API_KEY, DATABASE_URL
node scripts/migrate.js       # crear tabla payments
npm run dev
```

## Variables de entorno

| Variable | Dónde obtenerla |
|---|---|
| `APP_ID` | [Developer Portal](https://developer.worldcoin.org) |
| `DEV_PORTAL_API_KEY` | Developer Portal → API Keys |
| `DATABASE_URL` | Tu Postgres (Supabase, Neon, Cloud SQL...) |
| `NEXT_PUBLIC_APP_URL` | URL pública de tu deploy |

## Flujo de pago

```
Mini App → POST /api/generate-nonce → { reference }
         → MiniKit.commands.pay({ reference, to, tokens })
         → World App muestra pago → liquida en World Chain
         → PayResult → POST /api/confirm-payment
         → Developer Portal API verifica transactionId
         → DB: payments.status = 'confirmed'
         → Desbloquear producto/servicio
```

## Salir de DRY_RUN
1. Crear app en [Developer Portal](https://developer.worldcoin.org)
2. Completar `.env.local` con credenciales reales
3. Ejecutar migración DB
4. Deploy en Vercel: `vercel --prod`

## Endpoints

| Endpoint | Método | Body | Respuesta |
|---|---|---|---|
| `/api/generate-nonce` | POST | — | `{ reference: UUID }` |
| `/api/confirm-payment` | POST | `{ payload: PayResult }` | `{ verified: bool, transactionId }` |
