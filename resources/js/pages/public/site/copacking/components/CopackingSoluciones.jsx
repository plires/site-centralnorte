import armadoIcon from '@/../images/copacking/armado.svg';
import empaquetadoIcon from '@/../images/copacking/empaquetado.svg';
import ensambladoIcon from '@/../images/copacking/ensamblado.svg';
import ondaTurquesa from '@/../images/copacking/onda-turquesa.webp';
import pickingIcon from '@/../images/copacking/picking.svg';
import remanejoIcon from '@/../images/copacking/remanejo.svg';
import trasladosIcon from '@/../images/copacking/traslados.svg';
import styles from './CopackingSoluciones.module.css';

const soluciones = [
    {
        icon: ensambladoIcon,
        title: 'Ensamblado',
        description: 'de productos.',
    },
    {
        icon: pickingIcon,
        title: 'Picking',
        description: 'de productos.',
    },
    {
        icon: empaquetadoIcon,
        title: 'Empaquetado',
        description: 'en termocontraíble.',
    },
    {
        icon: armadoIcon,
        title: 'Armado',
        description: 'de kits.',
    },
    {
        icon: remanejoIcon,
        title: 'Remanejo de mercadería',
        description: 'para entrega.',
    },
    {
        icon: trasladosIcon,
        title: 'Traslados y entrega',
        description: 'de mercadería.',
    },
];

const CopackingSoluciones = () => {
    return (
        <section className={styles.section}>
            <img src={ondaTurquesa} alt="" className={styles.waveDecoration} aria-hidden="true" />

            <div className="container">
                <div className={styles.intro}>
                    <p className={styles.introText}>
                        Recibimos tus productos y los entregamos a tus clientes con un servicio de calidad. Nos ocupamos de cada detalle para que
                        lleguen en tiempo y forma. <strong>Tu marca en buenas manos, de principio a fin.</strong>
                    </p>
                </div>

                <div className={styles.titleWrapper}>
                    <h2 className={styles.title}>
                        <span className={styles.titleLine1}>Te ofrecemos</span>
                        <br />
                        <span className={styles.titleLine2}>Soluciones</span>
                    </h2>
                </div>

                <div className={styles.grid}>
                    {soluciones.map((solucion, index) => (
                        <div key={index} className={styles.item}>
                            <img src={solucion.icon} alt={solucion.title} className={styles.icon} />
                            <h3 className={styles.itemTitle}>{solucion.title}</h3>
                            <p className={styles.itemDescription}>{solucion.description}</p>
                            <div className={styles.itemLine} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CopackingSoluciones;
