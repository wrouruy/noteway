'use server';
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { v7 as uuidv7 } from "uuid";

import { pool } from "@/lib/db";
import { userBySession } from "@/lib/userBySession";

export async function POST() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken)
        return NextResponse.json({ ok: false, message: 'session token is required' }, { status: 400 });

    // db pool.connect for ROLLBACK and else
    const note = await pool.connect();

    const noteId = uuidv7();

    try {
        await note.query(`BEGIN`);

        const user = await userBySession(note, sessionToken);

        const noteRes = await note.query(`
            INSERT INTO notes (id, user_id, last_update)
            VALUES ($1, $2)
            RETURNING *`, [noteId, user?.id]);

        await note.query("COMMIT");

        return NextResponse.json({ ok: true, note: noteRes?.rows[0] });

    } catch(err: any) {
        await note.query("ROLLBACK");
        return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
    } finally {
        note.release();
    }
}
