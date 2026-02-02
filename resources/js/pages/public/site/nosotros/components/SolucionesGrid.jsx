import iconCentro from '@/../images/nosotros/icon-centro.svg';
import iconGlobal from '@/../images/nosotros/icon-global.svg';
import iconLogistica from '@/../images/nosotros/icon-logistica.svg';
import iconPicking from '@/../images/nosotros/icon-picking.svg';
import styles from './SolucionesGrid.module.css';

const soluciones = [
    {
        icon: iconCentro,
        title: 'Centro<br /> Promocional',
        description: 'Contamos con un equipo de ventas y diseño que te acompañarán durante todo el proceso de armado de kits y selección de merch.',
    },
    {
        icon: iconLogistica,
        title: 'Logística y<br />  Distribución',
        description: 'Contamos con vehículos propios para la distribución de medianas y grandes producciones.',
    },
    {
        icon: iconGlobal,
        title: 'Global<br />  Sourcing',
        description: 'Contamos con un equipo especializado para importar los productos que te imagines a medianas y grandes escalas.',
    },
    {
        icon: iconPicking,
        title: 'Picking y<br />  Ensamblado',
        description:
            'Contamos con un equipo de especialistas que podrán mostrarte como quedan tus logos antes de imprimirlos sobre cualquier producto.',
    },
];

const SolucionesGrid = () => {
    return (
        <section className={styles.section}>
            <div className="container-fluid">
                <div className="row">
                    {soluciones.map((solucion, index) => (
                        <div key={index} className="col-md-3 col-6">
                            <div className={styles.item}>
                                <img src={solucion.icon} alt={solucion.title} className={styles.icon} />
                                <h3 dangerouslySetInnerHTML={{ __html: solucion.title }} className={styles.title} />
                                <p className={styles.description}>{solucion.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SolucionesGrid;
