import { useQuoteCart } from '@/contexts/QuoteCartContext';
import LayoutPublic from '@/layouts/public/public-layout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { FiChevronLeft, FiMinus, FiPlus, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import styles from './Carrito.module.css';

const Carrito = () => {
    const { items, totalItems, updateQuantity, removeItem, clearCart } = useQuoteCart();
    const [comments, setComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getMaxQuantity = (item) => {
        return item.variantStock > 0 ? item.variantStock : 100;
    };

    const handleIncrement = (item) => {
        const maxQty = getMaxQuantity(item);
        if (item.quantity < maxQty) {
            updateQuantity(item.id, item.quantity + 1);
        }
    };

    const handleDecrement = (item) => {
        if (item.quantity > 1) {
            updateQuantity(item.id, item.quantity - 1);
        }
    };

    const handleQuantityChange = (item, value) => {
        const qty = parseInt(value, 10);
        if (!isNaN(qty) && qty >= 1) {
            const maxQty = getMaxQuantity(item);
            updateQuantity(item.id, Math.min(qty, maxQty));
        }
    };

    const handleSubmitQuote = () => {
        if (items.length === 0) return;

        setIsSubmitting(true);

        // Preparar datos para el formulario de solicitud
        const cartData = {
            items: items.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                productSku: item.productSku,
                variantId: item.variantId,
                variantSku: item.variantSku,
                variantDescription: item.variantDescription,
                quantity: item.quantity,
            })),
            comments,
        };

        // Guardar en sessionStorage para la página de checkout
        sessionStorage.setItem('quote_request', JSON.stringify(cartData));

        // Navegar a la página de solicitud
        router.visit('/solicitar-presupuesto');
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

    return (
        <section className={styles.section}>
            <div className="container">
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Tu carrito de presupuesto</h1>
                    {items.length > 0 && (
                        <p className={styles.subtitle}>
                            {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu carrito
                        </p>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FiShoppingCart className={styles.emptyIcon} />
                        <h2>Tu carrito está vacío</h2>
                        <p>Explorá nuestro catálogo y agregá productos para solicitar un presupuesto.</p>
                        <Link href="/products" className={styles.browseBtn}>
                            <FiChevronLeft />
                            Ver productos
                        </Link>
                    </div>
                ) : (
                    <div className={styles.content}>
                        {/* Cart Items */}
                        <div className={styles.cartItems}>
                            {/* Table Header - Desktop */}
                            <div className={styles.tableHeader}>
                                <span className={styles.colProduct}>Producto</span>
                                <span className={styles.colQuantity}>Cantidad</span>
                                <span className={styles.colActions}></span>
                            </div>

                            {/* Items */}
                            {items.map((item) => (
                                <div key={item.id} className={styles.cartItem}>
                                    {/* Product Info */}
                                    <div className={styles.productInfo}>
                                        <div className={styles.productImage}>
                                            {item.image ? (
                                                <img src={item.image} alt={item.productName} />
                                            ) : (
                                                <div className={styles.imagePlaceholder}>
                                                    <FiShoppingCart />
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.productDetails}>
                                            <Link href={`/products/${item.productId}`} className={styles.productName}>
                                                {item.productName}
                                            </Link>
                                            {item.productSku && <span className={styles.productSku}>SKU: {item.productSku}</span>}
                                            <div className={styles.variantInfo}>
                                                {renderColorCircle(item)}
                                                <span>{item.variantDescription}</span>
                                            </div>
                                            {item.variantStock <= 0 && <span className={styles.onDemand}>A pedido</span>}
                                        </div>
                                    </div>

                                    {/* Quantity */}
                                    <div className={styles.quantitySection}>
                                        <div className={styles.quantityWrapper}>
                                            <button
                                                className={styles.quantityBtn}
                                                onClick={() => handleDecrement(item)}
                                                disabled={item.quantity <= 1}
                                                aria-label="Reducir cantidad"
                                            >
                                                <FiMinus strokeWidth={1.5} />
                                            </button>
                                            <input
                                                type="number"
                                                className={styles.quantityInput}
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item, e.target.value)}
                                                min={1}
                                                max={getMaxQuantity(item)}
                                            />
                                            <button
                                                className={styles.quantityBtn}
                                                onClick={() => handleIncrement(item)}
                                                disabled={item.quantity >= getMaxQuantity(item)}
                                                aria-label="Aumentar cantidad"
                                            >
                                                <FiPlus strokeWidth={1.5} />
                                            </button>
                                        </div>
                                        <span className={styles.stockInfo}>
                                            {item.variantStock > 0 ? `${item.variantStock} disponibles` : 'Máx. 100 un.'}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className={styles.itemActions}>
                                        <button className={styles.removeBtn} onClick={() => removeItem(item.id)} aria-label="Eliminar producto">
                                            <FiTrash2 strokeWidth={1.5} />
                                            <span>Eliminar</span>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Clear Cart */}
                            <div className={styles.cartActions}>
                                <Link href="/products" className={styles.continueShopping}>
                                    <FiChevronLeft />
                                    Seguir viendo productos
                                </Link>
                                <button className={styles.clearCartBtn} onClick={clearCart}>
                                    <FiTrash2 />
                                    Vaciar carrito
                                </button>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className={styles.sidebar}>
                            <div className={styles.summaryCard}>
                                <h3 className={styles.summaryTitle}>Resumen del pedido</h3>

                                <div className={styles.summaryRow}>
                                    <span>Productos</span>
                                    <span>{items.length} líneas</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Cantidad total</span>
                                    <span>{totalItems} unidades</span>
                                </div>

                                <div className={styles.commentsSection}>
                                    <label className={styles.commentsLabel}>Comentarios adicionales (opcional)</label>
                                    <textarea
                                        className={styles.commentsTextarea}
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        placeholder="Agregá cualquier detalle o especificación para tu presupuesto..."
                                        rows={4}
                                    />
                                </div>

                                <button className={styles.submitBtn} onClick={handleSubmitQuote} disabled={isSubmitting}>
                                    {isSubmitting ? 'Procesando...' : 'Presupuestar ahora'}
                                </button>

                                <p className={styles.disclaimer}>
                                    Al solicitar el presupuesto, un vendedor se pondrá en contacto con vos a la brevedad.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

Carrito.layout = (page) => <LayoutPublic children={page} />;

export default Carrito;
