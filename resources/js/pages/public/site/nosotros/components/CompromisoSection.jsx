import logoBackground from '@/../images/nosotros/logo-background.webp';
import logoIqnet from '@/../images/nosotros/logo-iqnet.webp';
import logoIram from '@/../images/nosotros/logo-iram.webp';
import logoIso from '@/../images/nosotros/logo-iso.webp';
import styles from './CompromisoSection.module.css';

const CompromisoSection = () => {
    return (
        <section className={styles.section}>
            <img src={logoBackground} alt="" className={styles.backgroundLogo} aria-hidden="true" />

            <div className="container">
                <div className="row">
                    <div className="col-lg-8 offset-lg-2 col-12">
                        <div className={styles.content}>
                            <h2 className={styles.title}>
                                Nuestro
                                <br />
                                Compromiso
                            </h2>
                            <p className={styles.description}>
                                La ISO 9001 es la prueba de <strong>nuestra búsqueda constante de la excelencia en calidad</strong>, asegurando que
                                recibas siempre lo mejor.
                            </p>
                            <div className={styles.logos}>
                                <img src={logoIso} alt="ISO" className={styles.logo} />
                                <img src={logoIqnet} alt="IQNet Recognized Certification" className={styles.logo} />
                                <img src={logoIram} alt="IRAM Gestión de la Calidad" className={styles.logo} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CompromisoSection;
