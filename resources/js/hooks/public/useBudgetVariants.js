// resources/js/hooks/useBudgetVariants.js

import { useEffect, useState } from 'react';

/**
 * Hook para manejar la selección de variantes del presupuesto
 * @param {Object} budget - Objeto del presupuesto
 * @returns {Object} - Estado y funciones para manejo de variantes
 */
export const useBudgetVariants = (budget) => {
    const [selectedVariants, setSelectedVariants] = useState({});

    // Inicializar variantes seleccionadas basado en is_selected de la base de datos
    useEffect(() => {
        const initialVariants = {};

        Object.entries(budget.grouped_items?.variants || {}).forEach(([group, items]) => {
            if (items.length > 0) {
                // Buscar el item que tiene is_selected = true
                const selectedItem = items.find((item) => item.is_selected === true);
                if (selectedItem) {
                    initialVariants[group] = selectedItem.id;
                    console.log(`Public Budget: Grupo ${group} - item seleccionado desde BD: ${selectedItem.id}`);
                } else {
                    // Fallback: si ninguno está marcado, seleccionar el primero
                    initialVariants[group] = items[0].id;
                    console.log(`Public Budget: Grupo ${group} - usando fallback: ${items[0].id}`);
                }
            }
        });

        setSelectedVariants(initialVariants);
    }, [budget]);

    /**
     * Maneja la selección de una variante
     * @param {string} group - Grupo de la variante
     * @param {number} itemId - ID del item seleccionado
     */
    const handleVariantSelection = (group, itemId) => {
        setSelectedVariants((prev) => ({
            ...prev,
            [group]: itemId,
        }));
    };

    return {
        selectedVariants,
        handleVariantSelection,
    };
};
