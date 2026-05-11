import Head from 'next/head';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — Nexus Trust</title>
      </Head>
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif', lineHeight: 1.7 }}>
        <h1>Privacy Policy</h1>
        <p><strong>Effective date:</strong> May 12, 2026 &nbsp;·&nbsp; <strong>Version:</strong> 1.0</p>
        <p>Nexus Trust (“we”) operates under GDPR (EU) and CCPA (California) requirements.
        This policy explains exactly what data we collect and why.</p>

        <h2>1. Data we collect</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4f4f4' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Data</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Purpose</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Retention</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Legal basis</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['nullifier_hash (anonymous)', 'Anti-sybil / identity dedup', '365 days', 'Legitimate interest (fraud prevention)'],
              ['consent_version + timestamp', 'GDPR audit trail', 'Duration of service', 'Legal obligation'],
              ['Payment reference + status', 'Transaction processing', '5 years (tax)', 'Contract performance'],
              ['IP address (hashed)', 'Rate limiting, geo-block', '30 days', 'Legitimate interest (security)'],
              ['Agent log metadata', 'System observability', '90 days', 'Legitimate interest (operations)'],
            ].map(([data, purpose, retention, basis]) => (
              <tr key={data}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{data}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{purpose}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{retention}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{basis}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>2. What we do NOT collect</h2>
        <ul>
          <li>Biometric data (iris scans stay in World App — we only receive the ZKP nullifier)</li>
          <li>Real names, email addresses, or government IDs</li>
          <li>Precise geolocation</li>
          <li>Browsing history or cross-app tracking</li>
        </ul>

        <h2>3. Third parties</h2>
        <ul>
          <li><strong>Vercel</strong> — hosting and edge compute (DPA: <a href="https://vercel.com/legal/dpa" target="_blank">vercel.com/legal/dpa</a>)</li>
          <li><strong>Upstash</strong> — Redis rate limiting (DPA: <a href="https://upstash.com/trust/dpa.pdf" target="_blank">upstash.com/trust/dpa.pdf</a>)</li>
          <li><strong>DeFiLlama</strong> — public yield data API (no personal data shared)</li>
          <li><strong>xAI Grok</strong> — market analysis (no personal data shared, prompt-only)</li>
          <li><strong>World Foundation</strong> — ZKP verification infrastructure</li>
        </ul>
        <p>We do not sell personal data. We do not share data with advertisers.</p>

        <h2>4. Your rights (GDPR / CCPA)</h2>
        <ul>
          <li><strong>Access:</strong> request a copy of data tied to your nullifier_hash</li>
          <li><strong>Deletion:</strong> request erasure — we delete within 30 days (except legally required retention)</li>
          <li><strong>Correction:</strong> request correction of inaccurate records</li>
          <li><strong>Portability:</strong> export your transaction history as JSON/CSV</li>
          <li><strong>Withdraw consent:</strong> use the “Delete my data” button in app settings</li>
        </ul>
        <p>To exercise rights: <a href="mailto:privacy@nexus-trust.app">privacy@nexus-trust.app</a> — response within 30 days.</p>

        <h2>5. Security</h2>
        <p>All data is encrypted in transit (TLS 1.3) and at rest (AES-256 via Vercel/Postgres).
        Access is restricted to production systems. No tokens or credentials are stored in code.</p>

        <h2>6. Contact</h2>
        <p>Data Controller: Nexus Trust &nbsp;·&nbsp; Madrid, Spain<br/>
        DPO contact: <a href="mailto:privacy@nexus-trust.app">privacy@nexus-trust.app</a></p>
      </main>
    </>
  );
}
