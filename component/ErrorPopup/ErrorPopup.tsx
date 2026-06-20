import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import style from './styles.module.scss';

interface Props {
    message: string,
    onClose(): void,
    index: number,
    type?: number
}

export default function ErrorPopup({ message, onClose, index, type = 0 }: Props) {
    const bgc = ['rgb(241, 179, 179)', 'rgb(179, 241, 184)', 'rgb(171, 187, 230)'];

    return (
        <div className={style.ErrorPopup} style={{ top: 10 + index * 50, backgroundColor: bgc[type]  }}>
            <p>{message}</p>
            <button onClick={onClose} style={{ backgroundColor: bgc[type] }}>
                <FontAwesomeIcon icon={faXmark} />
            </button>
        </div>
    )
}