'use client';
import { useState } from 'react';
import style from './signup.module.scss'
import ErrorPopup from '@/component/ErrorPopup/ErrorPopup';
import Cmatrix from '@/component/Cmatrix/Cmatrix';
import Footer from '@/component/Footer/Footer'

interface Error {
    message: string,
    type: number
}

export default function Signup() {
    const [ errors, setErrors ] = useState<Error[] | null>(null);
    const [ email, setEmail ] = useState<string>('');

    function addError(message: string, type: number = 0): void {
        setErrors(prev => [...(prev || []), { message: message, type: type }])
    }

    async function fetchSubmit(): Promise<boolean> {
        try {
            const res = await fetch('/api/auth/magic-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const contentType = res.headers.get("content-type");
            const data = contentType && contentType.includes("application/json") 
                ? await res.json() 
                : null;

            if (res.ok && data?.ok) {
                addError('Success! Check your email!', 1);
                return true;
            }

            const errorMessage = data?.message || `Error: ${res.status} ${res.statusText}`;
            addError(errorMessage, 0);
            return false;

        } catch (err) {
            addError('Network error. Please check your connection.', 0);
            return false;
        }
    }

    async function submit() {

        // first of all check field username and email
        if(!email) {
            addError('email is required');
            return;
        }
        else if (!validateEmail(email)){
            addError('invalid email');
            return;
        }

        addError('please wait', 2);

        const ok = await fetchSubmit();
        if(!ok)
            return;

        // clear input
        setEmail('');
    }

    const validateEmail = (email: string) => {
        return email.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    return (
        <>
        <div className={style.signup}>
            <Cmatrix />
            { errors && errors.length > 0 && (
                errors.map((e, i) =>
                    <ErrorPopup 
                        onClose={() => setErrors(e => e && e.filter((_, index) => index !== i))}
                        message={e.message}
                        type={e.type}
                        index={i}
                        key={i}
                    />)
            )}

            <h1>Authorization</h1>
            <div className={style.signupContainer}>
                <input type='text' placeholder='email...' onChange={e => setEmail(e.target.value)} value={email} />
                <button onClick={submit}>Continue</button>
            </div>
        </div>
            
        <Footer />
        </>
    )
}