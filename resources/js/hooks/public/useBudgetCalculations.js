// resources/js/hooks/useBudgetCalculations.js

import { useEffect, useState } from 'react';

/**
 * Hook para manejar los cálculos del presupuesto
 * @param {Object} budget - Objeto del presupuesto
 * @param {Object} selectedVariants - Variantes seleccionadas
 * @param {Object} businessConfig - Configuración de negocio (IVA)
 * @returns {Object} - Estado de totales calculados
 */
export const useBudgetCalculations = (budget, selectedVariants, businessConfig) => {
    const [calculatedTotals, setCalculatedTotals] = useState({
        subtotal: parseFloat(budget.subtotal),
        iva: 0,
        total: parseFloat(budget.total),
    });

    // Obtener configuración de IVA
    const ivaRate = businessConfig?.iva_rate ?? 0.21;
    const applyIva = businessConfig?.apply_iva ?? true;

    // Recalcular totales cuando cambian las variantes
    useEffect(() => {
        let newSubtotal = 0;

        // Sumar items regulares
        budget.grouped_items?.regular?.forEach((item) => {
            newSubtotal += parseFloat(item.line_total);
        });

        // Sumar variantes seleccionadas
        Object.entries(budget.grouped_items?.variants || {}).forEach(([group, items]) => {
            const selectedItemId = selectedVariants[group];
            const selectedItem = items.find((item) => item.id === selectedItemId);
            if (selectedItem) {
                newSubtotal += parseFloat(selectedItem.line_total);
            }
        });

        // Calcular ajuste por condición de pago
        let paymentConditionAmount = 0;
        if (budget.payment_condition?.percentage) {
            paymentConditionAmount = newSubtotal * (parseFloat(budget.payment_condition.percentage) / 100);
        }

        // Aplicar ajuste al subtotal antes del IVA
        const subtotalWithPayment = newSubtotal + paymentConditionAmount;

        // Calcular IVA
        const ivaAmount = applyIva ? subtotalWithPayment * ivaRate : 0;
        const totalWithIva = subtotalWithPayment + ivaAmount;

        // // Calcular IVA y total
        // const ivaAmount = applyIva ? newSubtotal * ivaRate : 0;
        // const totalWithIva = newSubtotal + ivaAmount;

        setCalculatedTotals({
            subtotal: newSubtotal,
            paymentConditionAmount,
            subtotalWithPayment,
            iva: ivaAmount,
            total: totalWithIva,
        });
    }, [selectedVariants, budget.grouped_items, ivaRate, applyIva]);

    return {
        calculatedTotals,
        ivaRate,
        applyIva,
    };
};
