'use client';
import { useState } from "react"

export default function Login() {
    const [ username, setUsername ] = useState<string>('');
    const [ email, setEmail ] = useState<string>('');

    function submit() {
        if (!username) {
            return;
        }
        if (!email) {
            return;
        }

        if (!email.includes('@')) {
            return;
        }

        fetch('/api/auth/magic-link', {
            method: 'POST',
            body: JSON.stringify({
                username: username,
                email: email
            })
        })
    }

    return (
        <div>
            <h1>login</h1>
            <input type="text" placeholder="username" onChange={(e) => setUsername(e.target.value)}/>
            <input type="text" placeholder="email" onChange={(e) => setEmail(e.target.value)} />
            <button onClick={submit}>submit</button>
        </div>
    )
}