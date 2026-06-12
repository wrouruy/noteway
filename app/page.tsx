'use client'
import { useState, useEffect } from 'react';

interface User {
    name: string,
    email: string
}
interface Response {
    ok: boolean,
    message: string,
    user: User | null
}

export default function Home() {
    const [loading, setLoad ] = useState<boolean>(true);
    const [ res, setRes ] = useState<Response | undefined>(undefined);

    useEffect(() => {
        fetch('/api/user', {
            method: 'GET'
        })  .then(res => {
                console.log(res)
                return res.json()
            })
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
                        (
                            res.user ?
                            (<h1>hello, {res.user.name}</h1>) :
                            (<h1>please, registry</h1>)
                        ) :
                        (
                            <h1>some error has occured: {res.message}</h1>
                        )
                ) : (<h1>some problems has occured while receiving data <br /> please reload page</h1>)
            )}
        </div>
    );
}
