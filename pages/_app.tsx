import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_APP_ID;
    if (!appId) {
      console.error('NEXT_PUBLIC_APP_ID is not set');
      return;
    }
    MiniKit.install(appId);
  }, []);

  return <Component {...pageProps} />;
}
