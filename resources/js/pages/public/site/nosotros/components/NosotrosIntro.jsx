import styles from './NosotrosIntro.module.css';

const NosotrosIntro = () => {
    return (
        <section className={styles.section}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-8">
                        <p className={styles.text}>
                            Somos un equipo joven que combina <strong>estrategia, creatividad y ejecución</strong> para darle vida a cada proyecto.
                            Diseñamos kits, elementos y acciones con propósito, cuidando cada detalle desde la idea hasta la entrega final.
                        </p>
                        <p className={styles.text}>
                            Creemos que <strong>cada producto comunica.</strong> Ya sea para motivar, agradecer o conectar, transformamos tus objetivos
                            en experiencias memorables que fortalecen vínculos y generan impacto.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NosotrosIntro;
