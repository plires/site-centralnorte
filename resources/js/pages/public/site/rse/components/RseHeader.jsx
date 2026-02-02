import headerDesktop from '@/../images/rse/header-desktop.webp';
import headerMobile from '@/../images/rse/header-mobile.webp';
import ondaImage from '@/../images/rse/onda.webp';
import styles from './RseHeader.module.css';

const NosotrosHeader = () => {
    return (
        <header className={styles.header}>
            <div className={styles.imageContainer}>
                <picture>
                    <source media="(min-width: 768px)" srcSet={headerDesktop} />
                    <img src={headerMobile} alt="Producto Central Norte" className={styles.mainImage} />
                </picture>

                <div className={`container ${styles.content}`}>
                    <div className="row">
                        <div className="col-12">
                            <h1 className={styles.title}>
                                RESPONSABILIDAD <br className={styles.titleBreak} />
                                <span>SOCIAL EMPRESARIA</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <img src={ondaImage} alt="" className={styles.wave} aria-hidden="true" />
        </header>
    );
};

export default NosotrosHeader;
