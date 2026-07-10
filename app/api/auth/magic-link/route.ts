'use server';
import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { createTransporter } from '@/lib/mail';
import { v7 as uuidv7 } from 'uuid';

const validateEmail = (email: string) => {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export async function POST(req: NextRequest) {
    const token: string = uuidv7();
    const redis = await getRedisClient();

    try {
        const { email } = await req.json(); // get json body arg

        if (typeof email !== 'string' || !validateEmail(email))
            return NextResponse.json({ ok: false, message: 'invalid email' }, { status: 400 });

        await redis.set(`verify:${token}`, email, { EX: 1800 });

        // send email
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Verifying email',
            text: `Hello!\nPlease confirm your email via this link:\n${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}\nIf you haven't registered, we strongly advise against clicking this link\nAll the best, bye`,
        }

        const transporter = await createTransporter();
        await transporter.sendMail(mailOptions);


        return NextResponse.json({ ok: true });
    } catch(err: any) {
            return NextResponse.json(
                { ok: false, message: err.message || 'Internal Server Error' }, 
                { status: 500 });
    }
}