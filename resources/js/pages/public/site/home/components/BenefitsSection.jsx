import iconLealtad from '@/../images/home/icon-lealtad.svg';
import iconPosicionamiento from '@/../images/home/icon-posicionamiento.svg';
import iconPublicidad from '@/../images/home/icon-publicidad.svg';
import iconVisibilidad from '@/../images/home/icon-visibilidad.svg';
import styles from './BenefitsSection.module.css';

const benefits = [
    {
        icon: iconVisibilidad,
        title: 'Visibilidad',
        subtitle: 'de marca.',
    },
    {
        icon: iconPublicidad,
        title: 'Publicidad',
        subtitle: 'duradera.',
    },
    {
        icon: iconLealtad,
        title: 'Lealtad',
        subtitle: 'con tu cliente.',
    },
    {
        icon: iconPosicionamiento,
        title: 'Posicionamiento',
        subtitle: 'y diferenciación.',
    },
];

const BenefitsSection = () => {
    return (
        <section className={styles.section}>
            <div className="container">
                <div className="row">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="col-md-3 col-6">
                            <div className={styles.benefitCard}>
                                <div className={styles.iconWrapper}>
                                    <img src={benefit.icon} alt={benefit.title} className={styles.icon} />
                                </div>
                                <p className={styles.title}>{benefit.title}</p>
                                <p className={styles.subtitle}>{benefit.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BenefitsSection;
