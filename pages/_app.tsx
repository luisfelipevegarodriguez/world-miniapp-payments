import type { AppProps } from 'next/app';
import { MiniKit } from '@worldcoin/minikit-js';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    MiniKit.install(process.env.NEXT_PUBLIC_APP_ID!);
  }, []);

  return <Component {...pageProps} />;
}
