'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import Greetings from '@/component/Greetings/Greetings';
import ConfirmPopup from '@/component/ConfirmPopup/ConfirmPopup';
import { cutString } from '@/lib/cutString';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from './page.module.scss'

import Cmatrix from '@/component/Cmatrix/Cmatrix';
import Footer from '@/component/Footer/Footer';

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
    const [ showCreateNote, setShowCreateNote ] = useState<boolean>(false);

    const router = useRouter();

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
        if (!note)
            return [];
        const rows = note.split('\n');
        let res: string[] = [];
        rows.forEach(e => res.push(cutString(e, 15)));
        return res;
    }

    function createNote() {
        fetch('/api/note', {
            method: 'POST'
        })  .then(res => res.json())
            .then(data => {
                if (data?.ok)
                    router.push(`/note/${data.note.id}`);
            })
    }

    return (
        <div className={styles.home}>
            <Cmatrix />
            <ConfirmPopup isOpen={showCreateNote} onCancel={() => setShowCreateNote(false)} onConfirm={createNote} title='to create a note' />

            <main>
                {loading ?
                (<h1>loading...</h1>) :
                (
                    <>
                    {user && (
                        user.user && (
                            <div className={styles.user}>
                                <Image 
                                    src={`/api/user/${user.user.name}/avatar`}
                                    alt={`${user.user.name}'s avatar`}
                                    width={250}
                                    height={250}
                                />
                                <div>
                                    <Greetings name={user.user.name} />
                                    <p>{user.user.email}</p>
                                </div>
                            </div>
                        )
                    )}

                    {notes && (
                        <div className={styles.note}>
                            <div className={styles.notesContainerTop}>
                                <button className={styles.createNote} onClick={() => setShowCreateNote(true)}> <FontAwesomeIcon icon={faPlus}/> </button>
                                <button className={styles.deleteNote}> <FontAwesomeIcon icon={faTrash}/> </button>
                            </div>
                            <div className={styles.notesContainer}>
                                    {notes.note &&
                                        (notes.note.map(e => (
                                            <a className={styles.noteItem} key={e.id} href={'/note/' + e.id}>
                                                {cutNoteRows(e.content).map(e => <h3 key={e}> {e} <br/> </h3>)}
                                            </a>
                                        )))}
                            </div>
                        </div>
                    )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}