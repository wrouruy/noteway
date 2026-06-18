'use client';
import style from './signup.module.scss'
import ErrorPopup from '@/component/ErrorPopup/ErrorPopup';

export default function Signup() {
    return (
        <div className={style.signup}>
            <ErrorPopup onClose={() => console.log('sasasa')} message={'unknown error, please reload page'} />
        </div>
    )
}