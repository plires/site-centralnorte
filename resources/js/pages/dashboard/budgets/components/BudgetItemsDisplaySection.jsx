import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import RegularItemDisplay from './RegularItemDisplay';
import VariantGroupDisplay from './VariantGroupDisplay';

export default function BudgetItemsDisplaySection({ regularItems, variantGroups, selectedVariants, onVariantChange }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Items del Presupuesto
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Items regulares */}
                {regularItems.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Items Principales</h4>
                        <div className="space-y-3">
                            {regularItems.map((item) => (
                                <RegularItemDisplay key={item.id} item={item} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Grupos de variantes */}
                {Object.keys(variantGroups).map((group) => (
                    <VariantGroupDisplay
                        key={group}
                        group={group}
                        items={variantGroups[group]}
                        selectedVariants={selectedVariants}
                        onVariantChange={onVariantChange}
                    />
                ))}
            </CardContent>
        </Card>
    );
}
