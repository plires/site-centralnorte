import LayoutPublic from '@/layouts/public/public-layout';
import { Link } from '@inertiajs/react';
import { FiArrowRight, FiCheck, FiMail, FiShoppingBag } from 'react-icons/fi';
import styles from './PresupuestoEnviado.module.css';

const PresupuestoEnviado = ({ budgetNumber }) => {
    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.content}>
                    <div className={styles.successCard}>
                        {/* Icon */}
                        <div className={styles.iconWrapper}>
                            <FiCheck className={styles.checkIcon} />
                        </div>

                        {/* Title */}
                        <h1 className={styles.title}>Solicitud enviada</h1>

                        {/* Budget Number */}
                        {budgetNumber && (
                            <div className={styles.budgetNumber}>
                                <span className={styles.budgetLabel}>N° de referencia:</span>
                                <span className={styles.budgetValue}>{budgetNumber}</span>
                            </div>
                        )}

                        {/* Message */}
                        <p className={styles.message}>
                            Tu solicitud de presupuesto fue recibida correctamente. Un vendedor la revisará y te enviará el presupuesto
                            personalizado a tu email.
                        </p>

                        {/* Info Cards */}
                        <div className={styles.infoCards}>
                            <div className={styles.infoCard}>
                                <FiMail className={styles.infoIcon} />
                                <div className={styles.infoText}>
                                    <strong>Revisá tu email</strong>
                                    <span>Recibirás el presupuesto en las próximas horas</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={styles.actions}>
                            <Link href="/products" className={styles.primaryButton}>
                                <FiShoppingBag />
                                Seguir viendo productos
                            </Link>
                            <Link href="/" className={styles.secondaryButton}>
                                Volver al inicio
                                <FiArrowRight />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

PresupuestoEnviado.layout = (page) => <LayoutPublic children={page} />;

export default PresupuestoEnviado;
