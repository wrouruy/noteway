import { Pool } from 'pg';

// Prevent multiple pools from being created during Next.js hot-reloads
const globalForPg = globalThis as unknown as {
  pool: Pool | undefined;
};

export const pool =
  globalForPg.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    //  ЗМІНЕНО: Для Neon найкраще передавати просто true або керувати через рядок підключення
    ssl: true, 
    max: 10, 
    idleTimeoutMillis: 30000,
    //  ЗБІЛЬШЕНО: даємо Neon 15 секунд на "холодний старт", якщо база спала
    connectionTimeoutMillis: 15000, 
  });

if (process.env.NODE_ENV !== 'production') globalForPg.pool = pool;

// Helper function for quick queries without manual client release
export const query = async (text: string, params?: any[]) => {
  const res = await pool.query(text, params);
  return res;
};
