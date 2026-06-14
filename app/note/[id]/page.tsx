'use client'
import { useState, useEffect, use, JSX } from "react";
import ConfirmPopup from '@/component/ConfirmPopup/ConfirmPopup'
import ReactMarkdown from 'react-markdown';

interface Response {
    ok: boolean,
    message: string,
    note: {
        user_id: number,
        content: string,
        created_at: string,
        last_update: string
    } | null
}

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function Note ({ params }: Props) {
    const [ loading, setLoad ] = useState<boolean>(true);
    const [ note, setNote ] = useState<Response | null>(null);
    
    const { id } = use(params);

    useEffect(() => {
        fetch(`/api/note/${id}`, {
            method: "GET",
        })  .then(res => res.json())
            .then(data => setNote(data))
            .finally(() => setLoad(false));
    }, []);

    return (
        loading ? 
        (<h1>loading...</h1>) :
        (
            note ?
                (
                    note.ok ? (
                        note.note ?
                            (
                            <div>
                                <ConfirmPopup actionName="are you sure?"  func={() => console.log('aa')}/>
                                <ReactMarkdown>{note.note.content}</ReactMarkdown>
                            </div>
                            ) :
                            (<p>status 404<br />cannot find note</p>)
                    ) :
                    (<h1>error: {note.message}</h1>)
                ) :
                (<h1>unknown error, please reload page</h1>)
        )
    )
}