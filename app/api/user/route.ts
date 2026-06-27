import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { pool } from "@/lib/db";
import { userBySession } from "@/lib/userBySession";
import { validate } from "uuid";

export async function GET() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken || !validate(sessionToken))
        return NextResponse.json(
            { ok: true, user: null, message: 'invalid session token' },
            { status: 400 });
    
    const client = await pool.connect();
    try {
        await client.query(`BEGIN`);

        const user = await userBySession(client, sessionToken);

        if(!user)
            return NextResponse.json(
                { ok: true, user: null },
                { status: 400 }
            );

        await client.query(`COMMIT`);

        return NextResponse.json({ ok: true, user: user });
    } catch(err: any) {
        await client.query(`ROLLBACK`);
        return NextResponse.json({ ok: false, message: err.message });
    } finally {
        client.release();
    }
}

export async function PUT (req: NextRequest) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken || !validate(sessionToken))
        return NextResponse.json(
            { ok: false, user: null, message: 'session token is invalid' },
            { status: 400 });
    
    const client = await pool.connect();
    try {
        const { username } = await req.json();

        await client.query(`BEGIN`);

        const busy = await client.query(`
            SELECT * FROM users
            WHERE name = $1`, [username]);

        if (busy.rows.length > 0) {
            await client.query(`ROLLBACK`);
            return NextResponse.json(
                { ok: false, user: null, message: 'username is busy' },
                { status: 400 });
        }

        const user = await userBySession(client, sessionToken);

        const res = await client.query(`
            UPDATE users
            SET name = $1
            WHERE id = $2
            RETURNING *`, [username, user.id]);
        
        await client.query(`COMMIT`);

        return NextResponse.json(
            { ok: true, user: res.rows[0] });

    } catch(err: any) {
        await client.query(`ROLLBACK`);
        return NextResponse.json(
            { ok: false, message: err.message || 'Iternal server error' },
            { status: 500 });
    } finally {
        client.release();
    }
}

export async function DELETE () {
    const cookiesStore = await cookies();
    const sessionToken = cookiesStore.get('session_token')?.value;

    if (!sessionToken || !validate(sessionToken))
        return NextResponse.json(
            { ok: false, message: 'invalid session token' },
            { status: 400 });

    const client = await pool.connect();
    try {
        await client.query(`BEGIN`);

        const userID = await client.query(`
            SELECT user_id FROM sessions
            WHERE token = $1
            LIMIT 1`, [sessionToken]);
        
        if (userID.rows.length <= 0)
            return NextResponse.json(
                { ok: false, message: 'session is not found' },
                { status: 400 });

        await client.query(`DELETE FROM sessions WHERE user_id = $1`, [userID.rows[0].user_id]);
        await client.query(`DELETE FROM notes WHERE user_id = $1`, [userID.rows[0].user_id]);

        const delUser = await client.query(`
            DELETE FROM users
            WHERE id = $1
            RETURNING *`, [userID.rows[0].user_id]);
        
        if (delUser.rows.length <= 0) {
            await client.query(`ROLLBACK`);
            return NextResponse.json(
                { ok: false, message: 'user is not found' },
                { status: 400 });
        }

        cookiesStore.delete('session_token');

        await client.query(`COMMIT`);

        return NextResponse.json({ ok: true });

    } catch(err: any) {
        await client.query(`ROLLBACK`);
        return NextResponse.json(
            { ok: false, message: err.message || 'Iternal server error' },
            { status: 500 });
    
    } finally {
        client.release();
    }
}