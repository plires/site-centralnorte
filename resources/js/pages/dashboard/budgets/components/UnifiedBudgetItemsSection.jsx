import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plus } from 'lucide-react';
import UnifiedItemDisplay from './UnifiedItemDisplay';
import UnifiedVariantGroupDisplay from './UnifiedVariantGroupDisplay';

export default function UnifiedBudgetItemsSection({
    regularItems = [],
    variantGroups = {},
    selectedVariants = {},
    onVariantChange = null,
    showActions = false,
    onAddProduct = null,
    onEditItem = null,
    onRemoveItem = null,
    onEditVariantGroup = null,
    onRemoveVariantGroup = null,
    itemsLength = 0,
}) {
    return (
        <Card>
            <CardHeader className={showActions ? 'flex flex-row items-center justify-between' : ''}>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Items del Presupuesto
                </CardTitle>
                {showActions && onAddProduct && (
                    <Button type="button" onClick={onAddProduct} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Agregar Producto
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {/* Items regulares */}
                {regularItems.length > 0 && (
                    <div className="space-y-4">
                        {!showActions && <h4 className="font-medium text-gray-900">Items Principales</h4>}
                        <div className="space-y-3">
                            {regularItems.map((item) => (
                                <UnifiedItemDisplay
                                    key={item.id}
                                    item={item}
                                    showActions={showActions}
                                    onEdit={onEditItem ? () => onEditItem(item) : undefined}
                                    onRemove={onRemoveItem ? () => onRemoveItem(item) : undefined}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Grupos de variantes */}
                {Object.keys(variantGroups).map((group) => (
                    <UnifiedVariantGroupDisplay
                        key={group}
                        group={group}
                        items={variantGroups[group]}
                        selectedVariants={selectedVariants}
                        onVariantChange={onVariantChange}
                        showActions={showActions}
                        onEdit={onEditVariantGroup ? () => onEditVariantGroup(group, variantGroups[group]) : undefined}
                        onRemove={onRemoveVariantGroup ? () => onRemoveVariantGroup(group, variantGroups[group]) : undefined}
                    />
                ))}

                {/* Mensaje cuando no hay items (solo en modo edición) */}
                {showActions && (itemsLength || regularItems.length + Object.keys(variantGroups).length) === 0 && (
                    <p className="text-muted-foreground py-8 text-center">
                        No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
