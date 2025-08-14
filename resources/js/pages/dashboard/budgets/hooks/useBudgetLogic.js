import { useEffect, useState } from 'react';

export function useBudgetLogic(items) {
    const [totals, setTotals] = useState({
        subtotal: 0,
        iva: 0,
        total: 0,
    });

    const [selectedVariants, setSelectedVariants] = useState({});

    const calculateTotals = (currentSelectedVariants = selectedVariants) => {
        let subtotal = 0;

        items.forEach((item) => {
            if (item.variant_group) {
                const selectedItemId = currentSelectedVariants[item.variant_group];
                const itemIdStr = String(item.id);
                const selectedIdStr = String(selectedItemId);

                if (itemIdStr === selectedIdStr) {
                    const itemTotal = item.quantity * item.unit_price;
                    subtotal += itemTotal;
                }
            } else {
                const itemTotal = item.quantity * item.unit_price;
                subtotal += itemTotal;
            }
        });

        const iva = subtotal * 0.21;
        const total = subtotal + iva;

        setTotals({ subtotal, iva, total });
    };

    const handleVariantChange = (group, itemId) => {
        const newSelectedVariants = {
            ...selectedVariants,
            [group]: itemId,
        };

        setSelectedVariants(newSelectedVariants);
        setTimeout(() => calculateTotals(newSelectedVariants), 0);
    };

    // Configurar variantes seleccionadas (primera de cada grupo)
    useEffect(() => {
        const initialVariants = {};
        const variantGroups = {};

        items.forEach((item) => {
            if (item.variant_group) {
                if (!variantGroups[item.variant_group]) {
                    variantGroups[item.variant_group] = [];
                }
                variantGroups[item.variant_group].push(item);
            }
        });

        Object.keys(variantGroups).forEach((group) => {
            if (!selectedVariants[group]) {
                initialVariants[group] = variantGroups[group][0]?.id;
            }
        });

        if (Object.keys(initialVariants).length > 0) {
            setSelectedVariants((prev) => {
                const newState = {
                    ...prev,
                    ...initialVariants,
                };
                setTimeout(() => calculateTotals(newState), 0);
                return newState;
            });
        } else {
            setTimeout(() => calculateTotals(), 0);
        }
    }, [items]);

    useEffect(() => {
        setTimeout(() => calculateTotals(), 0);
    }, [items, selectedVariants]);

    return {
        totals,
        selectedVariants,
        handleVariantChange,
        calculateTotals,
    };
}
