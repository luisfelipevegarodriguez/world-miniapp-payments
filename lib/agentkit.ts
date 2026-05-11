/**
 * AgentKit World ID — 3 capacidades
 * 1. Delegación: agente acredita que actúa en nombre de humano real
 * 2. Supervisión humana: ZKP on-demand para acciones sensibles
 * 3. Comercio agéntico: 1 humano → 1 agente → 1 asignación
 * Docs: https://docs.world.org/agents/agent-kit/integrate
 */
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';

export type AgentAction =
  | 'payment'       // pago > umbral
  | 'contract'      // firma contrato
  | 'deploy'        // cambio producción
  | 'data-access'   // acceso info sensible
  | 'purchase';     // compra e-commerce

const ACTION_THRESHOLDS: Record<AgentAction, number> = {
  payment: 50,       // USDC — requiere aprobación humana si > $50
  contract: 0,       // siempre requiere aprobación
  deploy: 0,
  'data-access': 0,
  purchase: 100,     // USDC
};

/**
 * DELEGACIÓN: inyectar nullifier_hash del humano en cabecera del agente
 * Llamar desde el agente antes de cada request a servicios externos
 */
export function buildAgentHeaders(nullifierHash: string): Record<string, string> {
  return {
    'X-World-Human-Principal': nullifierHash,
    'X-World-Agent-Version': '2.0',
    'X-World-App-ID': process.env.NEXT_PUBLIC_WORLD_APP_ID ?? '',
  };
}

/**
 * SUPERVISIÓN HUMANA: solicitar ZKP antes de ejecutar acción sensible
 * Retorna true si el humano aprobó, false si rechazó o timeout
 */
export async function requestHumanApproval(
  action: AgentAction,
  amount?: number
): Promise<{ approved: boolean; proof?: string; nullifier?: string }> {
  // Si la cantidad está bajo el umbral, auto-aprobar
  const threshold = ACTION_THRESHOLDS[action];
  if (amount !== undefined && threshold > 0 && amount <= threshold) {
    return { approved: true };
  }

  if (typeof window === 'undefined') {
    // Server-side: consultar endpoint de aprobación pendiente
    throw new Error('Human approval must be requested client-side via MiniKit');
  }

  const result = await MiniKit.commandsAsync.verify({
    action: `agent-oversight-${action}`,
    verification_level: VerificationLevel.Orb,
    signal: JSON.stringify({ action, amount, ts: Date.now() }),
  });

  if (result.finalPayload.status === 'success') {
    return {
      approved: true,
      proof: result.finalPayload.proof,
      nullifier: result.finalPayload.nullifier_hash,
    };
  }
  return { approved: false };
}

/**
 * COMERCIO AGÉNTICO: validar “1 humano = 1 asignación”
 * Previene que un humano use múltiples agentes para compras duplicadas
 */
export async function validateAgenticPurchase(
  nullifierHash: string,
  productId: string,
  db: { query: (sql: string, params: unknown[]) => Promise<{ rows: unknown[] }> }
): Promise<{ allowed: boolean; reason?: string }> {
  const existing = await db.query(
    'SELECT id FROM agentic_purchases WHERE nullifier_hash = $1 AND product_id = $2',
    [nullifierHash, productId]
  );
  if (existing.rows.length > 0) {
    return { allowed: false, reason: 'one_human_one_purchase' };
  }
  return { allowed: true };
}
