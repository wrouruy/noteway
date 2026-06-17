import { useRef } from 'react';
import Image from   'next/image';
import logoPic from '@/public/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faCoffee, faAngleRight } from '@fortawesome/free-solid-svg-icons'; 
import style from  './styles.module.scss';

export default function Footer () {
    const emaiInputRef = useRef<HTMLInputElement>(null);

    function sendEmail(): void {
        if (emaiInputRef.current)
            emaiInputRef.current.value = '';
    }

    return (
        <footer className={style.footer}>
            <div className={style.logoContainer}>
                <nav>
                    <div className="row">
                        <Image src={logoPic} alt="logo" />
                        <h1>Noteway</h1>
                    </div>
                    <h4>share your notes without any troubles</h4>
                    <div className="row">
                        <a href="https://github.com/wrouruy/noteway"> <FontAwesomeIcon icon={faGithub} /> </a>
                        <a href="mailto:???@gmail.com"> <FontAwesomeIcon icon={faEnvelope} /> </a>
                        <a href="https://buymeacoffee.com/wrxxv"> <FontAwesomeIcon icon={faCoffee} /> </a>
                    </div>
                </nav>

                <div className="column">
                    <h3> subscribe for update </h3>
                    <div className="row">
                        <input type="text" placeholder='enter your email...' ref={emaiInputRef}/>
                        <button> <FontAwesomeIcon icon={faAngleRight} onClick={sendEmail}/> </button>
                    </div>
                </div>
            </div>

            <div className={style.listsContainer}>

                <div className="column">
                    <h2>Social medias</h2>
                    <ul>
                        <li> <a href='https://github.com/wrouruy/noteway'>Github</a> </li>
                        <li> <a href='https://buymeacoffee.com/wrxxv'>Buymeacoffee</a> </li>
                    </ul>
                </div>

                <div className="column">
                    <h2>Sitemap</h2>
                    <ul>
                        <li> <a href='/'>Home </a> </li>
                        <li> <a href='/note'>Note</a> </li>
                    </ul>
                </div>

            </div>
            
        </footer>
    )
}