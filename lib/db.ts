import { Pool, PoolClient } from 'pg';

// Prevent multiple pools from being created during Next.js hot-reloads
const globalForPg = globalThis as unknown as {
  pool: Pool | undefined;
};

export const pool =
  globalForPg.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URI,
    ssl: {
      rejectUnauthorized: true, // Neon requires SSL
    },
    max: 10, // Adjust based on your Neon plan limits
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

if (process.env.NODE_ENV !== 'production') globalForPg.pool = pool;

// Helper function for quick queries without manual client release
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  // Optional: Log queries in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('executed query', { text, duration, rows: res.rowCount });
  }
  
  return res;
};