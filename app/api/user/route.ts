'use server';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

export async function POST() {
    const cookieStore = await cookies();
    const session_token = cookieStore.get('session_token');

    if(!session_token?.value)
        return NextResponse.json({ ok: false, message: 'please registry' });

    let userId;
    try {
        userId = await query(`
            SELECT * FROM sessions 
            WHERE token = $1
            LIMIT 1`, [session_token.value]);
    } catch(err: any) {
        return NextResponse.json({ ok: false, message: err.message }, { status: 400 });
    }

    try {
        const user = await query(`
                SELECT * FROM users
                WHERE id = $1
                LIMIT 1
            `, [ userId.rows[0].user_id ]);

        return NextResponse.json({ ok: true, user: user.rows[0] });
    } catch(err: any) {
        return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
    }
}