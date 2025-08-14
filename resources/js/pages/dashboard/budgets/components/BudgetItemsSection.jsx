import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plus } from 'lucide-react';
import { useState } from 'react';

import { useBudgetItems } from '../hooks/useBudgetItems';
import ProductModal from './ProductModal';
import RegularItemCard from './RegularItemCard';
import VariantGroupCard from './VariantGroupCard';

export default function BudgetItemsSection({ data, setData, products, selectedVariants, onVariantChange, onItemsChange }) {
    const [showProductModal, setShowProductModal] = useState(false);

    const { organizedItems, handleAddItems, handleRemoveItem } = useBudgetItems(data, setData, selectedVariants, onItemsChange);

    const handleProductsAdded = (newItems) => {
        handleAddItems(newItems);
        setShowProductModal(false);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Items del Presupuesto
                    </CardTitle>
                    <Button type="button" onClick={() => setShowProductModal(true)} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Agregar Producto
                    </Button>
                </CardHeader>
                <CardContent>
                    {data.items.length === 0 ? (
                        <p className="text-muted-foreground py-8 text-center">
                            No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
                        </p>
                    ) : (
                        <div className="space-y-6">
                            {/* Items regulares */}
                            {organizedItems.regular.map((item, index) => (
                                <RegularItemCard key={item.id} item={item} onRemove={() => handleRemoveItem(data.items.indexOf(item))} />
                            ))}

                            {/* Grupos de variantes */}
                            {Object.entries(organizedItems.variantGroups).map(([group, items]) => (
                                <VariantGroupCard
                                    key={group}
                                    group={group}
                                    items={items}
                                    selectedVariants={selectedVariants}
                                    onVariantChange={onVariantChange}
                                    onRemove={() => handleRemoveItem(data.items.indexOf(items[0]))}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {showProductModal && <ProductModal products={products} onClose={() => setShowProductModal(false)} onSubmit={handleProductsAdded} />}
        </>
    );
}
