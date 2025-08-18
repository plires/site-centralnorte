import UnifiedBudgetItemsSection from './UnifiedBudgetItemsSection';

export default function BudgetItemsDisplaySection({ regularItems, variantGroups, selectedVariants, onVariantChange }) {
    return (
        <UnifiedBudgetItemsSection
            regularItems={regularItems}
            variantGroups={variantGroups}
            selectedVariants={selectedVariants}
            onVariantChange={onVariantChange}
            showActions={false}
        />
    );
}
