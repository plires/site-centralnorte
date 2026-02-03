import headerDesktop from '@/../images/copacking/header-desktop.webp';
import headerMobile from '@/../images/copacking/header-mobile.webp';
import ondaImage from '@/../images/copacking/onda.webp';
import styles from './CopackingHeader.module.css';

const CopackingHeader = () => {
    return (
        <header className={styles.header}>
            <div className={styles.imageContainer}>
                <picture>
                    <source media="(min-width: 768px)" srcSet={headerDesktop} />
                    <img src={headerMobile} alt="Copacking Central Norte" className={styles.mainImage} />
                </picture>
                <div className={`container ${styles.content}`}>
                    <div className="row">
                        <div className="col-12">
                            <h1 className={styles.title}>
                                Proceso <br className={styles.titleBreak} />
                                de empaque, <br className={styles.titleBreak} />
                                control y armado
                            </h1>
                        </div>
                    </div>
                </div>
                <div className={styles.overlay}></div>
            </div>

            <img src={ondaImage} alt="" className={styles.wave} aria-hidden="true" />
        </header>
    );
};

export default CopackingHeader;
