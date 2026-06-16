import { useState } from "react"
import styles from './styles.module.scss'

interface Props {
    isOpen: boolean,
    title: string,
    onConfirm: () => void,
    onCancel: () => void
}

export default function ComfirnPopup ({ isOpen, title, onConfirm, onCancel }: Props) {
    if (!isOpen) return null;

    return (
        <div className={styles.popup}>
            <h1>Confirm {title}?</h1>
            <div>
                <button onClick={onCancel}>Cancel</button>
                <button onClick={() => {
                    onConfirm();
                    onCancel();
                }}>OK</button>
            </div>
        </div>
    )
}