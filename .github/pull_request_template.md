## Qué cambia

<!-- Una frase. Un PR, un tema. -->

## Cómo se verificó

- [ ] `npm ci` si cambió `package.json` o `package-lock.json`
- [ ] `npm run typecheck` (`tsc --noEmit`)
- [ ] `npx eslint . --ignore-pattern .next` (no existe `npm run lint`; `npm test` tampoco existe; no lintees `.next/`)
- [ ] `npm run build` con el entorno vacío, sin secretos
- [ ] No pegué tokens, claves ni `.env` en el diff, en la descripción ni en capturas

## Coste y pagos

- [ ] Sigue en Vercel Hobby: una sola región (`gru1`) y el cron no corre más de una vez al día
- [ ] No añadí servicios de pago ni SDK nuevos de terceros
- [ ] Los pagos siguen desactivados por defecto: sin receptor, app id ni API key hardcodeados, y sin saltar `getConfigStatus()`

## Alcance

- [ ] El diff es pequeño y solo toca este tema
- [ ] No hay force-push ni borrados ajenos al cambio
