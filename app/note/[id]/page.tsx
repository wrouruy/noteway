'use client'
import { useState, useEffect, use } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faPen, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons'; 

import ConfirmPopup from '@/component/ConfirmPopup/ConfirmPopup';
import ErrorPopup from "@/component/ErrorPopup/ErrorPopup";
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import style from './note.module.scss'
import Link from "next/link";

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

interface Error {
    message: string,
    type: number
}

export default function Note ({ params }: Props) {
    const [ loading, setLoad ] = useState<boolean>(true);
    const [ errors, setErrors ] = useState<Error[] | null>(null);
    const [ note, setNote ]    = useState<NoteRes | null>(null);
    const [ owner, setOwner ]  = useState<UserRes | null>(null);
    const [ user, setUser ]    = useState<UserRes | null>(null);

    const [ edit, setEdit ]    = useState<boolean>(false);
    const [ editContent, setEditContent ] = useState<string>('');
    const [ showDelNote, setShowDelNote ] = useState<boolean>(false);

    const { id } = use(params);

    function addError(message: string, type: number = 0) {
        setErrors(prev => [ ...(prev || []), { message: message, type: type } ]);
    }

    async function fetchNote() {
        return fetch(`/api/note/${id}`, { method: "GET" })  
            .then(res => res.json())
            .then(data => {
                setNote(data);
                setEditContent(data?.note ? data.note.content : '');
                return data;
            })
    };

    async function fetchOwner(user_id: number) {
        fetch(`/api/user/by-id/${user_id}`, {
            method: "GET",
        })  .then(res => res.json())
            .then(data => setOwner(data))
    }

    async function fetchUser() {
        fetch(`/api/user`, {
            method: 'GET'
        })  .then(res => res.json())
            .then(data => setUser(data))
    }

    useEffect(() => {
        ( async () => {
            try {
                const noteData = await fetchNote();

                const viewedNotesString = localStorage.getItem('viewedNotes');
                let viewedNotes = [];

                try {
                    viewedNotes = viewedNotesString ? JSON.parse(viewedNotesString) : [];
                } catch (error) {
                    console.error("Error parsing viewedNotes from localStorage", error);
                }

                let updatedNotes = viewedNotes.filter((s: string) => s !== id);

                if (noteData.note)
                    updatedNotes = [...updatedNotes, id];

                localStorage.setItem('viewedNotes', JSON.stringify(updatedNotes));

                await fetchOwner(noteData?.note?.user_id)
                await fetchUser();
            } catch(err: any) {
                addError(err.message);
            } finally {
                setLoad(false);
            }
        })()
    }, []);

    async function toEditMode() {
        if (!edit)
            return setEdit(true);

        if (!editContent)
            return;

        addError('please wait', 2);
        try {
            const res = await fetch(`/api/note/${id}`,
                { method: 'PUT', body: JSON.stringify({ content: editContent })
            });

            const data = await res.json();
            
            if (!data)
                return addError('Unknown error, try again in hour');
            else if(!data.ok)
                return addError(data.message);

        } catch(err) {
            addError('Please check your internet connection');
        }

        addError('Changed successfully!', 1);
        setEdit(false);
        setEditContent('');
        await fetchNote();
    }

    async function deleteNote() {
        try {
            const res = await fetch(`/api/note/${id}`, { method: "DELETE" });
            const data = await res.json();

            if (!data)
                return addError('Unknown error, try again in hour');

            if (!data.ok)
                return addError(data.message);

            document.referrer ? history.back() : location.href = '/';
        } catch(err) {
            addError('Please check your internet connection');
        }
    }

    return (
        <div className={style.note}>
            <main>
            {loading ? 
            (<h1>loading...</h1>) :
            (
                note ?
                    (
                        note.ok ? (
                            note.note ?
                                (
                                    <>
                                        <div className={style.ownerContainer}>
                                            <div>
                                                <button onClick={() => history.back()}>
                                                    <FontAwesomeIcon icon={faAngleLeft} />
                                                </button>
                                                <Image
                                                    src={`/api/user/${owner?.user?.name}/avatar`}
                                                    alt='avatar'
                                                    width={60}
                                                    height={60}
                                                    loading="eager"
                                                />
                                                by {owner?.user?.name}
                                            </div>
                                            <div>
                                                {user ?
                                                    (
                                                        (user.user?.id === owner?.user?.id) && (
                                                            <>
                                                            <button onClick={toEditMode}>
                                                                <FontAwesomeIcon icon={edit ? faCheck : faPen}/>
                                                            </button>
                                                            <button onClick={() => setShowDelNote(true)}>
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                            </>
                                                        )
                                                    ) :
                                                    (
                                                        <Link href="/auth">registry</Link>
                                                    )}
                                            </div>
                                        </div>
                                        <div className={style.noteContainer}>
                                            {edit ?
                                                    (<textarea value={editContent ? editContent : undefined} onChange={(e) => setEditContent(e.target.value)}></textarea>) :
                                                    (<ReactMarkdown>{note.note.content}</ReactMarkdown>)}
                                        </div>
                                    </>
                                ) :
                                (
                                    <div className={style.err404}>
                                        <h1>404</h1>
                                        <p>It looks like you're looking for the wrong note</p>
                                        <button onClick={() => history.back()}>Go back</button>
                                    </div>
                                )
                        ) :
                        (<h1>error: {note.message}</h1>)
                    ) :
                    (<h1>unknown error, please reload page</h1>)
            )}
            </main>

            <ConfirmPopup isOpen={showDelNote} onCancel={() => setShowDelNote(false)} onConfirm={deleteNote} title='to delete this note' />
        
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
        </div>

    )
}