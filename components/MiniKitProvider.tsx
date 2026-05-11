/**
 * MiniKit 2.0 Provider — build once, deploy web + World App
 * https://world.org/blog/announcements/build-once-deploy-anywhere-minikit-2.0-is-live-for-world-developers
 */
'use client';
import { MiniKit } from '@worldcoin/minikit-js';
import { useEffect, ReactNode } from 'react';

interface Props { children: ReactNode; }

export default function MiniKitProvider({ children }: Props) {
  useEffect(() => {
    MiniKit.install(process.env.NEXT_PUBLIC_WORLD_APP_ID);
  }, []);
  return <>{children}</>;
}
