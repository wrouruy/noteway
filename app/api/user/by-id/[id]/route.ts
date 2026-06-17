import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: PageProps) {
    const { id } = await params;

    try {
        const user = await query(`
            SELECT * FROM users
            WHERE id = $1
            LIMIT 1`, [id]);

        if (!user)
            return NextResponse.json(
                { ok: false, message: 'invalid id params' },
                { status: 400 });
        
        return NextResponse.json(
            { ok: true, user: user.rows[0] });
    } catch (err: any) {
        return NextResponse.json(
            { ok: false, message: err.message || 'Iternal server error' },
            { status: 500 });
    }
}