'use client'
import { useState, useEffect } from 'react';

interface User {
    name: string,
    email: string
}
interface Response {
    ok: boolean,
    message: string,
    user: User
}

export default function Home() {
    const [loading, setLoad ] = useState<boolean>(true);
    const [ res, setRes ] = useState<Response | undefined>(undefined);

    useEffect(() => {
        fetch('/api/user', {
            method: 'POST'
        })  .then(res => res.json())
            .then(data => setRes(data))
            .finally(() => setLoad(false))
    }, []);

    return (
        <div>
            {loading ?
            (<h1>loading...</h1>) :
            (
                res ? (
                    res.ok ?
                    (<h1>hello, {res.user.name}</h1>) :
                    (<h1>unknown error: {res.message}</h1>)
                ) :
                (<h1>some problems has occured while receiving data <br /> please reload page</h1>)
            )}
        </div>
    );
}
