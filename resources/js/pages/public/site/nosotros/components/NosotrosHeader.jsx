import headerDesktop from '@/../images/nosotros/header-desktop.webp';
import headerMobile from '@/../images/nosotros/header-mobile.webp';
import ondaImage from '@/../images/nosotros/onda.webp';
import styles from './NosotrosHeader.module.css';

const NosotrosHeader = () => {
    return (
        <header className={styles.header}>
            <div className={styles.imageContainer}>
                <picture>
                    <source media="(min-width: 768px)" srcSet={headerDesktop} />
                    <img src={headerMobile} alt="Equipo Central Norte" className={styles.mainImage} />
                </picture>
                <div className={styles.gradient} />

                <div className={`container ${styles.content}`}>
                    <div className="row">
                        <div className="col-12">
                            <h1 className={styles.title}>
                                Más de <span>10 años</span>
                                <br className={styles.titleBreak} /> en la industria
                                <br className={styles.titleBreak} /> del merchandising
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
