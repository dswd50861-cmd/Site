import { env } from '../config/env';
import { Pool } from 'pg';
import { newDb } from 'pg-mem';

let pool: Pool;

if (env.databaseUrl) {
  pool = new Pool({ connectionString: env.databaseUrl });
} else {
  const db = newDb();
  // Register pg adapter for pg-mem
  const adapter = db.adapters.createPg();
  pool = new adapter.Pool();
}

export { pool };
