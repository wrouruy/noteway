'use server';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { transporter } from '@/lib/mail';
import { v7 as uuidv7 } from 'uuid';

export async function POST(req: NextRequest) {
    const { username, email } = await req.json(); // get json body arg

    // check if fields is suitable
    if (typeof username !== 'string' || !username)
        return NextResponse.json({ ok: false, message: 'invalid username' }, { status: 400 });

    if (typeof email !== 'string' || !email.includes('@'))
        return NextResponse.json({ ok: false, message: 'email is not support' }, { status: 400 });

    const token: string = uuidv7(); // get uuid

    await query(`
        DELETE FROM verify
        WHERE email = $1
    `, [email]);
    
    try {
        // write in the db, for further checing
        await query(`
            INSERT INTO verify (username, email, token )
            VALUES ($1, $2, $3)`,
            [username, email, token]
        )
    } catch(err: any) {
        return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
    }

    try {
        // send email
        const mailOptions = {
            from: 'wrxxv200@gmail.com',
            to: email,
            subject: 'Verifying email',
            text: `Hello!\nPlease comfirm your email via this link:\n${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}\nIf you haven't registered, we strongly advise against clicking this link\nAll the best, bye`,
        }

        await transporter.sendMail(mailOptions);

    } catch(err: any) {
            await query(`
                DELETE FROM verify
                WHERE token = $1
            `, [token]);

            return NextResponse.json(
            { ok: false, message: err.message || 'Internal Server Error' }, 
            { status: 500 }
        );
    }
    return NextResponse.json({ ok: true });

}