// Run once: node scripts/migrate.js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS used_nullifiers (
      nullifier_hash TEXT PRIMARY KEY,
      created_at     TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_nullifiers_created ON used_nullifiers (created_at);
  `);
  console.log('✅ Table used_nullifiers ready');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS consent_log (
      nullifier_hash  TEXT NOT NULL,
      consent_version TEXT NOT NULL,
      granted_at      TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (nullifier_hash, consent_version)
    );
  `);
  console.log('✅ Table consent_log ready');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS agent_logs (
      id          SERIAL PRIMARY KEY,
      action_type TEXT NOT NULL,
      payload     JSONB,
      duration_ms INTEGER,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_agent_logs_type ON agent_logs (action_type);
    CREATE INDEX IF NOT EXISTS idx_agent_logs_created ON agent_logs (created_at DESC);
  `);
  console.log('✅ Table agent_logs ready');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_missions (
      nullifier_hash TEXT NOT NULL,
      mission_id     TEXT NOT NULL,
      progress       INTEGER DEFAULT 0,
      completed_at   TIMESTAMPTZ,
      updated_at     TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (nullifier_hash, mission_id)
    );
  `);
  console.log('✅ Table user_missions ready');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS metrics (
      key        TEXT PRIMARY KEY,
      value      BIGINT DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    INSERT INTO metrics (key, value) VALUES
      ('verified_users', 0),
      ('transactions_7d', 0),
      ('tvl_usd_cents', 0)
    ON CONFLICT (key) DO NOTHING;
  `);
  console.log('✅ Table metrics ready');

  await pool.end();
  console.log('✅ Migration complete — Nexus Trust DB schema v2');
}

migrate().catch(err => { console.error(err); process.exit(1); });
