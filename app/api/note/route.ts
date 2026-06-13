'use server';
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { v7 as uuidv7, validate } from "uuid";

import { pool } from "@/lib/db";
import { userBySession } from "@/lib/userBySession";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function POST() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken)
        return NextResponse.json({ ok: false, message: 'session token is required' }, { status: 400 });

    // db pool.connect for ROLLBACK and else
    const client = await pool.connect();

    const uuid = uuidv7();

    try {
        await client.query(`BEGIN`);

        const user = await userBySession(client, sessionToken);

        if (!user){
            await client.query(`ROLLBACK`);
            return NextResponse.json(
                { ok: false, message: 'user account is not found' },
                { status: 400 }
            );
        }

        const note = await client.query(`
            INSERT INTO notes (id, user_id)
            VALUES ($1, $2)
            RETURNING *`, [uuid, user?.id]);

        await client.query("COMMIT");

        return NextResponse.json({ ok: true, note: note?.rows[0] });

    } catch(err: any) {
        await client.query("ROLLBACK");
        return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function GET () {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken || !validate(sessionToken))
        return NextResponse.json(
            { ok: false, note: null, message: 'session token is invalid' },
            { status: 400 }
        );

    const client = await pool.connect();
    try {
        const user = await userBySession(client, sessionToken);
        if (!user)
            return NextResponse.json(
                { ok: false, note: null, message: 'session token is invalid' },
                { status: 400 }
            );
        
        const allnote = await client.query(`
            SELECT * FROM notes
            WHERE user_id = $1`, [user.id]);

        return NextResponse.json({ ok: true, note: allnote.rows });
    } catch(err: any) {
        await pool.query(`ROLLBACK`);
    } finally {
        client.release();
    }
}