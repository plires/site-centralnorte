import copacking1 from '@/../images/copacking/copacking-1.webp';
import copacking2 from '@/../images/copacking/copacking-2.webp';
import copacking3 from '@/../images/copacking/copacking-3.webp';
import copacking4 from '@/../images/copacking/copacking-4.webp';
import logosImg from '@/../images/copacking/logos.webp';
import ondaInferiorImg from '@/../images/copacking/onda-inferior.webp';
import { FaPlus } from 'react-icons/fa6';
import styles from './CopackingDesarrollos.module.css';

const images = [
    { src: copacking1, alt: 'Desarrollo co-packing 1' },
    { src: copacking2, alt: 'Desarrollo co-packing 2' },
    { src: copacking3, alt: 'Desarrollo co-packing 3' },
    { src: copacking4, alt: 'Desarrollo co-packing 4' },
];

const CopackingDesarrollos = () => {
    return (
        <section className={styles.section}>
            {/* Top section with blue background (behind images) */}
            <div className={styles.topSection}>
                <img src={logosImg} alt="" className={styles.logosDecoration} aria-hidden="true" />
                <img src={ondaInferiorImg} alt="" className={styles.waveBottom} aria-hidden="true" />

                <div className="container">
                    <div className={styles.content}>
                        <div className={styles.titleWrapper}>
                            <FaPlus className={styles.icon} />
                            <h2 className={styles.title}>
                                <span className={styles.titleLine1}>Desarrollos</span>
                            </h2>
                        </div>

                        <p className={styles.introText}>
                            <strong>Trabajamos con nuestras manos como si fueran tuyas.</strong>
                            Contanos qué debemos ensamblar, separar, contar, dividir, o bien armar un lindo kit de regalo para tus clientes.
                            <strong>Solo envianos los productos, nosotros hacemos el resto.</strong>
                        </p>
                    </div>
                </div>
            </div>

            {/* Images grid (above blue background) */}
            <div className={styles.contentWrapper}>
                <div className="container-fluid">
                    <div className={styles.imagesGrid}>
                        {images.map((image, index) => (
                            <div key={index} className={styles.imageItem}>
                                <img src={image.src} alt={image.alt} className={styles.image} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CopackingDesarrollos;
