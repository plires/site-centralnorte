import bolsaImg from '@/../images/home/bolsa.webp';
import moveTuMarcaImg from '@/../images/home/move-tu-marca.webp';
import ondaImg from '@/../images/home/onda.webp';
import styles from './MoveTuMarcaSection.module.css';

const MoveTuMarcaSection = () => {
    return (
        <section className={styles.section}>
            {/* Franja blanca superior */}
            <div className={styles.topBar}></div>

            {/* Contenido principal */}
            <div className={styles.mainContent}>
                <div className="container">
                    <div className="row align-items-center">
                        {/* Columna izquierda - Logo */}
                        <div className={`col-md-6 col-12 ${styles.contentMoveTuMarca}`}>
                            <img src={moveTuMarcaImg} alt="Mové tu marca" className={styles.logoImage} />
                        </div>

                        {/* Columna derecha - Bolsa */}
                        <div className={`col-md-6 col-12 ${styles.contenImg}`}>
                            <div className={styles.productImageWrapper}>
                                <img src={bolsaImg} alt="Productos" className={styles.productImage} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Onda turquesa (solo en pantallas grandes) */}
                <img src={ondaImg} alt="" className={styles.wave} aria-hidden="true" />
            </div>

            {/* Franja blanca inferior */}
            <div className={styles.bottomBar}></div>
        </section>
    );
};

export default MoveTuMarcaSection;
