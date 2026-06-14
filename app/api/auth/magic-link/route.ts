'use server';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { transporter } from '@/lib/mail';
import { v7 as uuidv7 } from 'uuid';

export async function POST(req: NextRequest) {
    const token: string = uuidv7();

    try {
        const { username, email } = await req.json(); // get json body arg

        // check if fields is suitable
        if (typeof username !== 'string' || !username)
            return NextResponse.json({ ok: false, message: 'invalid username' }, { status: 400 });

        if (typeof email !== 'string' || !email.includes('@'))
            return NextResponse.json({ ok: false, message: 'invalid email' }, { status: 400 });

        await query(`
            DELETE FROM verify
            WHERE email = $1
        `, [email]);
    
        // write in the db, for further checing
        await query(`
            INSERT INTO verify (username, email, token )
            VALUES ($1, $2, $3)`,
            [username, email, token]
        )

        // send email
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Verifying email',
            text: `Hello!\nPlease comfirm your email via this link:\n${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}\nIf you haven't registered, we strongly advise against clicking this link\nAll the best, bye`,
        }

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ ok: true });
    } catch(err: any) {
            await query(`
                DELETE FROM verify
                WHERE token = $1
            `, [token]);

            return NextResponse.json(
                { ok: false, message: err.message || 'Internal Server Error' }, 
                { status: 500 });
    }
}