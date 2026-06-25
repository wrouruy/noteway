'use client';
import Cmatrix from '@/component/Cmatrix/Cmatrix';
import Footer from '@/component/Footer/Footer';
import Link from 'next/link';
import style from './404.module.scss';

export default function NotFound () {
    return (
        <div className={style.notFound}>
            <Cmatrix />
            <main>
                <h1>404</h1>
                <p>Oops page not found</p>
                <div>
                    <button onClick={() => history.back()}>go back</button>
                    <Link href='/'>go home</Link>
                </div>
            </main>
            <Footer />
        </div>
    )
}