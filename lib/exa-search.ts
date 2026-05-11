/**
 * Exa Search — integrado con World ID AgentKit
 * - 100 requests/mes gratis para agentes verificados
 * - Auto-fallback a x402 payment tras agotar cuota
 * - Docs: https://exa.ai
 */

const EXA_BASE = 'https://api.exa.ai';

export interface ExaSearchResult {
  id: string;
  url: string;
  title: string;
  score: number;
  publishedDate?: string;
  text?: string;
}

export async function exaSearch(
  query: string,
  nullifierHash: string,
  options?: { numResults?: number; useAutoprompt?: boolean; type?: 'neural' | 'keyword' }
): Promise<ExaSearchResult[]> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) throw new Error('EXA_API_KEY not configured');

  const res = await fetch(`${EXA_BASE}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      // Identificar agente como verificado por World ID
      'X-World-Human-Principal': nullifierHash,
      'X-World-App-ID': process.env.NEXT_PUBLIC_WORLD_APP_ID ?? '',
    },
    body: JSON.stringify({
      query,
      numResults: options?.numResults ?? 10,
      useAutoprompt: options?.useAutoprompt ?? true,
      type: options?.type ?? 'neural',
      contents: { text: { maxCharacters: 1000 } },
    }),
  });

  if (res.status === 402) {
    // Cuota de 100 reqs agotada — activar x402 payment
    throw new Error('EXA_QUOTA_EXCEEDED: upgrade to paid plan via x402');
  }

  if (!res.ok) throw new Error(`Exa API error: ${res.status}`);

  const data = await res.json();
  return data.results ?? [];
}

/**
 * Obtener contenido completo de una URL (para agentes DeFi, scraping de datos)
 */
export async function exaGetContents(
  urls: string[],
  nullifierHash: string
): Promise<ExaSearchResult[]> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) throw new Error('EXA_API_KEY not configured');

  const res = await fetch(`${EXA_BASE}/contents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'X-World-Human-Principal': nullifierHash,
    },
    body: JSON.stringify({ ids: urls, text: true }),
  });

  if (!res.ok) throw new Error(`Exa contents error: ${res.status}`);
  const data = await res.json();
  return data.results ?? [];
}
