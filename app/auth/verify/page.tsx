'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './verify.module.scss';
import Cmatrix from '@/component/Cmatrix/Cmatrix';

interface ResponseData {
    ok: boolean;
    message: string;
}

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [loading, setLoad] = useState<boolean>(true);
    const [res, setRes] = useState<ResponseData | null>(null);

    useEffect(() => {
        if (!token) {
            setLoad(false);
            return;
        }

        fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token })
        })
        .then((res) => res.json())
        .then((data) => setRes(data))
        .catch(() => setRes({ ok: false, message: 'Network error' }))
        .finally(() => setLoad(false));
    }, [token]);

    if (!token)
        return <h1>token is required!</h1>;

    if (loading)
        return <h1>loading...</h1>;

    if (!res)
        return <div><h1>unknown error</h1><p>please reload page</p></div>;

    if (res.ok)
        return <div><h1>registration was successful!</h1><p>you can close this tab</p></div>;

    return <div><h1>occured error</h1><p>{res.message}</p></div>;
}

export default function Verify() {
    return (
        <div className={styles.verify}>
            <Suspense fallback={<h1>loading...</h1>}>
                <VerifyContent />
            </Suspense>
            <Cmatrix />
        </div>
    );
}
