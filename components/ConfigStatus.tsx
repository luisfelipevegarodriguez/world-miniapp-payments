import type { PublicConfigStatus } from '@/lib/config-status';

interface Props {
  config: PublicConfigStatus;
}

function formatRequirement(keys: string[]): string {
  if (keys.length === 1) {
    return keys[0];
  }
  return keys.join(' or ');
}

export default function ConfigStatus({ config }: Props) {
  const ready = config.configured;

  return (
    <main style={{
      minHeight: '100dvh',
      background: '#0a0a0f',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      padding: '28px 16px 40px',
      maxWidth: 560,
      margin: '0 auto',
    }}>
      <p style={{ fontSize: 12, letterSpacing: '0.08em', color: '#888', margin: '0 0 8px' }}>
        NEXUS TRUST
      </p>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px' }}>Status</h1>
      <p style={{
        display: 'inline-block',
        margin: '0 0 16px',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: ready ? '#0a2d1a' : '#2a2108',
        color: ready ? '#10b981' : '#fbbf24',
        border: `1px solid ${ready ? '#14532d' : '#78350f'}`,
      }}>
        {ready ? 'Configured' : 'Setup required'}
      </p>
      <p style={{ color: '#c4c4d0', fontSize: 15, lineHeight: 1.55, margin: '0 0 20px' }}>
        {ready
          ? 'Required environment variables are set. Payments and verification can run.'
          : 'This deployment is up. Required environment variables are missing, so payments stay offline until they are set in the host.'}
      </p>
      <p style={{ color: '#888', fontSize: 13, lineHeight: 1.5, margin: '0 0 20px' }}>
        Variable names only. Values are never read into this page.
      </p>

      <h2 style={{ fontSize: 14, margin: '0 0 8px' }}>Required</h2>
      {config.missingRequired.length === 0 ? (
        <p style={{ color: '#10b981', fontSize: 14, margin: '0 0 20px' }}>All required variables are set.</p>
      ) : (
        <ul style={{ margin: '0 0 20px', paddingLeft: 18, color: '#fbbf24', fontSize: 14, lineHeight: 1.6 }}>
          {config.missingRequired.map((requirement) => (
            <li key={requirement.anyOf.join('|')}>
              <code>{formatRequirement(requirement.anyOf)}</code>
            </li>
          ))}
        </ul>
      )}

      <details style={{ marginBottom: 24 }}>
        <summary style={{ cursor: 'pointer', color: '#aaa', fontSize: 14 }}>
          Optional variables not set ({config.missingOptional.length})
        </summary>
        {config.missingOptional.length === 0 ? (
          <p style={{ color: '#888', fontSize: 13 }}>None.</p>
        ) : (
          <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: '#aaa', fontSize: 13, lineHeight: 1.6 }}>
            {config.missingOptional.map((name) => (
              <li key={name}><code>{name}</code></li>
            ))}
          </ul>
        )}
      </details>

      <nav style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
        <a href="/" style={{ color: '#a5b4fc' }}>Home</a>
        <a href="/api/health" style={{ color: '#a5b4fc' }}>Health JSON</a>
        <a href="/api/metrics" style={{ color: '#a5b4fc' }}>Metrics</a>
        <a href="/terms" style={{ color: '#a5b4fc' }}>Terms</a>
        <a href="/privacy" style={{ color: '#a5b4fc' }}>Privacy</a>
      </nav>
    </main>
  );
}
