import type { AppProps } from 'next/app';
import MiniKitProvider from '@/components/MiniKitProvider';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MiniKitProvider>
      <Component {...pageProps} />
    </MiniKitProvider>
  );
}
