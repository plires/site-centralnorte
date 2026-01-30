import logos from '@/../images/nosotros/logos.webp';
import { FaPlus } from 'react-icons/fa6';
import styles from './SolucionesSection.module.css';

const SolucionesSection = () => {
    return (
        <section className={`${styles.section} container-fluid`}>
            <div className="row">
                <div className={`col-md-6 ${styles.contentData}`}>
                    <div className="row">
                        <div className="col-md-12">
                            <FaPlus className={styles.icon} />
                        </div>
                        <div className="col-md-12">
                            <h2 className={styles.title}>Soluciones</h2>
                        </div>
                    </div>
                </div>
                <div className={`col-md-6 ${styles.contentLogos}`}>
                    <div className="row h-100">
                        <div className={`col-md-12 ${styles.fajaPlena}`}></div>
                        <div className={`col-md-12 ${styles.contentImgLogos}`}>
                            <img src={logos} alt="logos" className={`img-fluid ${styles.logos}`} />
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.logosWrapper}></div>
        </section>
    );
};

export default SolucionesSection;
