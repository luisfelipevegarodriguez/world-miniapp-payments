/**
 * IDKit web widget — World ID verification for browser (non-World App)
 * Docs: https://docs.world.org/world-id/idkit/integrate
 * Fallback: when MiniKit.isInstalled() === false (desktop/web users)
 */
import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit';

interface Props {
  onSuccess: (result: ISuccessResult) => void;
  action?: string;
  signal?: string;
}

export default function WorldIDWidget({ onSuccess, action, signal }: Props) {
  const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID as `app_${string}`;
  const actionId = action ?? process.env.NEXT_PUBLIC_WORLD_ACTION_ID ?? 'nexus-trust-payment-2026';

  return (
    <IDKitWidget
      app_id={appId}
      action={actionId}
      signal={signal}
      verification_level={VerificationLevel.Orb}
      onSuccess={onSuccess}
    >
      {({ open }) => (
        <button
          onClick={open}
          style={{
            background: '#1a1a2e',
            color: '#fff',
            padding: '12px 28px',
            borderRadius: 12,
            border: 'none',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          🌍 Verify with World ID
        </button>
      )}
    </IDKitWidget>
  );
}
