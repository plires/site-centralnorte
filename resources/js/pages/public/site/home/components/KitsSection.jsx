import { Button } from '@/pages/public/site/components';
import kitDeportivoImg from '@/../images/home/kit-deportivo.webp';
import kitEventoImg from '@/../images/home/kit-evento.webp';
import kitOnboardingImg from '@/../images/home/kit-onboarding.webp';
import styles from './KitsSection.module.css';

const kits = [
    {
        title: 'Kit Deportivo',
        image: kitDeportivoImg,
        link: '#',
    },
    {
        title: 'Kit Evento',
        image: kitEventoImg,
        link: '#',
    },
    {
        title: 'Kit Onboarding',
        image: kitOnboardingImg,
        link: '#',
    },
];

const KitsSection = () => {
    return (
        <section className={styles.section}>
            <div className="container">
                <div className="row">
                    {kits.map((kit, index) => (
                        <div key={index} className="col-12 col-md-4">
                            <div className={styles.kitCard}>
                                <h3 className={styles.kitTitle}>{kit.title}</h3>
                                <div className={styles.imageWrapper}>
                                    <img src={kit.image} alt={kit.title} className={styles.kitImage} />
                                </div>
                                <Button href={kit.link} variant="outline-primary" size="md">
                                    Consultar
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default KitsSection;
