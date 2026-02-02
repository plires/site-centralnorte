// import brandLogos from '../data/brandLogos';
import styles from './LogoCarousel.module.css';

const LogoCarousel = ({ background, brandLogos }) => {
    // Duplicamos los logos para crear el efecto de loop infinito
    const duplicatedLogos = [...brandLogos, ...brandLogos];

    return (
        <section className={styles.carouselSection} style={{ backgroundColor: background }}>
            <div className={styles.carouselTrack}>
                {duplicatedLogos.map((logo, index) => (
                    <div key={index} className={styles.carouselSlide}>
                        <img src={logo.url} alt={logo.alt || `Logo ${(index % brandLogos.length) + 1}`} className={styles.carouselImage} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default LogoCarousel;
