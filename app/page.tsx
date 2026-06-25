'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import Greetings from '@/component/Greetings/Greetings';
import ConfirmPopup from '@/component/ConfirmPopup/ConfirmPopup';
import ErrorPopup from "@/component/ErrorPopup/ErrorPopup";
import Cmatrix from '@/component/Cmatrix/Cmatrix';
import Footer from '@/component/Footer/Footer';
import { cutString } from '@/lib/cutString';

import ReactMarkdown from 'react-markdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faCheck, faGear } from '@fortawesome/free-solid-svg-icons';

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

interface Error {
    message: string,
    type: number
}

export default function Home() {
    const [loading, setLoad] = useState<boolean>(true);
    const [ errors, setErrors ] = useState<Error[] | null>(null);
    const [user, setUser]   = useState<UserRes | undefined>(undefined);
    const [notes, setNotes] = useState<NoteRes | undefined>(undefined);
    const [ showCreateNote, setShowCreateNote ] = useState<boolean>(false);
    const [ showDelNote, setShowDelNote ] = useState<boolean>(false);

    const [selected, setSelected] = useState<string[]>([]);

    const router = useRouter();

    function addError(message: string, type: number = 0) {
        setErrors(prev => [ ...(prev || []), { message: message, type: type } ]);
    }

    async function fetchUser () {
        const res = await fetch('/api/user', { method: 'GET' });
        const data = await res.json();

        if (!data)
            return addError('unknown error, please reload page');

        if (!data?.ok)
            return addError(data.message);
        setUser(data);
    }

    async function fetchNotes () {
        const res = await fetch('/api/note', { method: 'GET' });
        const data = await res.json();

        if (!data)
            return addError('unknown error, please reload page');

        if (!data?.ok)
            return;

        setNotes(data);
    }

    useEffect(() => {
        (async () => {
            try {
                await fetchUser();
                await fetchNotes();
            } catch (err) {
                addError("Network error");
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
        rows.forEach(e => res.push(cutString(e, 20)));
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

    async function deleteNotes() {         
        try {
            const promises = selected.map(async (e) => {             
                const res = await fetch('/api/note/' + e, { method: 'DELETE' });             
                const data = await res.json();             
                if (!res.ok)
                    addError(data.message);   
            });
            await Promise.all(promises);
            await fetchNotes();
        } catch (error) {
            addError("Network error");
        }
    }

    function selectClick(
        e: React.MouseEvent<HTMLAnchorElement>,
        id: string
    ) {
        if (e.ctrlKey || selected.length > 0) {
            e.preventDefault();

            setSelected(prev =>
                prev.includes(id)
                    ? prev.filter(x => x !== id)
                    : [...prev, id]
            );
        }
    }

    return (
        <div className={styles.home}>
            <Cmatrix />

            <main>
                {loading ?
                (<h1>loading...</h1>) :
                (
                    <>
                    <div className={styles.leftBlock}>
                    {user ? (
                        user.user ? (
                            <>
                            <div className={styles.user}>
                                <Image 
                                    src={`/api/user/${user.user.name}/avatar`}
                                    alt={`${user.user.name}'s avatar`}
                                    width={250}
                                    height={250}
                                    loading="eager"
                                />
                                <div>
                                    <Greetings name={user.user.name} />
                                    <p>{user.user.email}</p>
                                </div>
                            </div>
                            <Link className={styles.goToSettings} href="/settings"> <FontAwesomeIcon icon={faGear} /> </Link>
                            </>
                        ) :
                        (
                            <div className={styles.user}>
                                <div>
                                    <h1>who are you?</h1>
                                    <p>we are unable to recognize you...</p>
                                </div>
                            </div>
                        )
                    ) : (
                        <h1>unknown error <br /> please reload page</h1>
                    )}
                    <div className={styles.viewedNotes}>
                        <h3>previously viewed notes</h3>
                        <div className={styles.viewedNotesContainer}></div>
                    </div>
                    </div>

                    <div className={styles.note}>
                        {notes ? (
                            <>
                                <div className={styles.notesContainerTop}>
                                    <button className={styles.createNote} onClick={() => setShowCreateNote(true)}> <FontAwesomeIcon icon={faPlus}/> </button>
                                    <button className={styles.deleteNote} onClick={() => setShowDelNote(selected.length > 0)} > <FontAwesomeIcon icon={faTrash}/> </button>
                                </div>
                                <div className={styles.notesContainer}>
                                        {notes.note &&
                                            (notes.note.map(e => (
                                                <Link
                                                    className={`
                                                        ${styles.noteItem}
                                                        ${selected.includes(e.id) ? styles.selectedNotes : ''}
                                                    `}
                                                    href={'/note/' + e.id}
                                                    onClick={(event) => selectClick(event, e.id)}
                                                    key={e.id}
                                                >
                                                    <div>{cutNoteRows(e.content).map((e, i) => <ReactMarkdown key={i}>{e}</ReactMarkdown>)}</div>
                                                    <div className={styles.selectNote}> <FontAwesomeIcon icon={faCheck} /> </div>
                                                </Link>
                                            )))}
                                
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles.completeRegistr}>
                                    <h2>please complete the registration</h2>
                                    <Link href="/auth"> Go </Link>
                                </div>
                            </>
                        )}
                    </div>
                    </>
                )}
            </main>
            
            <ConfirmPopup isOpen={showCreateNote} onCancel={() => setShowCreateNote(false)} onConfirm={createNote} title='to create a note' />
            <ConfirmPopup isOpen={showDelNote} onCancel={() => setShowDelNote(false)} onConfirm={deleteNotes} title='to delete the notes' />

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

            <Footer />
        </div>
    );
}