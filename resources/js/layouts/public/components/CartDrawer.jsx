import { useQuoteCart } from '@/contexts/QuoteCartContext';
import { Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { FiMinus, FiPlus, FiShoppingCart, FiTrash2, FiX } from 'react-icons/fi';
import styles from './CartDrawer.module.css';

const CartDrawer = () => {
    const { items, totalItems, isDrawerOpen, closeDrawer, updateQuantity, removeItem } = useQuoteCart();

    // Bloquear scroll del body cuando el drawer está abierto
    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isDrawerOpen]);

    // Cerrar con Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isDrawerOpen) {
                closeDrawer();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isDrawerOpen, closeDrawer]);

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
        <>
            {/* Overlay */}
            <div className={`${styles.overlay} ${isDrawerOpen ? styles.overlayVisible : ''}`} onClick={closeDrawer} />

            {/* Drawer */}
            <div className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : ''}`}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <FiShoppingCart className={styles.headerIcon} />
                        <span>Tu pedido</span>
                        {totalItems > 0 && <span className={styles.itemCount}>({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>}
                    </div>
                    <button className={styles.closeButton} onClick={closeDrawer} aria-label="Cerrar carrito">
                        <FiX strokeWidth={1.5} />
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {items.length === 0 ? (
                        <div className={styles.emptyState}>
                            <FiShoppingCart className={styles.emptyIcon} />
                            <p>Tu carrito está vacío</p>
                            <span>Agregá productos para solicitar un presupuesto</span>
                        </div>
                    ) : (
                        <div className={styles.itemsList}>
                            {items.map((item) => (
                                <div key={item.id} className={styles.cartItem}>
                                    {/* Image */}
                                    <div className={styles.itemImage}>
                                        {item.image ? (
                                            <img src={item.image} alt={item.productName} />
                                        ) : (
                                            <div className={styles.imagePlaceholder}>
                                                <FiShoppingCart />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className={styles.itemInfo}>
                                        <Link href={`/products/${item.productId}`} className={styles.itemName} onClick={closeDrawer}>
                                            {item.productName}
                                        </Link>
                                        <div className={styles.itemVariant}>
                                            {renderColorCircle(item)}
                                            <span>{item.variantDescription}</span>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className={styles.itemControls}>
                                            <div className={styles.quantityWrapper}>
                                                <button
                                                    className={styles.quantityBtn}
                                                    onClick={() => handleDecrement(item)}
                                                    disabled={item.quantity <= 1}
                                                    aria-label="Reducir cantidad"
                                                >
                                                    <FiMinus strokeWidth={1.5} />
                                                </button>
                                                <span className={styles.quantityValue}>{item.quantity}</span>
                                                <button
                                                    className={styles.quantityBtn}
                                                    onClick={() => handleIncrement(item)}
                                                    disabled={item.quantity >= getMaxQuantity(item)}
                                                    aria-label="Aumentar cantidad"
                                                >
                                                    <FiPlus strokeWidth={1.5} />
                                                </button>
                                            </div>
                                            <button className={styles.removeBtn} onClick={() => removeItem(item.id)} aria-label="Eliminar producto">
                                                <FiTrash2 strokeWidth={1.5} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className={styles.footer}>
                        <div className={styles.footerInfo}>
                            <span className={styles.footerLabel}>Total de productos:</span>
                            <span className={styles.footerValue}>{totalItems} unidades</span>
                        </div>
                        <div className={styles.footerButtons}>
                            <Link href="/carrito" className={styles.viewCartBtn} onClick={closeDrawer}>
                                Ver carrito
                            </Link>
                            <Link href="/solicitar-presupuesto" className={styles.quoteBtn} onClick={closeDrawer}>
                                Presupuestar
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
