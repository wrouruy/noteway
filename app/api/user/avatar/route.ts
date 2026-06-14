import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { pool } from "@/lib/db";
import { userBySession } from "@/lib/userBySession";
import { validate } from "uuid";

import fs from 'fs/promises';
import path from 'path';

export async function PUT(req: NextRequest) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken || !validate(sessionToken))
        return NextResponse.json(
            { ok: false, message: 'invalid session token' },
            { status: 400 });
    
    const client = await pool.connect();

    try {
        await client.query(`BEGIN`);
        const user = await userBySession(client, sessionToken);

        if (!user) {
            await client.query(`ROLLBACK`);
            return NextResponse.json(
                { ok: false, message: 'invalid session token' },
                { status: 400 });
        }

        const formData = await req.formData();
        const file = formData.get('avatar') as File | null;

        if (!file || !(file instanceof File)) {
            await client.query(`ROLLBACK`);
            return NextResponse.json(
                { ok: false, message: 'avatar file is not found' },
                { status: 400 });
        }

        if (file.type != 'image/png') {
            await client.query(`ROLLBACK`);
            return NextResponse.json(
                { ok: false, message: '.png image format require' },
                { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // create dir if its not exist
        await fs.mkdir(path.join(process.cwd(), 'public', 'avatars'), { recursive: true });

        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `avatar-${uniqueSuffix}.png`;

        const oldAvatar = `${process.cwd()}/public/avatars/${user.avatar_name}`;
        const newAvatar = path.join(process.cwd(), 'public', 'avatars', filename);

        await fs.rm(oldAvatar, { force: true });

        await client.query(`
            UPDATE users
            SET avatar_name = $1
            WHERE id = $2`, [filename, user.id]);

        await fs.writeFile(newAvatar, buffer, 'utf-8');

        await client.query(`COMMIT`);
        return NextResponse.json({ ok: true });
    } catch(err: any) {
        await client.query(`ROLLBACK`);
        return NextResponse.json(
            { ok: false, message: err.message },
            { status: 500 });
    } finally {
        client.release();
    }
}