import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface Props {
    message: string,
    onClose(): void
}

export default function ErrorPopup({ message, onClose }: Props) {
    return (
        <div>
            <p>{message}</p>
            <button onClick={onClose}>
                <FontAwesomeIcon icon={faXmark} />
            </button>
        </div>
    )
}