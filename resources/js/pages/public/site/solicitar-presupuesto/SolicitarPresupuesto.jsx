import { useQuoteCart } from '@/contexts/QuoteCartContext';
import LayoutPublic from '@/layouts/public/public-layout';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FiAlertCircle, FiArrowLeft, FiCheck, FiLoader, FiMail, FiMapPin, FiPhone, FiShoppingCart, FiUser } from 'react-icons/fi';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import styles from './SolicitarPresupuesto.module.css';

const SolicitarPresupuesto = () => {
    const { items, totalItems, clearCart } = useQuoteCart();
    const { errors, flash } = usePage().props;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        phone: '',
        address: '',
        comments: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [touched, setTouched] = useState({});

    // Cargar comentarios desde sessionStorage si existen
    useEffect(() => {
        const storedData = sessionStorage.getItem('quote_request');
        if (storedData) {
            try {
                const parsed = JSON.parse(storedData);
                if (parsed.comments) {
                    setFormData((prev) => ({ ...prev, comments: parsed.comments }));
                }
            } catch (e) {
                console.error('Error parsing quote request data:', e);
            }
        }
    }, []);

    // Redirigir si no hay items
    useEffect(() => {
        if (items.length === 0 && !isSubmitting) {
            router.visit('/carrito');
        }
    }, [items, isSubmitting]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const getFieldError = (field) => {
        if (errors[field]) return errors[field];

        if (!touched[field]) return null;

        if (field === 'name' && !formData.name.trim()) {
            return 'El nombre es obligatorio';
        }
        if (field === 'email') {
            if (!formData.email.trim()) return 'El email es obligatorio';
            if (!validateEmail(formData.email)) return 'Ingresá un email válido';
        }
        return null;
    };

    const isFormValid = () => {
        return formData.name.trim() !== '' && formData.email.trim() !== '' && validateEmail(formData.email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isFormValid() || items.length === 0) return;

        setIsSubmitting(true);

        // Preparar los datos
        const submitData = {
            ...formData,
            items: items.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                productSku: item.productSku,
                variantId: item.variantId,
                variantSku: item.variantSku,
                variantDescription: item.variantDescription,
                quantity: item.quantity,
            })),
        };

        router.post('/solicitar-presupuesto', submitData, {
            preserveScroll: true,
            onSuccess: () => {
                // Limpiar carrito después de envío exitoso
                clearCart();
                sessionStorage.removeItem('quote_request');
            },
            onError: () => {
                setIsSubmitting(false);
            },
            onFinish: () => {
                // Si hay errores, el estado se mantiene
                if (Object.keys(errors).length === 0) {
                    setIsSubmitting(false);
                }
            },
        });
    };

    const renderColorCircle = (item) => {
        if (!item.primaryColor) return null;

        return (
            <span
                className={styles.colorCircle}
                style={{
                    background: item.secondaryColor
                        ? `linear-gradient(90deg, ${item.primaryColor} 50%, ${item.secondaryColor} 50%)`
                        : item.primaryColor,
                }}
            />
        );
    };

    if (items.length === 0) {
        return null;
    }

    return (
        <section className={styles.section}>
            <div className="container">
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.visit('/carrito')} className={styles.backButton}>
                        <FiArrowLeft />
                        Volver al carrito
                    </button>
                    <h1 className={styles.title}>Completá tus datos</h1>
                    <p className={styles.subtitle}>Completá el formulario para recibir tu presupuesto personalizado.</p>
                </div>

                {/* Error global */}
                {flash?.error && (
                    <div className={styles.errorAlert}>
                        <FiAlertCircle />
                        <span>{flash.error}</span>
                    </div>
                )}

                <div className={styles.content}>
                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formSection}>
                            <h3 className={styles.formSectionTitle}>Información de contacto</h3>

                            {/* Nombre */}
                            <div className={styles.formGroup}>
                                <label htmlFor="name" className={styles.label}>
                                    Nombre <span className={styles.required}>*</span>
                                </label>
                                <div className={styles.inputWrapper}>
                                    <FiUser className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`${styles.input} ${getFieldError('name') ? styles.inputError : ''}`}
                                        placeholder="Tu nombre completo"
                                    />
                                </div>
                                {getFieldError('name') && <span className={styles.errorMessage}>{getFieldError('name')}</span>}
                            </div>

                            {/* Email */}
                            <div className={styles.formGroup}>
                                <label htmlFor="email" className={styles.label}>
                                    Email <span className={styles.required}>*</span>
                                </label>
                                <div className={styles.inputWrapper}>
                                    <FiMail className={styles.inputIcon} />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`${styles.input} ${getFieldError('email') ? styles.inputError : ''}`}
                                        placeholder="tu@email.com"
                                    />
                                </div>
                                {getFieldError('email') && <span className={styles.errorMessage}>{getFieldError('email')}</span>}
                            </div>

                            {/* Empresa */}
                            <div className={styles.formGroup}>
                                <label htmlFor="company" className={styles.label}>
                                    Empresa <span className={styles.optional}>(opcional)</span>
                                </label>
                                <div className={styles.inputWrapper}>
                                    <HiOutlineBuildingOffice2 className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        id="company"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="Nombre de tu empresa"
                                    />
                                </div>
                            </div>

                            {/* Teléfono */}
                            <div className={styles.formGroup}>
                                <label htmlFor="phone" className={styles.label}>
                                    Teléfono <span className={styles.optional}>(opcional)</span>
                                </label>
                                <div className={styles.inputWrapper}>
                                    <FiPhone className={styles.inputIcon} />
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="+54 11 1234-5678"
                                    />
                                </div>
                            </div>

                            {/* Dirección */}
                            <div className={styles.formGroup}>
                                <label htmlFor="address" className={styles.label}>
                                    Dirección <span className={styles.optional}>(opcional)</span>
                                </label>
                                <div className={styles.inputWrapper}>
                                    <FiMapPin className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="Calle y número, ciudad"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h3 className={styles.formSectionTitle}>Comentarios adicionales</h3>

                            {/* Comentarios */}
                            <div className={styles.formGroup}>
                                <label htmlFor="comments" className={styles.label}>
                                    Especificaciones o consultas <span className={styles.optional}>(opcional)</span>
                                </label>
                                <textarea
                                    id="comments"
                                    name="comments"
                                    value={formData.comments}
                                    onChange={handleChange}
                                    className={styles.textarea}
                                    placeholder="Contanos si necesitás personalización, cantidad específica, o cualquier detalle adicional..."
                                    rows={4}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className={styles.submitButton} disabled={isSubmitting || !isFormValid()}>
                            {isSubmitting ? (
                                <>
                                    <FiLoader className={styles.spinner} />
                                    Enviando solicitud...
                                </>
                            ) : (
                                <>
                                    <FiCheck />
                                    Solicitar presupuesto
                                </>
                            )}
                        </button>

                        <p className={styles.disclaimer}>
                            Al enviar este formulario, un vendedor recibirá tu solicitud y preparará un presupuesto personalizado. Te
                            contactaremos a la brevedad.
                        </p>
                    </form>

                    {/* Resumen del carrito */}
                    <div className={styles.summary}>
                        <div className={styles.summaryCard}>
                            <h3 className={styles.summaryTitle}>
                                <FiShoppingCart />
                                Resumen del pedido
                            </h3>

                            <div className={styles.summaryItems}>
                                {items.map((item) => (
                                    <div key={item.id} className={styles.summaryItem}>
                                        <div className={styles.summaryItemImage}>
                                            {item.image ? (
                                                <img src={item.image} alt={item.productName} />
                                            ) : (
                                                <div className={styles.imagePlaceholder}>
                                                    <FiShoppingCart />
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.summaryItemInfo}>
                                            <span className={styles.summaryItemName}>{item.productName}</span>
                                            <div className={styles.summaryItemVariant}>
                                                {renderColorCircle(item)}
                                                <span>{item.variantDescription}</span>
                                            </div>
                                        </div>
                                        <span className={styles.summaryItemQty}>x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.summaryDivider} />

                            <div className={styles.summaryTotal}>
                                <span>Total de productos:</span>
                                <span>{totalItems} unidades</span>
                            </div>
                            <div className={styles.summaryTotal}>
                                <span>Líneas de productos:</span>
                                <span>{items.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

SolicitarPresupuesto.layout = (page) => <LayoutPublic children={page} />;

export default SolicitarPresupuesto;
