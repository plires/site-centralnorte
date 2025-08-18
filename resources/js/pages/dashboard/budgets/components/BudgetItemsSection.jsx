import { useState } from 'react';
import { useBudgetItems } from '../hooks/useBudgetItems';
import ProductModal from './ProductModal';
import UnifiedBudgetItemsSection from './UnifiedBudgetItemsSection';

export default function BudgetItemsSection({ data, setData, products, selectedVariants, onVariantChange, onItemsChange }) {
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const { organizedItems, handleAddItems, handleRemoveItem, handleEditItem, checkForDuplicateVariants } = useBudgetItems(
        data,
        setData,
        selectedVariants,
        onItemsChange,
    );

    const handleProductsAdded = (newItems) => {
        if (editingItem) {
            // Modo edición: reemplazar item existente
            handleEditItem(editingItem, newItems);
            setEditingItem(null);
        } else {
            // Modo creación: agregar nuevos items
            handleAddItems(newItems);
        }
        setShowProductModal(false);
    };

    const handleEditProduct = (item) => {
        setEditingItem(item);
        setShowProductModal(true);
    };

    const handleEditVariantGroup = (group, items) => {
        setEditingItem({ group, items, isVariantGroup: true });
        setShowProductModal(true);
    };

    const closeModal = () => {
        setShowProductModal(false);
        setEditingItem(null);
    };

    return (
        <>
            <UnifiedBudgetItemsSection
                // Adaptar datos de organizedItems al formato esperado
                regularItems={organizedItems.regular}
                variantGroups={organizedItems.variantGroups}
                selectedVariants={selectedVariants}
                onVariantChange={onVariantChange}
                showActions={true}
                onAddProduct={() => setShowProductModal(true)}
                onEditItem={handleEditProduct}
                onRemoveItem={(item) => handleRemoveItem(data.items.indexOf(item))}
                onEditVariantGroup={handleEditVariantGroup}
                onRemoveVariantGroup={(group, items) => handleRemoveItem(data.items.indexOf(items[0]))}
                itemsLength={data.items.length}
            />

            {showProductModal && (
                <ProductModal
                    products={products}
                    existingItems={data.items}
                    editingItem={editingItem}
                    onClose={closeModal}
                    onSubmit={handleProductsAdded}
                    checkForDuplicates={checkForDuplicateVariants}
                />
            )}
        </>
    );
}
