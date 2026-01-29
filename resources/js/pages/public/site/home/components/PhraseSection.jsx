import styles from './PhraseSection.module.css';

/**
 * PhraseSection - Componente de frase reutilizable
 *
 * @param {string} line1 - Primera línea del texto (blanco)
 * @param {string} line2 - Segunda línea del texto (color terciario)
 * @param {string} variant - Variante de color: 'secondary' (turquesa) | 'primary' (azul)
 * @param {string} backgroundImage - URL de imagen de fondo (opcional)
 */
const PhraseSection = ({ line1, line2, variant = 'secondary', backgroundImage = null }) => {
    const sectionClass = `${styles.section} ${styles[variant]}`;

    return (
        <section className={sectionClass}>
            {backgroundImage && <div className={styles.backgroundPattern} style={{ backgroundImage: `url(${backgroundImage})` }}></div>}
            <div className="container">
                <h2 className={styles.phraseText}>
                    <span className={styles.line1}>{line1}</span>
                    <span className={styles.line2}>{line2}</span>
                </h2>
            </div>
        </section>
    );
};

export default PhraseSection;
