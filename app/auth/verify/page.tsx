'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './verify.module.scss';
import Cmatrix from '@/component/Cmatrix/Cmatrix';

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
    
    return (
        <div className={styles.verify}>
            {token ? 
                loading ?
                    ( <h1>loading...</h1> ) :
                    (
                        res ?
                            (
                                res.ok ?
                                    ( <div><h1>registration was successful!</h1> <p>you can close this tab</p></div> ) :
                                    ( <div><h1>occured error</h1> <p>{res.message}</p></div> )
                            ) :
                            (<h1> unknown error<p>please reload page</p></h1>)
                    ) :
            ( <h1>token is required!</h1> )}

            <Cmatrix />
        </div>
    )
}