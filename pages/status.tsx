import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import ConfigStatus from '@/components/ConfigStatus';
import { getConfigStatus, type PublicConfigStatus } from '@/lib/config-status';

interface Props {
  config: PublicConfigStatus;
}

export default function StatusPage({ config }: Props) {
  return (
    <>
      <Head>
        <title>Nexus Trust — Status</title>
        <meta name="description" content="Public configuration status for Nexus Trust. Variable names only." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ConfigStatus config={config} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  return { props: { config: getConfigStatus() } };
};
