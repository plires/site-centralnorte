import { useState } from 'react';
import { FiChevronDown, FiShoppingCart } from 'react-icons/fi';
import styles from './VariantSelector.module.css';

const VariantSelector = ({ variants, images, onVariantSelect }) => {
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const hasVariants = variants && variants.length > 0;

    /**
     * Busca una imagen que coincida con la variante
     * Compara los segmentos del campo variant de la imagen con los textos de la variante
     */
    const findMatchingImage = (variant) => {
        if (!images || images.length === 0) return null;

        const variantTexts = [variant.primary_color_text, variant.secondary_color_text, variant.material_text, variant.color].filter(
            (text) => text && text.trim() && !isOnlyDots(text),
        );

        if (variantTexts.length === 0) return null;

        let bestMatch = null;
        let bestScore = 0;

        for (const img of images) {
            if (!img.variant) continue;

            // Separar el variant de la imagen en segmentos y limpiar espacios
            const imageSegments = img.variant
                .split('/')
                .map((s) => s.trim())
                .filter((s) => s && !isOnlyDots(s));

            let score = 0;

            // Verificar coincidencias
            for (const text of variantTexts) {
                if (imageSegments.some((seg) => seg.toLowerCase() === text.toLowerCase())) {
                    score++;
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = img;
            }
        }

        return bestScore > 0 ? bestMatch : null;
    };

    /**
     * Verifica si un texto contiene solo puntos
     */
    const isOnlyDots = (text) => {
        if (!text) return true;
        const withoutDots = text.replace(/\./g, '').trim();
        return withoutDots.length === 0;
    };

    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
        setIsDropdownOpen(false);
        setQuantity(1);

        // Buscar imagen que coincida y notificar al padre
        const matchingImage = findMatchingImage(variant);
        if (onVariantSelect) {
            onVariantSelect(variant, matchingImage);
        }
    };

    const getMaxQuantity = (variant) => {
        if (!variant) return 1;
        return variant.stock > 0 ? variant.stock : 100;
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value, 10);
        const maxQty = getMaxQuantity(selectedVariant);
        if (isNaN(value) || value < 1) {
            setQuantity(1);
        } else if (value > maxQty) {
            setQuantity(maxQty);
        } else {
            setQuantity(value);
        }
    };

    const incrementQuantity = () => {
        const maxQty = getMaxQuantity(selectedVariant);
        if (quantity < maxQty) {
            setQuantity((prev) => prev + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };

    const handleAddToQuote = () => {
        // TODO: Implementar funcionalidad de agregar al presupuesto
        console.log('Agregar al presupuesto:', {
            variant: selectedVariant,
            quantity,
        });
    };

    const renderColorCircle = (variant) => {
        if (!variant.primary_color) return null;

        return (
            <span
                className={styles.colorCircle}
                style={{
                    background: variant.secondary_color
                        ? `linear-gradient(135deg, ${variant.primary_color} 50%, ${variant.secondary_color} 50%)`
                        : variant.primary_color,
                }}
            />
        );
    };

    const renderStockBadge = (variant) => {
        if (variant.stock > 0) {
            return <span className={styles.stockBadge}>{variant.stock} un.</span>;
        }
        return <span className={`${styles.stockBadge} ${styles.noStock}`}>A pedido</span>;
    };

    if (!hasVariants) {
        return (
            <div className={styles.noVariants}>
                <p>Este producto no tiene variantes disponibles.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Variant Dropdown */}
            <div className={styles.dropdownContainer}>
                <label className={styles.label}>Elegir variante</label>
                <button
                    className={`${styles.dropdownTrigger} ${isDropdownOpen ? styles.open : ''}`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    type="button"
                >
                    {selectedVariant ? (
                        <span className={styles.selectedValue}>
                            {renderColorCircle(selectedVariant)}
                            <span className={styles.variantText}>{selectedVariant.description}</span>
                            {renderStockBadge(selectedVariant)}
                        </span>
                    ) : (
                        <span className={styles.placeholder}>Seleccionar una opción</span>
                    )}
                    <FiChevronDown className={`${styles.chevron} ${isDropdownOpen ? styles.rotated : ''}`} strokeWidth={1.5} />
                </button>

                {isDropdownOpen && (
                    <div className={styles.dropdownMenu}>
                        {variants.map((variant) => (
                            <button
                                key={variant.id}
                                className={`${styles.dropdownItem} ${variant.stock <= 0 ? styles.lowStock : ''} ${selectedVariant?.id === variant.id ? styles.selected : ''}`}
                                onClick={() => handleVariantSelect(variant)}
                                type="button"
                            >
                                {renderColorCircle(variant)}
                                <span className={styles.variantText}>{variant.description}</span>
                                {renderStockBadge(variant)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Quantity Selector */}
            <div className={`${styles.quantityContainer} ${!selectedVariant ? styles.disabled : ''}`}>
                <label className={styles.label}>Cantidad</label>
                <div className={styles.quantityWrapper}>
                    <button
                        className={styles.quantityButton}
                        onClick={decrementQuantity}
                        disabled={!selectedVariant || quantity <= 1}
                        type="button"
                        aria-label="Reducir cantidad"
                    >
                        −
                    </button>
                    <input
                        type="number"
                        className={styles.quantityInput}
                        value={quantity}
                        onChange={handleQuantityChange}
                        disabled={!selectedVariant}
                        min={1}
                        max={getMaxQuantity(selectedVariant)}
                    />
                    <button
                        className={styles.quantityButton}
                        onClick={incrementQuantity}
                        disabled={!selectedVariant || quantity >= getMaxQuantity(selectedVariant)}
                        type="button"
                        aria-label="Aumentar cantidad"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Add to Quote Button */}
            <button className={styles.addButton} onClick={handleAddToQuote} disabled={!selectedVariant} type="button">
                <FiShoppingCart strokeWidth={1.5} />
                <span>Sumar al presupuesto</span>
            </button>

            {/* Stock Info */}
            {selectedVariant && (
                <p className={`${styles.stockInfo} ${selectedVariant.stock <= 0 ? styles.stockInfoWarning : ''}`}>
                    <span className={styles.stockDot} />
                    {selectedVariant.stock > 0 ? `${selectedVariant.stock} unidades disponibles` : 'Disponible a pedido'}
                </p>
            )}
        </div>
    );
};

export default VariantSelector;
