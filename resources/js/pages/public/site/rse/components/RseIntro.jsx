import equipoDesktop from '@/../images/rse/equipo-desktop.webp';
import equipoMobile from '@/../images/rse/equipo-mobile.webp';
import styles from './RseIntro.module.css';

const RseIntro = () => {
    return (
        <section className={styles.section}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-8">
                        <p className={styles.text}>
                            En <strong>Central Norte SRL</strong> sabemos que nuestra tarea no termina cuando entregamos un producto. Creemos que cada
                            paso que damos puede sumar a un <strong>mundo más justo, solidario y con más oportunidades para todos.</strong> Por eso,
                            nos gusta involucrarnos en causas sociales, acompañar el trabajo local y tomar decisiones que generen un impacto positivo
                            en las personas y en el entorno.
                        </p>
                    </div>
                </div>
            </div>

            <div className={styles.imageWrapper}>
                <picture>
                    <source media="(min-width: 768px)" srcSet={equipoDesktop} />
                    <img src={equipoMobile} alt="Equipo Central Norte" className={styles.image} />
                </picture>
            </div>

            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-8">
                        <p className={styles.text}>
                            Ese compromiso también lo vivimos puertas adentro:{' '}
                            <strong>valoramos a cada uno de nuestros colaboradores, porque son el corazón de lo que hacemos.</strong> Apostamos a la
                            diversidad y la inclusión, convencidos de que las diferencias nos enriquecen y nos ayudan a crecer como equipo. Queremos
                            que Central Norte sea un lugar donde se respire respeto, motivación y buena energía, trabajando siempre en mejorar el
                            clima laboral y en que cada persona pueda desarrollarse tanto personal como profesionalmente.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RseIntro;
