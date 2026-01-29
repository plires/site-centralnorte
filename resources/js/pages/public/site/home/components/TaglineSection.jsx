import styles from './TaglineSection.module.css';

const TaglineSection = () => {
    return (
        <section className={styles.taglineSection}>
            <div className="container">
                <h2 className={styles.taglineText}>
                    <span className={styles.line1}>Te ofrecemos</span>
                    <span className={styles.line2}>soluciones</span>
                </h2>
            </div>
        </section>
    );
};

export default TaglineSection;
