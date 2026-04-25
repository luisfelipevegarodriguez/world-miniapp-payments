// Run once: node scripts/migrate.js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id          SERIAL PRIMARY KEY,
      reference   UUID        NOT NULL UNIQUE,
      status      TEXT        NOT NULL DEFAULT 'pending',
      transaction_id TEXT,
      token       TEXT,
      amount      TEXT,
      from_address TEXT,
      chain       TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log('✅ Table payments ready');
  await pool.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });
