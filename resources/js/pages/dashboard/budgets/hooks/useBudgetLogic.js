// resources/js/pages/dashboard/budgets/hooks/useBudgetLogic.js

import { useEffect, useRef, useState } from 'react';

export function useBudgetLogic(items = [], businessConfig = null) {
    const [totals, setTotals] = useState({
        subtotal: 0,
        iva: 0,
        total: 0,
    });

    const [selectedVariants, setSelectedVariants] = useState({});
    const isInitialized = useRef(false);
    const lastVariantGroups = useRef({});

    // Obtener configuración de IVA
    const ivaRate = businessConfig?.iva_rate ?? 0.21;
    const applyIva = businessConfig?.apply_iva ?? true;

    // Organizar items por tipo
    const organizeItems = (items) => {
        const regular = items.filter((item) => !item.variant_group);
        const variantGroups = {};

        items
            .filter((item) => item.variant_group)
            .forEach((item) => {
                if (!variantGroups[item.variant_group]) {
                    variantGroups[item.variant_group] = [];
                }
                variantGroups[item.variant_group].push(item);
            });

        // Debug: mostrar cómo se organizaron los items
        console.log('Items organizados:', {
            regular: regular.length,
            variantGroups: Object.keys(variantGroups).map((group) => ({
                group,
                count: variantGroups[group].length,
                items: variantGroups[group].map((item) => ({ id: item.id, is_selected: item.is_selected })),
            })),
        });

        return { regular, variantGroups };
    };

    const { regular: regularItems, variantGroups } = organizeItems(items);

    // Función para verificar si los grupos de variantes han cambiado realmente
    const hasVariantGroupsChanged = () => {
        const currentGroups = Object.keys(variantGroups);
        const lastGroups = Object.keys(lastVariantGroups.current);

        if (currentGroups.length !== lastGroups.length) return true;

        return currentGroups.some((group) => !lastGroups.includes(group) || variantGroups[group].length !== lastVariantGroups.current[group]?.length);
    };

    // Inicializar o actualizar variantes seleccionadas solo cuando sea necesario
    useEffect(() => {
        const shouldInitialize = !isInitialized.current || hasVariantGroupsChanged();

        if (shouldInitialize) {
            if (Object.keys(variantGroups).length > 0) {
                const newSelectedVariants = { ...selectedVariants };

                Object.keys(variantGroups).forEach((group) => {
                    const groupItems = variantGroups[group];

                    // FIX: Mejorar la lógica de selección inicial
                    let selectedItem = groupItems.find((item) => item.is_selected === true);

                    // Si no hay ninguna marcada como seleccionada, seleccionar la primera
                    if (!selectedItem && groupItems.length > 0) {
                        selectedItem = groupItems[0];
                        console.log(`FIX: Grupo ${group} - No hay item seleccionado, usando el primero: ${selectedItem?.id}`);
                    } else if (selectedItem) {
                        console.log(`Grupo ${group} - Item previamente seleccionado: ${selectedItem.id}`);
                    }

                    // Solo actualizar si es un grupo nuevo o si la selección actual no existe en el grupo
                    const currentSelectedId = selectedVariants[group];
                    const currentSelectedExists = groupItems.some((item) => item.id === currentSelectedId);

                    if (!currentSelectedExists || !newSelectedVariants[group]) {
                        if (selectedItem) {
                            newSelectedVariants[group] = selectedItem.id;
                            console.log(`FIX: Actualizando selección para grupo ${group}: ${selectedItem.id}`);
                        }
                    }
                });

                // Remover grupos que ya no existen
                Object.keys(newSelectedVariants).forEach((group) => {
                    if (!variantGroups[group]) {
                        delete newSelectedVariants[group];
                        console.log(`FIX: Removiendo grupo inexistente: ${group}`);
                    }
                });

                // Solo actualizar si hay cambios reales
                const hasRealChanges =
                    Object.keys(newSelectedVariants).some((group) => newSelectedVariants[group] !== selectedVariants[group]) ||
                    Object.keys(variantGroups).length !== Object.keys(selectedVariants).length;

                if (hasRealChanges || !isInitialized.current) {
                    console.log('FIX: Actualizando selectedVariants:', newSelectedVariants);
                    setSelectedVariants(newSelectedVariants);

                    // Forzar recálculo de totales después de inicializar
                    setTimeout(() => {
                        calculateTotals();
                    }, 0);
                }

                // Actualizar referencias
                lastVariantGroups.current = { ...variantGroups };
            } else {
                // Si no hay grupos de variantes, limpiar selectedVariants
                if (Object.keys(selectedVariants).length > 0) {
                    console.log('FIX: Limpiando selectedVariants porque no hay grupos');
                    setSelectedVariants({});
                }
            }

            // Marcar como inicializado
            isInitialized.current = true;
        }
    }, [items]); // Solo depender de items

    // Función para cambiar variante seleccionada
    const handleVariantChange = (group, itemId) => {
        console.log(`Cambiando variante en grupo ${group} a item ${itemId}`);
        setSelectedVariants((prev) => ({
            ...prev,
            [group]: itemId,
        }));
    };

    // Calcular totales - con logs mínimos para debug
    const calculateTotals = () => {
        let subtotal = 0;

        // Sumar items regulares
        regularItems.forEach((item) => {
            subtotal += parseFloat(item.line_total || 0);
        });

        console.log(`Subtotal items regulares: ${subtotal}`);

        // Sumar variantes seleccionadas
        Object.keys(variantGroups).forEach((group) => {
            const selectedItemId = selectedVariants[group];
            const selectedItem = variantGroups[group].find((item) => item.id === selectedItemId);
            if (selectedItem) {
                console.log(`Grupo ${group}: sumando ${selectedItem.line_total}`);
                subtotal += parseFloat(selectedItem.line_total || 0);
            } else {
                console.log(`Grupo ${group}: NO encontrado item ${selectedItemId}`);
            }
        });

        const ivaAmount = applyIva ? subtotal * ivaRate : 0;
        const total = subtotal + ivaAmount;

        console.log(`Totales finales: subtotal=${subtotal}, total=${total}`);

        setTotals({
            subtotal,
            iva: ivaAmount,
            total,
        });

        return { subtotal, iva: ivaAmount, total };
    };

    // Recalcular totales cuando cambien las selecciones - pero no disparar constantemente
    useEffect(() => {
        if (isInitialized.current) {
            console.log('Recalculando totales por cambio en selectedVariants:', selectedVariants);
            const timeoutId = setTimeout(() => {
                calculateTotals();
            }, 10); // Pequeño delay para asegurar que el state esté actualizado

            return () => clearTimeout(timeoutId);
        }
    }, [selectedVariants]);

    // Recalcular cuando cambien los items pero evitar bucles
    useEffect(() => {
        if (isInitialized.current) {
            console.log('Recalculando totales por cambio en items');
            const timeoutId = setTimeout(() => {
                calculateTotals();
            }, 10);

            return () => clearTimeout(timeoutId);
        }
    }, [items]);

    // Función para actualizar is_selected en los items
    const updateItemsSelection = (itemsToUpdate = items) => {
        return itemsToUpdate.map((item) => {
            if (!item.variant_group) {
                return { ...item, is_selected: true };
            } else {
                const isSelected = selectedVariants[item.variant_group] === item.id;
                return { ...item, is_selected: isSelected };
            }
        });
    };

    // Función para obtener items actualizados con selección correcta
    const getItemsWithUpdatedSelection = () => {
        return updateItemsSelection(items);
    };

    return {
        totals,
        selectedVariants,
        regularItems,
        variantGroups,
        handleVariantChange,
        calculateTotals,
        updateItemsSelection,
        getItemsWithUpdatedSelection,
    };
}
