import logos from '@/../images/nosotros/logos.webp';
import styles from './PartnersSection.module.css';

const PartnersSection = () => {
    return (
        <section className={`${styles.section} container-fluid`}>
            <div className="row">
                <div className={`col-md-6 ${styles.contentData}`}>
                    <div className="row">
                        <div className="col-md-12"></div>
                        <div className="col-md-12">
                            <h2 className={styles.title}>
                                <span className={styles.icon}>NUESTROs</span>
                                <br />
                                PARTNERS
                            </h2>
                        </div>
                    </div>
                </div>
                <div className={`col-md-6 ${styles.contentLogos}`}>
                    <div className="row h-100">
                        <div className={`col-md-12 ${styles.contentImgLogos}`}>
                            <img src={logos} alt="logos" className={`img-fluid ${styles.logos}`} />
                        </div>
                        <div className={`col-md-12 ${styles.fajaPlena}`}></div>
                    </div>
                </div>
            </div>
            <div className={styles.logosWrapper}></div>
        </section>
    );
};

export default PartnersSection;
