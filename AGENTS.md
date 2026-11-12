# AGENTS.md

Instrucciones para GitHub Copilot, Cursor y cualquier asistente que edite este repositorio.
La versión breve está en `.github/copilot-instructions.md`. Si cambias un comando, la región o una regla, actualiza los dos archivos en el mismo cambio.

## Qué es

Nexus Trust (`nexus-trust` 2.0.0) es una mini app de pagos P2P con verificación World ID sobre World Chain. El código de la app vive en el Pages Router de Next.js. El despliegue previsto es Vercel, plan Hobby (gratis), una sola región.

## Stack

| Pieza | Hecho en este repo |
| --- | --- |
| Next.js | 15.5.29. Pages Router (`pages/`). No hay App Router ni directorio `src/`. |
| React | 18.3 (`react` y `react-dom`). |
| TypeScript | 5. `strict: true`, `noEmit: true`. Alias `@/*` → `./src/*` y `./*`. |
| Node de verificación | 22. CI usa Node 22. Comprobado aquí con Node v22.23.4 y npm 10.9.9. No hay `engines` ni `.nvmrc`. |
| Imagen Docker | `node:20-alpine` en `Dockerfile`. No la cambies salvo que te lo pidan. No es el camino de despliegue de Vercel Hobby. |
| ESLint | 9.39.5, dependencia transitiva de `eslint-config-next@15.5.29`. La config es `eslint.config.js` y no carga el plugin de Next. |
| World | `@worldcoin/minikit-js` ^1.11.0 y `@worldcoin/idkit` ^1.5.0. |
| Postgres | `pg` ^8.23.1. `next.config.js` lo deja en `serverExternalPackages`. `getPool()` devuelve `null` sin `DATABASE_URL`. |
| Rate limit | `@upstash/ratelimit` y `@upstash/redis`. `getRatelimit()` devuelve `null` sin URL y token. |
| Cadena | Hardhat 2 y `contracts/NexusTrustFee.sol`, solo para scripts. No entran en `next build`. |

No hay runner de tests ni archivos `*.test.*` o `*.spec.*`.

## Comandos

Comprobados el 2026-11-12, sin variables de entorno y sin secretos:

| Comando | Qué hace | Resultado |
| --- | --- | --- |
| `npm ci` | Instala desde `package-lock.json`. Es el `installCommand` de `vercel.json` y el de CI. | Exit 0. npm avisa de paquetes deprecados y de 23 avisos de `npm audit`. No ejecutes `npm audit fix` salvo que te lo pidan. |
| `npm run build` | `next build`. | Exit 0 con el entorno vacío. |
| `npm run typecheck` | `tsc --noEmit`. | Exit 0. |
| `npx eslint . --ignore-pattern .next` | Lint del código fuente con el ESLint del lockfile y `eslint.config.js`. | Exit 0, con o sin build previo. Node avisa que `eslint.config.js` es ESM y que `package.json` no tiene `"type": "module"`. No añadas ese campo para callar el aviso. |
| `npm run dev` | `next dev`. | Servidor local. No hace falta para cerrar un PR. |
| `npm start` | `next start`. | Sirve el build. |
| `npm run lint` | No existe en `package.json`. | Exit 1, `Missing script: "lint"`. |
| `npm test` | No existe en `package.json`. | Exit 1, `Missing script: "test"`. |

`next build` lanza también el lint de Next y avisa: `The Next.js plugin was not detected in your ESLint configuration`. El build termina bien. No reescribas `eslint.config.js` para quitar ese aviso salvo que te lo pidan.

`npx eslint .` sin `--ignore-pattern` sale 0 solo si no existe `.next/`. Después de `npm run build` entra en los bundles generados y falla (miles de `eqeqeq`, `no-var` y `curly` en código emitido). `.next/` está en `.gitignore`. No lo lintees ni lo "arregles".

`.github/workflows/ci.yml` ya ejecuta, en Node 22 con caché de npm: `npm ci --prefer-offline`, `npm run lint --if-present`, `npm run typecheck --if-present`, `npm test --if-present` y `npm run build` con `NEXT_PUBLIC_APP_ID=ci-check`. Como `lint` y `test` no existen, `--if-present` no comprueba nada. Un CI verde no sustituye a `npx eslint . --ignore-pattern .next` ni implica que haya tests.

Otros scripts, fuera de la verificación: `npm run migrate`, `npm run secrets`, `npm run deploy:world`, `npm run deploy:celo`, `npm run verify:celo`. No los ejecutes.

## Estructura

```
pages/                  UI y pages/api/* (handlers del Pages Router)
  _app.tsx              envuelve con MiniKitProvider
  index.tsx             UI de pago solo si getConfigStatus().configured
  status.tsx            estado de configuración
  dashboard.tsx         métricas
  privacy.tsx terms.tsx textos legales
  api/                  health, verify, initiate-payment, confirm-payment,
                        agent-run, agent-verify, metrics, missions, minipay,
                        orchestrate, dev-rewards, generate-nonce, walletconnect
components/             ConfigStatus, MiniKitProvider, WorldIDWidget
lib/                    config-status, db, ratelimit, minikit, stablecoins,
                        logger, agentkit, grok-client, exa-search, browserbase
styles/globals.css
middleware.ts           bloqueo OFAC con la cabecera x-vercel-ip-country
public/                 manifest.json y .well-known/worldcoin.json
contracts/              NexusTrustFee.sol
scripts/                migrate.js, gen-secrets.sh y deploys
hardhat.config.world.ts
vercel.json             nextjs, npm ci, npm run build, regions ["gru1"], cron diario
.env.example            placeholders vacíos
Dockerfile              imagen Node 20; no es el despliegue Hobby
```

Importa con el alias: `@/lib/...`, `@/components/...`.

## Convenciones

- Handlers de API: `export default function handler(req: NextApiRequest, res: NextApiResponse)`.
- Si el método no es POST, responde `405`. Si `!getConfigStatus().configured`, responde `503` con `notConfiguredBody()`.
- `getConfigStatus()` y `/api/health` publican nombres de variables, nunca valores.
- Las claves de servidor no llevan prefijo `NEXT_PUBLIC_`. Los ids públicos de World solo viven en el dashboard de Vercel, no en git.
- Deja `pg` en `serverExternalPackages`.
- El middleware es el de Next.js. El país llega en `x-vercel-ip-country` porque Next.js 15 quitó `req.geo`. No añadas `export const runtime = 'edge'`.
- `eslint.config.js` exige `===`, prohíbe `var`, `++` y `eval`, prefiere `const` y exige llaves. El código usa comillas simples y punto y coma.
- Textos de interfaz en español. Identificadores en inglés.
- Un PR, un tema. No mezcles dependencias, documentación y comportamiento.

## Reglas de coste y seguridad

1. Vercel Hobby, gratis. No pases el proyecto a Pro ni actives add-ons de pago. Hobby incluye una cuota; al superarla el uso se pausa, no se factura ([Vercel Hobby Plan](https://vercel.com/docs/plans/hobby)).
2. Una región. `vercel.json` fija `"regions": ["gru1"]`. No añadas otra. En Hobby las funciones corren en una sola región ([Vercel Functions Limits](https://vercel.com/docs/functions/limitations)).
3. El cron existente es `0 12 * * *` en `/api/agent-run`, una vez al día. En Hobby un cron más frecuente falla el deploy ([Usage & Pricing for Cron Jobs](https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing)). No acortes el intervalo ni añadas crons.
4. Sin servicios de pago. No añadas Stripe ni otros cobros, bases de datos de pago, observabilidad de pago, IA de pago ni SDK nuevos de terceros. Upstash, Postgres, Grok, Exa, Browserbase y Supabase ya son opcionales y siguen apagados si su variable está vacía. No los aprovisiones ni escribas claves.
5. Pagos desactivados por defecto. Con el entorno vacío, `configured` es `false`: `/` renderiza `ConfigStatus` y las APIs de verificación y pago responden 503. No hardcodees receptor, app id ni API key. No saltes `getConfigStatus()`.
6. No commitees secretos. `.gitignore` cubre `.env`, `.env.local`, `.env.production`, `*.pem`, `*.key` y `secrets.json`. `.env.example` solo tiene placeholders. No pegues tokens en docs, workflows ni issues.
7. PRs pequeños y verificados. Antes de dar por cerrado un cambio, ejecuta `npm run typecheck`, `npx eslint . --ignore-pattern .next` y `npm run build` con el entorno vacío. Si tocas dependencias, `npm ci` y commitea `package-lock.json`. No hagas force-push. No borres archivos ajenos al cambio.

## Qué no hacer

- No ejecutes `scripts/deploy-celo.sh`, `scripts/setup-and-deploy.sh`, `world-miniapp-one-shot.sh` ni `npm run deploy:*`.
- No reescribas los workflows que ya existen: `ci.yml`, `deploy.yml`, `codeql.yml`, `autofix.yml`, `god-mode-ci.yml`. `ci.yml` ya tiene `concurrency` y caché de npm. GitHub Actions puede estar bloqueado por facturación; el fichero debe seguir siendo YAML válido.
- No cambies código de la app para dejar el repositorio listo para asistentes.
- No añadas `"type": "module"` ni scripts `lint` o `test` de relleno salvo que te lo pidan.
