import { FaEnvelope, FaLocationDot, FaPhone } from 'react-icons/fa6';
import styles from './UbicacionSection.module.css';

/**
 * UbicacionSection — Mapa + datos de contacto/ubicación.
 *
 * @param {string} mapSrc - URL del embed de Google Maps
 *                          Ejemplo: "https://www.google.com/maps/embed?pb=..."
 *                          Podés obtenerla en Google Maps → Compartir → Incorporar mapa → copiar el src del iframe.
 */
const UbicacionSection = ({ mapSrc = '' }) => {
    return (
        <section className={styles.section}>
            {/* Mapa — ocupa el 100% del ancho */}
            <div className={styles.mapWrapper}>
                {mapSrc ? (
                    <iframe
                        src={mapSrc}
                        className={styles.map}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Ubicación Central Norte"
                    />
                ) : (
                    <div className={styles.mapPlaceholder}>
                        <FaLocationDot className={styles.mapPlaceholderIcon} />
                        <p className={styles.mapPlaceholderText}>Mapa no configurado — colocá el src del iframe de Google Maps en la prop mapSrc</p>
                    </div>
                )}
            </div>

            {/* Info — contenido dentro de container */}
            <div className={styles.infoSection}>
                <div className="container">
                    <div className="row align-items-center">
                        {/* Columna título */}
                        <div className="col-md-6 col-lg-3 col-12">
                            <h2 className={styles.title}>
                                <span className={styles.line1}>¿Dónde</span>
                                <span className={styles.line2}>Estamos?</span>
                            </h2>
                        </div>

                        {/* Columna datos de contacto */}
                        <div className={`col-md-6 col-lg-6 offset-lg-3 col-12 ${styles.contactBlock}`}>
                            <div className={styles.contactItem}>
                                <FaLocationDot className={styles.contactIcon} />
                                <address className={styles.address}>
                                    <a target="_blank" rel="noopener" className={styles.contactLink} href="https://maps.app.goo.gl/sYt4HC65tL78BCh4A">
                                        Carlos Villate 5698,
                                        <br />
                                        Munro.
                                        <br />
                                        Vicente López.
                                    </a>
                                </address>
                            </div>

                            <div className={styles.contactItem}>
                                <FaPhone className={styles.contactIcon} />
                                <a target="_blank" rel="noopener" href="tel:+5491178400401" className={styles.contactLink}>
                                    11 7840-0401
                                </a>
                            </div>

                            <div className={styles.contactItem}>
                                <FaEnvelope className={styles.contactIcon} />
                                <a target="_blank" rel="noopener" href="mailto:consultas@centralnortesrl.com" className={styles.contactLink}>
                                    consultas@centralnortesrl.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UbicacionSection;
