import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { pool } from "@/lib/db";
import { userBySession } from "@/lib/userBySession";
import { validate } from "uuid";

export async function GET() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken || !validate(sessionToken))
        return NextResponse.json(
            { ok: true, user: null, message: 'session token is invalid' },
            { status: 400 }
        );
    
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