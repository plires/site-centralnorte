import { useMemo } from 'react';

export function useBudgetItems(data, setData, selectedVariants, onItemsChange) {
    const organizedItems = useMemo(() => {
        const organized = {
            regular: [],
            variantGroups: {},
        };

        data.items.forEach((item) => {
            if (item.variant_group) {
                if (!organized.variantGroups[item.variant_group]) {
                    organized.variantGroups[item.variant_group] = [];
                }
                organized.variantGroups[item.variant_group].push(item);
            } else {
                organized.regular.push(item);
            }
        });

        return organized;
    }, [data.items]);

    const checkForDuplicateVariants = (newItems) => {
        const duplicates = [];

        newItems.forEach((newItem, newIndex) => {
            // Verificar contra items existentes
            data.items.forEach((existingItem) => {
                if (
                    existingItem.product_id === newItem.product_id &&
                    existingItem.quantity === newItem.quantity &&
                    existingItem.unit_price === newItem.unit_price
                ) {
                    duplicates.push({
                        newIndex,
                        message: `Ya existe un item de "${newItem.product.name}" con cantidad ${newItem.quantity} y precio ${formatCurrency(newItem.unit_price)}`,
                    });
                }
            });

            // Verificar contra otros items nuevos (dentro del mismo modal)
            newItems.forEach((otherNewItem, otherIndex) => {
                if (
                    newIndex !== otherIndex &&
                    newItem.product_id === otherNewItem.product_id &&
                    newItem.quantity === otherNewItem.quantity &&
                    newItem.unit_price === otherNewItem.unit_price
                ) {
                    duplicates.push({
                        newIndex,
                        message: `Variante ${newIndex + 1} duplicada con variante ${otherIndex + 1}`,
                    });
                }
            });
        });

        return duplicates;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    const handleAddItems = (newItems) => {
        if (newItems.length === 1 && !newItems[0].variant_group) {
            // Lógica para productos individuales: sumar cantidades si ya existe
            const newItem = newItems[0];
            const existingItemIndex = data.items.findIndex((item) => item.product_id === newItem.product_id && !item.variant_group);

            if (existingItemIndex !== -1) {
                // El producto ya existe, sumar cantidades y actualizar precio
                const updatedItems = [...data.items];
                const existingItem = updatedItems[existingItemIndex];

                updatedItems[existingItemIndex] = {
                    ...existingItem,
                    quantity: existingItem.quantity + newItem.quantity,
                    unit_price: newItem.unit_price, // Tomar el último precio
                    line_total: (existingItem.quantity + newItem.quantity) * newItem.unit_price,
                    // Actualizar otros campos si están presentes
                    production_time_days: newItem.production_time_days || existingItem.production_time_days,
                    logo_printing: newItem.logo_printing || existingItem.logo_printing,
                };

                setData('items', updatedItems);
            } else {
                // Producto nuevo, agregarlo normalmente
                setData('items', [...data.items, newItem]);
            }
        } else {
            // Para variantes, agreggar normalmente (ya se validaron duplicados en el modal)
            setData('items', [...data.items, ...newItems]);
        }

        setTimeout(() => onItemsChange(), 0);
    };

    const handleRemoveItem = (index) => {
        const item = data.items[index];
        let newItems = [...data.items];

        if (item.variant_group) {
            newItems = newItems.filter((i) => i.variant_group !== item.variant_group);
        } else {
            newItems.splice(index, 1);
        }

        setData('items', newItems);
        setTimeout(() => onItemsChange(), 0);
    };

    return {
        organizedItems,
        handleAddItems,
        handleRemoveItem,
        checkForDuplicateVariants,
    };
}
