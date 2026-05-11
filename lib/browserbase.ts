/**
 * Browserbase — navegación web para agentes con World ID
 * Agentes con nullifier_hash verificado = tráfico humano legítimo
 * Sin verificación = bloqueado por antibot
 * Docs: https://browserbase.com
 */

const BB_BASE = 'https://api.browserbase.com/v1';

export async function createBrowserSession(
  nullifierHash: string
): Promise<{ sessionId: string; connectUrl: string }> {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  if (!apiKey) throw new Error('BROWSERBASE_API_KEY not configured');

  const res = await fetch(`${BB_BASE}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-BB-API-Key': apiKey,
      // Delegar identidad humana al agente
      'X-World-Human-Principal': nullifierHash,
      'X-World-Verified': 'orb',
    },
    body: JSON.stringify({
      projectId: process.env.BROWSERBASE_PROJECT_ID,
      // El navegador se identificará como tráfico humano verificado
      humanVerified: true,
    }),
  });

  if (!res.ok) throw new Error(`Browserbase session error: ${res.status}`);
  return res.json();
}
