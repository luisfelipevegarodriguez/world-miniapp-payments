import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    MiniKit.install();
  }, []);

  return <Component {...pageProps} />;
}
