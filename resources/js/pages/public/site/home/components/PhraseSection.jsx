import styles from './PhraseSection.module.css';

/**
 * PhraseSection - Componente de frase reutilizable
 *
 * @param {string} line1 - Primera línea del texto
 * @param {string} line2 - Segunda línea del texto
 * @param {string} variant - Variante de color: 'secondary' (turquesa) | 'primary' (azul) | 'white' (blanco)
 * @param {string} backgroundImage - URL de imagen de fondo (opcional)
 * @param {string} hashtags - Texto de hashtags debajo del título (opcional)
 */
const PhraseSection = ({ line1, line2, variant = 'secondary', backgroundImage = null, hashtags = null }) => {
    const sectionClass = `${styles.section} ${styles[variant]}`;

    return (
        <section className={sectionClass}>
            {backgroundImage && (
                <div
                    className={styles.backgroundPattern}
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        mixBlendMode: 'multiply',
                    }}
                ></div>
            )}
            <div className="container">
                <h2 className={styles.phraseText}>
                    <span className={styles.line1}>{line1}</span>
                    <span className={styles.line2}>{line2}</span>
                </h2>
                {hashtags && <p className={styles.hashtags}>{hashtags}</p>}
            </div>
        </section>
    );
};

export default PhraseSection;
