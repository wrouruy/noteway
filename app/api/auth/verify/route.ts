'use server';
import { NextResponse, NextRequest } from "next/server";
import { cookies } from 'next/headers';
import { v7 as uuidv7, validate } from "uuid";

import { pool } from "@/lib/db";
import type { PoolClient } from 'pg';

export async function POST(req: NextRequest) {
    const cookieStore = await cookies();

    const client = await pool.connect();

    try {
        const { token } = await req.json();

        if (!validate(token))
            return NextResponse.json(
                { ok: false, message: 'invalid token' },
                { status: 400 });

        await client.query("BEGIN");

        const verifyUser = await searchUserByToken(client, token);

        if (!verifyUser){ // if token is invalid
            await client.query("ROLLBACK");
            return NextResponse.json(
                { ok: false, message: 'invalid token' },
                { status: 400 });
        }

        // creating user
        const { email } = verifyUser;

        const user = await client.query(`
            SELECT * FROM users
            WHERE email = $1`, [email]);

        let userId;

        if (user.rows.length <= 0) { // creating user 
            const username = 'user-' + uuidv7().slice(0, 8);
            userId = await createUser(client, username, email);
        } else
            userId = user.rows[0].id;
        

        // create user session
        const sessionToken = uuidv7(); // get uuid
        await createSession(client, userId, sessionToken);

        // delete verify user from prev db
        await deleteVerifyUser(client, verifyUser.id);

        await client.query("COMMIT");

        // set cookies
        cookieStore.set('session_token', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30 // 30 days
        });
        return NextResponse.json({ ok: true });
    
    } catch(err: any) {
        await client.query("ROLLBACK");
        return NextResponse.json({ ok: false, message: err.message }, { status: 500 })
    } finally {
        client.release();
    } 
}

async function searchUserByToken (client: PoolClient, token: string) {
    
    // search for record by token
    const res = await client.query(`
        SELECT * FROM verify
        WHERE token = $1 AND expires_at > NOW()`, [token]);

    return res.rows[0]
}

async function deleteVerifyUser(client: PoolClient, id: number) {
    await client.query(`DELETE FROM verify WHERE id=$1`, [id]);
}

async function createUser(client: PoolClient, username: string, email: string) {
    const res = await client.query(`
        INSERT INTO users (name, email)
        VALUES ($1, $2)
        ON CONFLICT (email)
        DO NOTHING
        RETURNING id`, [username, email]);
    
    if (res.rows.length === 0) {
        throw new Error ("user already exists");
    }

    return res.rows[0].id
}

async function createSession (client: PoolClient, userId: number, sessionToken: string) {
    await client.query(`
        INSERT INTO sessions (user_id, token)
        VALUES ($1, $2)`, [userId, sessionToken]);
}