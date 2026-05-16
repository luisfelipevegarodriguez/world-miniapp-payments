#!/bin/bash
# Abre los 2 grants directamente en el browser
echo "🏆 Abriendo portales de grants..."

# Verifica que la app está viva primero
HEALTH=$(curl -sf https://nexus-trust.vercel.app/api/health | jq -r '.status' 2>/dev/null || echo "FAIL")
if [ "$HEALTH" != "ok" ]; then
  echo "❌ App no está en producción. Ejecuta primero: ./scripts/setup-and-deploy.sh"
  exit 1
fi

METRICS_URL="https://nexus-trust.vercel.app/api/metrics"
echo "📊 Métricas actuales:"
curl -sf $METRICS_URL | jq '{verified_users,total_transactions,total_volume_usd,grants}'

echo ""
echo "Copia estas URLs en tu aplicación de grants:"
echo "  Metrics públicas: $METRICS_URL"
echo "  GitHub: https://github.com/luisfelipevegarodriguez/world-miniapp-payments"
echo "  App: https://nexus-trust.vercel.app"
echo ""
echo "→ World Retroactive Grant: https://world.org/retro"
echo "→ Celo Prezenti:           https://prezenti.xyz"

# Abre en browser si hay GUI
if command -v open &>/dev/null; then
  open https://world.org/retro
  sleep 2
  open https://prezenti.xyz
elif command -v xdg-open &>/dev/null; then
  xdg-open https://world.org/retro
  sleep 2
  xdg-open https://prezenti.xyz
fi
