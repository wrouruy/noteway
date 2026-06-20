'use server';
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { createTransporter } from '@/lib/mail';
import { v7 as uuidv7 } from 'uuid';

const validateEmail = (email: string) => {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export async function POST(req: NextRequest) {
    const token: string = uuidv7();
    const client = await pool.connect();

    try {
        const { email } = await req.json(); // get json body arg

        if (typeof email !== 'string' || !validateEmail(email))
            return NextResponse.json({ ok: false, message: 'invalid email' }, { status: 400 });

        await client.query(`BEGIN`);

        // check if email is busy
        const busy = await client.query(`
            SELECT * FROM users
            WHERE email = $1`, [email]);
        
        if (busy.rows.length > 0)
            return NextResponse.json(
                { ok: false, message: 'email is busy' },
                { status: 400 });

        await client.query(`
            DELETE FROM verify
            WHERE email = $1
        `, [email]);
    
        // write in the db, for further checking
        await client.query(`
            INSERT INTO verify ( email, token )
            VALUES ($1, $2)`,
            [email, token]
        );

        // send email
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Verifying email',
            text: `Hello!\nPlease comfirm your email via this link:\n${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}\nIf you haven't registered, we strongly advise against clicking this link\nAll the best, bye`,
        }

        const transporter = await createTransporter();
        await transporter.sendMail(mailOptions);

        await client.query(`COMMIT`);

        return NextResponse.json({ ok: true });
    } catch(err: any) {
            await client.query(`ROLLBACK`);
            return NextResponse.json(
                { ok: false, message: err.message || 'Internal Server Error' }, 
                { status: 500 });
    } finally {
        client.release()
    }
}