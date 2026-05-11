import Head from 'next/head';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service — Nexus Trust</title>
      </Head>
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif', lineHeight: 1.7 }}>
        <h1>Terms of Service</h1>
        <p><strong>Effective date:</strong> May 12, 2026 &nbsp;·&nbsp; <strong>Version:</strong> 1.0</p>

        <h2>1. Service description</h2>
        <p>Nexus Trust is a non-custodial payment and yield-discovery mini app operating on World Chain.
        We facilitate peer-to-peer USDC/WLD transfers and surface DeFi yield opportunities.
        <strong>We do not hold, custody, or control user funds at any point.</strong>
        All transactions are signed directly by the user’s World App wallet.</p>

        <h2>2. Eligibility</h2>
        <p>You must be a verified human (World ID — Orb level) aged 18 or older.
        The service is available in the following jurisdictions only: ES, MX, CO, AR, PE, CL, EC, GT, HN, BO, PY, UY, BR, PT.
        Access from sanctioned countries (OFAC list: CU, IR, KP, RU, SY) is blocked automatically.</p>

        <h2>3. Non-custodial model</h2>
        <p>Nexus Trust never takes possession of your assets.
        Yield rates shown are informational, sourced from DeFi protocols via DeFiLlama.
        <strong>We make no guarantees of returns.</strong> Past yields are not indicative of future performance.
        This service does not constitute investment advice or a regulated financial product.</p>

        <h2>4. Prohibited uses</h2>
        <ul>
          <li>Money laundering, terrorist financing, or sanctions evasion</li>
          <li>Creating multiple World ID-verified accounts (anti-sybil enforced on-chain)</li>
          <li>Automated bot activity or API abuse</li>
          <li>Any use violating applicable laws in your jurisdiction</li>
        </ul>

        <h2>5. Fees</h2>
        <p>Nexus Trust charges 0% protocol fee at launch. Gas fees on World Chain are sponsored via Flashblocks where applicable.
        Third-party DeFi protocols may charge their own fees, which are disclosed at point of interaction.</p>

        <h2>6. Refunds and disputes</h2>
        <p>Blockchain transactions are irreversible by design.
        In cases of technical errors on our side resulting in failed transactions, we will investigate and resolve within 5 business days.
        Contact: <a href="mailto:legal@nexus-trust.app">legal@nexus-trust.app</a></p>

        <h2>7. Limitation of liability</h2>
        <p>To the maximum extent permitted by law, Nexus Trust’s liability is limited to €100.
        We are not liable for losses from DeFi protocol failures, smart contract bugs, or market volatility.</p>

        <h2>8. Governing law</h2>
        <p>These terms are governed by the laws of Spain (EU). Disputes shall be resolved by the courts of Madrid.</p>

        <h2>9. Changes</h2>
        <p>We will notify users in-app before making material changes.
        Continued use after the effective date of updated terms constitutes acceptance.
        Your consent version is versioned (“v1”, “v2”, etc.) and stored pseudonymously.</p>

        <p style={{ marginTop: '2rem', color: '#666', fontSize: '0.9rem' }}>
          Questions: <a href="mailto:legal@nexus-trust.app">legal@nexus-trust.app</a>
        </p>
      </main>
    </>
  );
}
