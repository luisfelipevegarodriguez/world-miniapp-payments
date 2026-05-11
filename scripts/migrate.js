// Run once: node scripts/migrate.js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  // Payments
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id            SERIAL PRIMARY KEY,
      reference     UUID        NOT NULL UNIQUE,
      status        TEXT        NOT NULL DEFAULT 'pending',
      transaction_id TEXT,
      token         TEXT,
      amount        TEXT,
      from_address  TEXT,
      chain         TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log('✅ Table payments ready');

  // Anti-sybil nullifiers (TTL index: auto-purge after 365 days via pg_cron or manual job)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS used_nullifiers (
      nullifier_hash TEXT PRIMARY KEY,
      created_at     TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_nullifiers_created
      ON used_nullifiers (created_at);
  `);
  console.log('✅ Table used_nullifiers ready');

  // Consent audit log (GDPR Art.7 / CCPA)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS consent_log (
      nullifier_hash  TEXT NOT NULL,
      consent_version TEXT NOT NULL,
      granted_at      TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (nullifier_hash, consent_version)
    );
  `);
  console.log('✅ Table consent_log ready');

  await pool.end();
  console.log('✅ Migration complete');
}

migrate().catch(err => { console.error(err); process.exit(1); });
