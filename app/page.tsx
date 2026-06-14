'use client'
import { useState, useEffect } from 'react';
import Greetings from '@/component/Greetings/Greetings';
import confirmPopup from '@/component/ConfirmPopup/ConfirmPopup';
import { cutString } from '@/lib/cutString';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from './page.module.scss'

interface UserRes {
    ok: boolean,
    message: string,
    user: {
        name: string,
        email: string
    } | null
}

interface NoteRes {
    ok: boolean,
    message: string,
    note: {
        id: string,
        content: string,
        user_id: number,
        created_at: string,
        last_update: string
    }[] | null
}

export default function Home() {
    const [loading, setLoad] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [user, setUser]   = useState<UserRes | undefined>(undefined);
    const [notes, setNotes] = useState<NoteRes | undefined>(undefined);

    async function fetchUser () {
        const res = await fetch('/api/user', { method: 'GET' });
        const data = await res.json();

        if (!data)
            return setError('unknown error, please reload page');

        if (!data?.ok)
            return setError(data.message);
        setUser(data);
    }

    async function fetchNotes () {
        const res = await fetch('/api/note', { method: 'GET' });
        const data = await res.json();

        if (!data)
            return setError('unknown error, please reload page');

        if (!data?.ok)
            return setError(data.message);

        setNotes(data);
    }

    useEffect(() => {
        (async () => {
            try {
                await fetchUser();
                await fetchNotes();
            } catch (err) {
                setError('A network error occurred.');
            } finally {
                setLoad(false);
            }
        })();
    }, []);

    function cutNoteRows(note: string): string[] {
        const rows = note.split('\n');
        let res: string[] = [];
        rows.forEach(e => res.push(cutString(e, 15)));
        return res;
    }

    return (
        <div className={styles.home}>
            {loading ?
            (<h1>loading...</h1>) :
            (
                <>
                {user && (
                    user.user && (
                        <Greetings name={user.user.name} />
                    )
                )}

                <div className={styles.noteContainerTop}>
                    <button className={styles.createNote} >create</button>
                    <button className={styles.deleteNote}> <FontAwesomeIcon icon={faTrash}/> </button>
                </div>
                <div className={styles.noteContainer}>
                    {notes && (
                        notes.note &&
                            (notes.note.map(e => (
                                <a className={styles.noteItem} key={e.id} href={'/note/' + e.id}>
                                    {cutNoteRows(e.content).map(e => <h3 key={e}> {e} <br/> </h3>)}
                                </a>
                            )))
                    )}
                </div>
                </>
            )}
        </div>
    );
}