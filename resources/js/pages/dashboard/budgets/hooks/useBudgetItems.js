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

    const checkForDuplicateVariants = (newItems, excludeItem = null) => {
        const duplicates = [];

        newItems.forEach((newItem, newIndex) => {
            // Verificar contra items existentes (excluyendo el item que se está editando)
            data.items.forEach((existingItem) => {
                if (
                    excludeItem &&
                    (existingItem.id === excludeItem.id || (excludeItem.isVariantGroup && existingItem.variant_group === excludeItem.group))
                ) {
                    return; // Saltar el item que se está editando
                }

                // Validar duplicados por producto (solo si es un producto diferente al que se está editando)
                if (existingItem.product_id === newItem.product_id) {
                    // Obtener el nombre del producto de manera segura
                    const productName = newItem.product?.name || existingItem.product?.name || `Producto ID ${newItem.product_id}`;

                    duplicates.push({
                        newIndex,
                        message: `El producto "${productName}" ya existe en el presupuesto y será reemplazado`,
                    });
                }
            });

            // Verificar contra otros items nuevos (dentro del mismo modal)
            newItems.forEach((otherNewItem, otherIndex) => {
                if (newIndex !== otherIndex && newItem.product_id === otherNewItem.product_id) {
                    duplicates.push({
                        newIndex,
                        message: `Producto duplicado en variantes ${newIndex + 1} y ${otherIndex + 1}`,
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
        let updatedItems = [...data.items];

        // Verificar si los nuevos items son variantes o individuales
        const isVariantGroup = newItems.length > 1 || (newItems.length === 1 && newItems[0].variant_group);

        if (isVariantGroup) {
            // Para grupos de variantes: remover cualquier línea del mismo producto
            const productId = newItems[0].product_id;
            updatedItems = updatedItems.filter((item) => item.product_id !== productId);

            // Agregar todas las nuevas variantes
            updatedItems = [...updatedItems, ...newItems];
        } else {
            // Para producto individual: remover cualquier línea del mismo producto
            const newItem = newItems[0];
            updatedItems = updatedItems.filter((item) => item.product_id !== newItem.product_id);

            // Agregar el nuevo item
            updatedItems.push(newItem);
        }

        setData('items', updatedItems);
        setTimeout(() => onItemsChange(), 0);
    };

    const handleEditItem = (editingItem, newItems) => {
        let updatedItems = [...data.items];

        // Primero, remover el item/grupo que se está editando
        if (editingItem.isVariantGroup) {
            // Remover todo el grupo de variantes que se está editando
            updatedItems = updatedItems.filter((item) => item.variant_group !== editingItem.group);
        } else {
            // Remover el item individual que se está editando
            updatedItems = updatedItems.filter((item) => item.id !== editingItem.id);
        }

        // Verificar si los nuevos items son variantes o individuales
        const isVariantGroup = newItems.length > 1 || (newItems.length === 1 && newItems[0].variant_group);

        if (isVariantGroup) {
            // Para grupos de variantes: remover cualquier línea existente del mismo producto
            const productId = newItems[0].product_id;
            updatedItems = updatedItems.filter((item) => item.product_id !== productId);

            // Agregar todas las nuevas variantes
            updatedItems = [...updatedItems, ...newItems];
        } else {
            // Para producto individual: remover cualquier línea existente del mismo producto
            const newItem = newItems[0];
            updatedItems = updatedItems.filter((item) => item.product_id !== newItem.product_id);

            // Agregar el nuevo item
            updatedItems.push(newItem);
        }

        setData('items', updatedItems);
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
        handleEditItem,
        handleRemoveItem,
        checkForDuplicateVariants,
    };
}
