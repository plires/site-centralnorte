import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const QuoteCartContext = createContext(null);

const STORAGE_KEY = 'quote_cart';

export const QuoteCartProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Cargar carrito desde localStorage al iniciar
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setItems(parsed);
            } catch (e) {
                console.error('Error parsing cart from localStorage:', e);
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    // Guardar carrito en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    // Agregar item al carrito
    const addItem = useCallback(
        (product, variant, quantity, image) => {
            const variantId = variant?.id || null;

            setItems((prev) => {
                // Verificar si ya existe este producto + variante
                const existingIndex = prev.findIndex((item) => item.productId === product.id && item.variantId === variantId);

                if (existingIndex >= 0) {
                    // Actualizar cantidad del existente
                    const updated = [...prev];
                    const maxQty = variant?.stock > 0 ? variant.stock : 100;
                    const newQty = Math.min(updated[existingIndex].quantity + quantity, maxQty);
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        quantity: newQty,
                    };
                    return updated;
                }

                // Agregar nuevo item
                return [
                    ...prev,
                    {
                        id: `${product.id}-${variantId || 'no-variant'}-${Date.now()}`,
                        productId: product.id,
                        productName: product.name,
                        productSku: product.sku,
                        variantId: variantId,
                        variantSku: variant?.sku || null,
                        variantDescription: variant?.description || null,
                        variantStock: variant?.stock ?? 0,
                        primaryColor: variant?.primary_color || null,
                        secondaryColor: variant?.secondary_color || null,
                        quantity,
                        image: image || null,
                    },
                ];
            });

            // Abrir el drawer al agregar
            setIsDrawerOpen(true);
        },
        [],
    );

    // Actualizar cantidad de un item
    const updateQuantity = useCallback((itemId, quantity) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id === itemId) {
                    const maxQty = item.variantStock > 0 ? item.variantStock : 100;
                    return {
                        ...item,
                        quantity: Math.max(1, Math.min(quantity, maxQty)),
                    };
                }
                return item;
            }),
        );
    }, []);

    // Eliminar item del carrito
    const removeItem = useCallback((itemId) => {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
    }, []);

    // Limpiar carrito
    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    // Abrir/cerrar drawer
    const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
    const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
    const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

    // Cantidad total de items
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // Cantidad de líneas (productos únicos)
    const totalLines = items.length;

    const value = {
        items,
        totalItems,
        totalLines,
        isDrawerOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        openDrawer,
        closeDrawer,
        toggleDrawer,
    };

    return <QuoteCartContext.Provider value={value}>{children}</QuoteCartContext.Provider>;
};

export const useQuoteCart = () => {
    const context = useContext(QuoteCartContext);
    if (!context) {
        throw new Error('useQuoteCart must be used within a QuoteCartProvider');
    }
    return context;
};

export default QuoteCartContext;
