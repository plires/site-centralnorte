import styles from './BrandsSection.module.css';
import backgroundImage from '@/../images/home/background.webp';

const BrandsSection = () => {
    return (
        <section className={styles.brandsSection}>
            <div className={styles.backgroundPattern} style={{ backgroundImage: `url(${backgroundImage})` }}></div>
            <div className="container">
                <h2 className={styles.brandsText}>
                    <span className={styles.line1}>Marcas que</span>
                    <span className={styles.line2}>confían</span>
                </h2>
            </div>
        </section>
    );
};

export default BrandsSection;
