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

    const handleAddItems = (newItems) => {
        setData('items', [...data.items, ...newItems]);
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
    };
}
