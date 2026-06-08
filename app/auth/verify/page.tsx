'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Response {
    ok: boolean,
    message: string
}

export default function Verify() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [ loading, setLoad ] = useState<boolean>(true);
    const [ res, setRes ] = useState<Response | null>(null);

    useEffect(() => {
        fetch('/api/auth/verify', {
            method: 'POST',
            body: JSON.stringify({ token: token })
        })  .then((res) => res.json())
            .then((data) => setRes(data))
            .finally(() => setLoad(false));
    }, []);

    if(!token)
        return <h1>token is required</h1>;

    if (!res)
        return (
            <div>
                <h1>iternal server error: field is empty <br />registry gone bad</h1>
            </div>
        )
    
    console.log(res);
    
    return (
        <div>
            {loading && (
                <h1>loading...</h1>
            )}

            {!res.ok && (
                <h1>client error: {res.message}</h1>
            )}

            {res.ok && (
                <h1>registry done well</h1>
            )}
        </div>
    )
}