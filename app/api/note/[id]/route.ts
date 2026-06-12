'use server';
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { userBySession } from "@/lib/userBySession";
import { pool, query } from "@/lib/db";
import { validate } from "uuid";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: PageProps) {

    const { id } = await params;

    if (!validate(id)) // check if id is uuid string
        return NextResponse.json(
            { ok: true, note: null },
            { status: 404 }
        );

    try {
        const noteRes = await query(`
            SELECT * FROM notes
            WHERE id = $1
            LIMIT 1`, [id]);
        
        if (noteRes.rows[0] <= 0)
            return NextResponse.json({ ok: true, note: null }, { status: 404 });

        return NextResponse.json({ ok: true, note: noteRes.rows[0] })
    } catch(err: any) {
        return NextResponse.json({ ok: false, message: err.message });
    }
}

export async function PUT(req: NextRequest, { params }: PageProps) {

    // get session token
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) // check if session token is exist
        return NextResponse.json({ ok: false, message: 'session token is required' });

    // parse json
    let newContent;
    try {
        const { content } = await req.json();
        newContent = content;
    } catch(err) {
        return NextResponse.json({ ok: false, message: 'invalid JSON' }, { status: 400 });
    }

    const { id } = await params;

    // checking json values
    if (!newContent) // if content are exists
        return NextResponse.json({ ok: false, message: 'content field is required' }, { status: 400 });

    if (typeof newContent !== 'string') // if correct type
        return NextResponse.json({ ok: false, message: 'content field must be string type' }, { status: 400 });

    const note = await pool.connect();

    try {
        await note.query("BEGIN");

        // get note by json id
        const noteRes = await note.query(`
            SELECT * FROM notes
            WHERE id = $1`, [id]);

        const user = await userBySession(note, sessionToken);

        if (noteRes.rows[0].user_id !== user.id) { // compare if user is owner
            await note.query("ROLLBACK");
            return NextResponse.json({ ok: false, message: 'permission denied' }, { status: 400 });
        }

        const updatedNote = await note.query(`
            UPDATE notes
            SET content = $1
            WHERE id = $2
            RETURNING *`, [newContent, id]);

        await note.query("COMMIT");

        return NextResponse.json({ ok: true, note: updatedNote.rows[0] });
    } catch(err: any) {
        await note.query("ROLLBACK;");
        return NextResponse.json({ ok: false, message: err.message });
    } finally {
        note.release();
    }
}

export async function DELETE(req: NextRequest, { params }: PageProps) {
    const cookieStore  = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const { id } = await params;

    if (!sessionToken)
        return NextResponse.json({ ok: false, message: 'session token is required' });

    if (!id)
        return NextResponse.json(
            { ok: false, message: 'id param is required' },
            { status: 400 }
        );

    const note = await pool.connect();
    try {
        await note.query(`BEGIN`);

        const user = await userBySession(note, sessionToken);
        const noteRes = await note.query(`
            SELECT * FROM notes
            WHERE id = $1`, [id]);

        if (user.id !== noteRes.rows[0].user_id) {
            await note.query(`ROLLBACK`);
            return NextResponse.json(
                { ok: false, message: 'permission denied' },
                { status: 400 }
            )
        }

        await note.query(`
            DELETE FROM notes
            WHERE id = $1`, [id]);
        
        await note.query(`COMMIT`);

        return NextResponse.json({ ok: true })
    } catch(err: any) {
        await note.query(`ROLLBACK`);
        return NextResponse.json({ ok: false, message: err.message });
    } finally {
        note.release();
    }
}