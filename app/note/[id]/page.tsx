'use client'
import { useState, useEffect, use, JSX } from "react";
import ConfirmPopup from '@/component/ConfirmPopup/ConfirmPopup'
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import style from './note.module.scss'

interface NoteRes {
    ok: boolean,
    message: string,
    note: {
        user_id: number,
        content: string,
        created_at: string,
        last_update: string
    } | null
}

interface UserRes {
    ok: true,
    message: string,
    user: {
        id: number,
        name: string,
        email: string
    } | null
}

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function Note ({ params }: Props) {
    const [ loading, setLoad ] = useState<boolean>(true);
    const [ note, setNote ] = useState<NoteRes | null>(null);
    const [ user, setUser ] = useState<UserRes | null>(null);
    
    const { id } = use(params);

    async function fetchNote() {
        return fetch(`/api/note/${id}`, { method: "GET" })  
            .then(res => res.json())
            .then(data => {
                setNote(data)
                return data;
            })
    };

    async function fetchUser(user_id: number) {
        fetch(`/api/user/by-id/${user_id}`, {
            method: "GET",
        })  .then(res => res.json())
            .then(data => setUser(data))
    }

    useEffect(() => {
        ( async () => {
            try {
                const noteData = await fetchNote();
                await fetchUser(noteData?.note?.user_id)
            } catch(err: any) {
                alert(err.message);
            } finally {
                setLoad(false);
            }
        })()
    }, []);

    return (
        <div className={style.note}>
            {loading ? 
            (<h1>loading...</h1>) :
            (
                note ?
                    (
                        note.ok ? (
                            note.note ?
                                (
                                    <main>
                                        <div className={style.ownerContainer}>
                                            <Image
                                                src={`/api/user/${user?.user?.name}/avatar`}
                                                alt='avatar'
                                                width={60}
                                                height={60}
                                            />
                                            by {user?.user?.name}
                                        </div>
                                        <div className={style.noteContainer}>
                                            <ReactMarkdown>{note.note.content}</ReactMarkdown>
                                        </div>
                                    </main>
                                ) :
                                (<p>status 404<br />cannot find note</p>)
                        ) :
                        (<h1>error: {note.message}</h1>)
                    ) :
                    (<h1>unknown error, please reload page</h1>)
            )}
        </div>

    )
}