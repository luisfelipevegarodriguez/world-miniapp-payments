# Copilot instructions — Nexus Trust

La guía completa está en `AGENTS.md` (raíz). Si cambias un comando, la región o una regla, actualiza los dos archivos.

## Stack

- Paquete `nexus-trust` 2.0.0. Next.js 15.5.29, Pages Router (`pages/`). React 18.3. TypeScript 5 con `strict` y `noEmit`. No hay `src/` ni App Router.
- Alias `@/*` → `./*` (también `./src/*`). Importa `@/lib/...` y `@/components/...`.
- Verificación local y CI: Node 22 (`actions/setup-node` con `node-version: 22`). Comprobado con Node v22.23.4 y npm 10.9.9. No hay `engines` ni `.nvmrc`.
- `Dockerfile` usa `node:20-alpine`. No lo cambies salvo que te lo pidan. Vercel Hobby no despliega esa imagen.
- World: `@worldcoin/minikit-js` ^1.11.0, `@worldcoin/idkit` ^1.5.0.
- Postgres con `pg`, externo al bundle (`serverExternalPackages`). `getPool()` es `null` sin `DATABASE_URL`.
- Rate limit Upstash. `getRatelimit()` es `null` sin URL y token.
- Hardhat 2 y `contracts/NexusTrustFee.sol` son solo scripts. No entran en `next build`.
- ESLint 9.39.5 llega transitivo de `eslint-config-next@15.5.29`. La config es `eslint.config.js` (no carga el plugin de Next).

## Comandos exactos

Comprobados el 2026-11-12, sin variables de entorno:

- Instalar: `npm ci` (lockfile; es el `installCommand` de `vercel.json`). Exit 0. No uses `npm install` salvo para cambiar dependencias. No ejecutes `npm audit fix` por tu cuenta.
- Build: `npm run build` (`next build`). Exit 0 con el entorno vacío.
- Tipos: `npm run typecheck` (`tsc --noEmit`). Exit 0.
- Lint: `npx eslint . --ignore-pattern .next`. Exit 0 antes y después del build. Sin ese patrón, `npx eslint .` solo sale 0 si no existe `.next/`; tras el build lintea bundles generados y falla. No arregles `.next/` ni cambies `eslint.config.js` por eso. Node avisa que `eslint.config.js` es ESM porque `package.json` no tiene `"type": "module"`. No añadas ese campo para callar el aviso.
- Test: no hay comando. `npm test` sale 1 con `Missing script: "test"`. No hay archivos `*.test.*` ni `*.spec.*`.
- `npm run lint` no existe (exit 1, `Missing script: "lint"`). CI llama `npm run lint --if-present` y `npm test --if-present`, así que esos pasos no comprueban nada.

`next build` también lintea y avisa de que falta el plugin de Next en ESLint. El build igual termina. No reescribas `eslint.config.js` para quitar el aviso salvo que te lo pidan.

## Estructura

- `pages/` UI. `pages/api/` handlers. `components/` (`ConfigStatus`, `MiniKitProvider`, `WorldIDWidget`). `lib/` (config, db, ratelimit, minikit). `styles/globals.css`. `middleware.ts`. `public/`. `contracts/`. `scripts/`. `vercel.json`. `.env.example`.

## Convenciones

- API: export default del handler. Método distinto de POST → 405. Si `!getConfigStatus().configured` → 503 y `notConfiguredBody()`.
- El estado público lista nombres de variables, nunca valores. Secretos de servidor sin `NEXT_PUBLIC_`.
- Middleware de Next.js. El país llega en `x-vercel-ip-country` (Next.js 15 quitó `req.geo`). No pongas `runtime = 'edge'`.
- ESLint: `===`, sin `var`, sin `++`, sin `eval`, `const` si se puede, llaves siempre. Comillas simples y punto y coma. UI en español, identificadores en inglés.
- Un PR, un tema.

## Reglas

- Vercel Hobby, gratis. No pases a Pro ni actives add-ons de pago. Al superar la cuota, Hobby pausa; no factura. https://vercel.com/docs/plans/hobby
- Una región: `vercel.json` tiene `"regions": ["gru1"]`. No añadas otra. https://vercel.com/docs/functions/limitations
- Cron actual: `0 12 * * *` → `/api/agent-run`. En Hobby un cron más de una vez al día falla el deploy. No lo acortes ni añadas crons. https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing
- Sin servicios de pago. No añadas Stripe, bases de datos de pago, observabilidad de pago, IA de pago ni SDK nuevos. Upstash, Postgres, Grok, Exa, Browserbase y Supabase siguen opcionales y apagados si su env está vacío.
- Pagos desactivados por defecto. Con env vacío, `/` muestra `ConfigStatus` y las APIs de pago y verificación responden 503. No hardcodees receptor, app id ni API key. No saltes `getConfigStatus()`.
- No commitees secretos. `.env`, `.env.local`, `.env.production`, `*.pem`, `*.key` y `secrets.json` están en `.gitignore`. `.env.example` solo tiene placeholders.
- Antes de cerrar: `npm run typecheck`, `npx eslint . --ignore-pattern .next` y `npm run build` con env vacío. Si cambias dependencias, `npm ci` y commitea el lockfile. Sin force-push y sin borrar archivos ajenos al cambio.
- No ejecutes los scripts de deploy. No reescribas `ci.yml` (ya tiene concurrency y caché de npm), `deploy.yml`, `codeql.yml`, `autofix.yml` ni `god-mode-ci.yml`. Actions puede estar bloqueado por facturación; el YAML debe seguir siendo válido.
- No cambies código de la app en una tarea que solo prepara el repo para asistentes. No añadas scripts `lint` o `test` de relleno.
