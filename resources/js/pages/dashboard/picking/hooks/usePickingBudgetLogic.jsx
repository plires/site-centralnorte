// resources/js/pages/dashboard/picking/hooks/usePickingBudgetLogic.jsx

import { useEffect, useState } from 'react';

/**
 * Hook personalizado para manejar la lógica de cálculos de presupuestos de picking
 * Similar a useBudgetLogic pero adaptado para picking
 * 
 * @param {Object} data - Datos del formulario de Inertia
 * @param {Object} businessConfig - Configuración del negocio (IVA, etc.)
 * @param {Array} costScales - Escalas de costos disponibles
 * @param {Array} componentIncrements - Incrementos por componentes
 * @param {string|null} paymentConditionId - ID de la condición de pago seleccionada
 * @param {Array} paymentConditions - Lista de condiciones de pago disponibles
 */
export function usePickingBudgetLogic(
    data,
    businessConfig,
    costScales,
    componentIncrements,
    paymentConditionId = null,
    paymentConditions = []
) {
    const [currentScale, setCurrentScale] = useState(null);
    const [currentIncrement, setCurrentIncrement] = useState(null);
    const [selectedPaymentCondition, setSelectedPaymentCondition] = useState(null);
    const [totals, setTotals] = useState({
        servicesSubtotal: 0,
        incrementAmount: 0,
        subtotalWithIncrement: 0,
        boxTotal: 0,
        subtotal: 0,
        paymentConditionAmount: 0,
        subtotalWithPayment: 0,
        iva: 0,
        total: 0,
        unitPricePerKit: 0,
    });

    // Buscar escala según total_kits
    useEffect(() => {
        if (data.total_kits && costScales) {
            const kits = parseInt(data.total_kits);
            const scale = costScales.find((s) => s.quantity_from <= kits && (s.quantity_to === null || s.quantity_to >= kits));
            setCurrentScale(scale || null);
        } else {
            setCurrentScale(null);
        }
    }, [data.total_kits, costScales]);

    // Buscar incremento según total_components_per_kit
    useEffect(() => {
        if (data.total_components_per_kit && componentIncrements) {
            const components = parseInt(data.total_components_per_kit);
            const increment = componentIncrements.find(
                (inc) => inc.components_from <= components && (inc.components_to === null || inc.components_to >= components)
            );
            setCurrentIncrement(increment || null);
        } else {
            setCurrentIncrement(null);
        }
    }, [data.total_components_per_kit, componentIncrements]);

    // Buscar payment condition seleccionada
    useEffect(() => {
        if (paymentConditionId && paymentConditions.length > 0) {
            const condition = paymentConditions.find((c) => c.id === parseInt(paymentConditionId));
            setSelectedPaymentCondition(condition || null);
        } else {
            setSelectedPaymentCondition(null);
        }
    }, [paymentConditionId, paymentConditions]);

    // Calcular totales
    useEffect(() => {
        calculateTotals();
    }, [data.services, data.boxes, data.total_kits, currentIncrement, selectedPaymentCondition, businessConfig]);

    const calculateTotals = () => {
        // 1. Calcular subtotal de servicios
        const servicesSubtotal = data.services.reduce((sum, service) => {
            const unitCost = parseFloat(service.unit_cost) || 0;
            const quantity = parseInt(service.quantity) || 0;
            return sum + unitCost * quantity;
        }, 0);

        // 2. Calcular incremento por componentes
        const incrementPercentage = currentIncrement ? parseFloat(currentIncrement.percentage) : 0;
        const incrementAmount = servicesSubtotal * incrementPercentage;
        const subtotalWithIncrement = servicesSubtotal + incrementAmount;

        // 3. Calcular total de cajas
        const boxTotal = data.boxes.reduce((sum, box) => {
            const unitCost = parseFloat(box.box_unit_cost) || 0;
            const quantity = parseInt(box.quantity) || 0;
            return sum + unitCost * quantity;
        }, 0);

        // 4. Subtotal base (servicios con incremento + cajas)
        const subtotal = subtotalWithIncrement + boxTotal;

        // 5. Calcular ajuste por condición de pago
        let paymentConditionAmount = 0;
        if (selectedPaymentCondition) {
            paymentConditionAmount = subtotal * (parseFloat(selectedPaymentCondition.percentage) / 100);
        }

        const subtotalWithPayment = subtotal + paymentConditionAmount;

        // 6. Aplicar IVA
        const ivaRate = businessConfig?.iva_rate ?? 0.21;
        const applyIva = businessConfig?.apply_iva ?? true;
        const ivaAmount = applyIva ? subtotalWithPayment * ivaRate : 0;

        // 7. Total final
        const total = subtotalWithPayment + ivaAmount;

        // 8. Precio unitario por kit
        const unitPricePerKit = data.total_kits > 0 ? total / parseInt(data.total_kits) : 0;

        setTotals({
            servicesSubtotal,
            incrementAmount,
            subtotalWithIncrement,
            boxTotal,
            subtotal,
            paymentConditionAmount,
            subtotalWithPayment,
            iva: ivaAmount,
            total,
            unitPricePerKit,
        });
    };

    return {
        totals,
        currentScale,
        currentIncrement,
        selectedPaymentCondition,
        calculateTotals,
    };
}
