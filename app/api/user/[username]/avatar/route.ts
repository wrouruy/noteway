import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import path from 'path';
import fs from 'fs/promises';

interface PageProps {
    params: Promise<{ username: string }>;
}

export async function GET(req: NextRequest, { params }: PageProps){
    const { username } = await params;
    const emptyAvatar = await fs.readFile( path.join(process.cwd(), 'public', 'empty-avatar.png') );

    if (!username || typeof username != 'string')
        return NextResponse.json(
            { ok: false, message: 'invalid username params' },
            { status: 400 });

    try {
        const user = await query(`
            SELECT * FROM users
            WHERE name = $1
            LIMIT 1`, [username]);

        if (user.rows.length <= 0)
            return new NextResponse(emptyAvatar, {
                headers: { 'Content-Type': 'image/png' },
            })

        const imgPath = path.join(process.cwd(), 'public', 'avatars', user.rows[0].avatar_name);
        const imgBuffer = await fs.readFile(imgPath);

        if (!imgBuffer)
            return new NextResponse(emptyAvatar, {
                headers: { 'Content-Type': 'image/png' },
            })

        return new NextResponse(imgBuffer, {
            headers: { 'Content-Type': 'image/png' },
        })
    } catch(err: any) {
        return new NextResponse(emptyAvatar, {
            headers: { 'Content-Type': 'image/png' },
        })
    }
}