import caraIcon from '@/../images/rse/cara.svg';
import donacionImg from '@/../images/rse/donacion.webp';
import entregaImg from '@/../images/rse/entrega.webp';
import ondaAccionesImg from '@/../images/rse/onda-acciones.webp';
import ondaSuperiorImg from '@/../images/rse/onda-superior.webp';
import plantamosImg from '@/../images/rse/plantamos.webp';
import styles from './RseAcciones.module.css';

const acciones = [
    {
        image: donacionImg,
        title: 'Donación semanal de plásticos y cartón.',
        description: 'Cooperativa El Álamo.',
    },
    {
        image: entregaImg,
        title: 'Entrega kits de viaje.',
        description: 'Las Murciélagas FADEC.',
    },
    {
        image: plantamosImg,
        title: 'Plantamos árboles en parque.',
        description: 'Ciudad Autónoma de Buenos Aires.',
    },
];

const RseAcciones = () => {
    return (
        <section className={styles.section}>
            {/* Wave decoration (right side) */}
            <img src={ondaAccionesImg} alt="" className={styles.waveRight} aria-hidden="true" />

            {/* Content wrapper (above blue background) */}
            <div className={styles.contentWrapper}>
                <div className="container">
                    <h2 className={styles.title}>Acciones</h2>

                    <div className={styles.imagesGrid}>
                        {acciones.map((accion, index) => (
                            <div key={index} className={styles.imageItem}>
                                <div className={styles.imageWrapper}>
                                    <img src={accion.image} alt={accion.title} className={styles.image} />
                                </div>
                                <h3 className={styles.imageTitle}>{accion.title}</h3>
                                <p className={styles.imageDescription}>· {accion.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom section with blue background (behind images) */}
            <div className={styles.bottomSection}>
                <img src={ondaSuperiorImg} alt="" className={styles.waveTop} aria-hidden="true" />

                <div className="container">
                    <div className={styles.bottomContent}>
                        <p className={styles.bottomText}>
                            <strong>Para nosotros, la responsabilidad social es agradecer y devolver a la comunidad</strong> —y a quienes todos los
                            días ponen lo mejor de sí en esta empresa— <strong>parte de lo que recibimos.</strong>
                        </p>
                        <img src={caraIcon} alt="Sonrisa" className={styles.smileyIcon} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RseAcciones;
