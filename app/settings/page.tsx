'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ErrorPopup from "@/component/ErrorPopup/ErrorPopup";
import Footer from '@/component/Footer/Footer';
import style from './settings.module.scss';

interface UserRes {
    ok: true,
    message: string,
    user: {
        id: number,
        name: string,
        email: string,
    } | null
}

interface Error {
    message: string,
    type: number
}

export default function Settings () {
    const [ loading, setLoad ] = useState<boolean>(true);
    const [ user, setUser ] = useState<UserRes | null>(null);
    const [ username, setUsername ] = useState<string>('');
    const [ errors, setErrors ] = useState<Error[] | null>(null);

    const router = useRouter();

    function addError(message: string, type: number = 0) {
        setErrors(prev => [ ...(prev || []), { message: message, type: type } ]);
    }

    async function rename() {
        addError('please wait', 2);
        const res = await fetch('/api/user/',
            { method: 'PUT', body: JSON.stringify({ username: username }) });
        
        const data = await res.json();
        if (!data.ok)
            addError(data.message);

        addError('success', 1);
        await fetchUser();
    }

    async function changeAvatar(files: FileList | null) {
        if (!files || files.length <= 0) return;
        const avatar = files[0];

        addError('please wait', 2);
        const formData = new FormData();
        formData.append('avatar', avatar);

        try {
            const res = await fetch('/api/user/avatar', {
                method: 'PUT',
                body: formData
            });
            if (!res.ok)
                addError('Iternal server error');

            const data = await res.json();

            if(!data.ok)
                addError(data.message);
        
            addError('success', 1);

        } catch(err: any) {
            addError(err.message);
        }
    }

    async function fetchUser() {
        const res = await fetch('/api/user', { method: 'GET' });
        const data = await res.json();

        if (!data.user)
            router.push(`/auth`);
    
        setUser(data);
    }

    useEffect(() => {
        (async () => {
            try {
                await fetchUser();

            } catch(err: any) {
                addError(err.message);
            } finally {
                setLoad(false);
            }
        })();
    });

    return (
        <>
        <div className={style.settings}>
            {
                loading ?
                    (<h1>loading...</h1>) :
                    (
                        user &&
                            (
                                <>
                                <div className={style.column}>
                                    <div className={style.col}>
                                        <h1>Account</h1>
                                        <span>{user.user?.email}</span>

                                        <div className={style.col}>
                                            <h3>name</h3>
                                            <div className={style.row}>
                                                <input type="text" placeholder={user.user?.name} onChange={(e) => setUsername(e.target.value)}/>
                                                <button onClick={rename}>rename</button>
                                            </div>
                                        </div>

                                        <div className={`${style.col} ${style.updateAvatar}`}>
                                            <h3>avatar</h3>
                                            <label htmlFor="updateAvatar">update</label>
                                            <input type="file" id="updateAvatar"
                                                accept="image/*"
                                                onChange={(e) => changeAvatar(e.target.files)}
                                            />
                                        </div>
                                    </div>

                                    {/* <div className={style.col}>
                                        <h1>Session</h1>
                                    </div> */}
                                </div>
                                <div>
                                    <Image src={`/api/user/${user.user?.name}/avatar`} width={200} height={200} alt="avatar"/>
                                </div>
                                </>
                            )
                    )
            }
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
        
        <Footer />
        </>
    )
}