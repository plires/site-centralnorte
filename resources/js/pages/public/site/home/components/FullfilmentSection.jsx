import manoProductosImg from '@/../images/home/mano-productos.webp';
import { Button } from '@/pages/public/site/components';
import styles from './FullfilmentSection.module.css';

const FullfilmentSection = () => {
    return (
        <section className={styles.section}>
            {/* Franja azul superior */}
            <div className={styles.topBar}></div>

            {/* Contenido posicionado sobre la franja */}
            <div className={styles.contentWrapper}>
                <div className="container">
                    <div className="row align-items-center">
                        {/* Imagen - en mobile va primero (order-1), en desktop va segundo (order-lg-2) */}
                        <div className={`col-lg-6 order-lg-2 order-1 col-12 ${styles.contentImg}`}>
                            <div className={styles.imageWrapper}>
                                <img src={manoProductosImg} alt="Fullfilment - Manos con productos" className={styles.image} />
                            </div>
                        </div>

                        {/* Contenido - en mobile va segundo (order-2), en desktop va primero (order-lg-1) */}
                        <div className="col-lg-6 order-lg-1 order-2 col-12">
                            <div className={styles.content}>
                                <h2 className={styles.title}>Fullfilment</h2>
                                <p className={styles.hashtags}>
                                    <strong>#Empaque. #Control. #Armado.</strong>
                                </p>
                                <p className={styles.description}>
                                    Trabajamos con nuestras manos como si fueran tuyas.
                                    <br />
                                    Contanos qué debemos ensamblar, separar, contar, dividir,
                                    <br />
                                    o bien armar un lindo kit de regalo para tus clientes.
                                    <br />
                                    Solo envianos los productos, nosotros hacemos el resto.
                                </p>
                                <Button href={`contacto/`} variant="outline-tertiary" size="lg">
                                    Cotizar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FullfilmentSection;
