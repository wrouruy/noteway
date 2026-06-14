import { useState } from "react"
import styles from './styles.module.scss'

interface Props {
    actionName: string,
    func(): void
}

export default function ComfirnPopup ({ actionName, func }: Props) {
    const [opacity, setOpacity] = useState<number>(1);
    function disappear() {
        let counter = 0;
        setTimeout(() => {
            for(let i = 1; i >= 0; i -= 0.1) {
                counter++;
                setTimeout(() => {
                    setOpacity(i)
                }, 30 * counter)
            }
        })
    }

    return (
        <div style={{ opacity: opacity }} className={styles.popup}>
            <h1>Confirm {actionName}?</h1>
            <div>
                <button onClick={disappear}>Cancel</button>
                <button onClick={() => {
                    func();
                    disappear();
                }}>OK</button>
            </div>
        </div>
    )
}