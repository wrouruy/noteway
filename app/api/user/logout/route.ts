'use server';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from '@/lib/db';
import { validate } from "uuid";

export async function GET () {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken || !validate(sessionToken))
        return NextResponse.json(
            { ok: false, message: 'session token is invalid' },
            { status: 400 });
    
    const client = await pool.connect();

    try {
        await client.query(`BEGIN`);

        await client.query(`
            DELETE FROM sessions
            WHERE token = $1`, [sessionToken]);

        cookieStore.delete('session_token');

        await client.query(`COMMIT`);

        return NextResponse.json(
            { ok: true });

    } catch(err: any) {
        await client.query(`ROLLBACK`);
        return NextResponse.json(
            { ok: false, message: err.message || 'Iternal server error' },
            { status: 500 });

    } finally {
        client.release();
    }
}