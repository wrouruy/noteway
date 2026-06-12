import { pool, query } from "@/lib/db";
import type { PoolClient } from "pg";

export async function userBySession(client: PoolClient, sessionToken: string) {
    const session = await client.query(`
        SELECT * FROM sessions
        WHERE token = $1
        LIMIT 1`, [sessionToken]);

    const user = await client.query(`
        SELECT * FROM users
        WHERE id = $1
        LIMIT 1`, [session.rows[0].user_id]);
    
    return user.rows[0];
} 