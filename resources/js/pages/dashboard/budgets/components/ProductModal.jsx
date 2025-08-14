import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, X } from 'lucide-react';

import { useProductModal } from '../hooks/useProductModal';
import VariantForm from './VariantForm';

export default function ProductModal({ products, existingItems = [], onClose, onSubmit, checkForDuplicates = null }) {
    const {
        selectedProduct,
        selectedProductName,
        variants,
        isVariantMode,
        validationErrors,
        handleProductSelect,
        handleVariantModeChange,
        addVariant,
        removeVariant,
        updateVariant,
        handleSubmit,
        isValid,
    } = useProductModal(products, existingItems, checkForDuplicates);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    const onModalSubmit = () => {
        const newItems = handleSubmit();
        if (newItems.length > 0) {
            onSubmit(newItems);
        }
    };

    return (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
            <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Agregar Producto</CardTitle>
                    <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Selector de producto */}
                    <div>
                        <Label>Producto *</Label>
                        <Select value={selectedProduct?.id?.toString() || ''} onValueChange={handleProductSelect}>
                            <SelectTrigger>
                                <SelectValue>{selectedProductName || 'Seleccionar producto'}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((product) => (
                                    <SelectItem key={product.id} value={product.id.toString()}>
                                        <div className="flex items-center gap-2">
                                            {product.images && product.images.length > 0 ? (
                                                <img src={product.images[0].url} alt={product.name} className="h-8 w-8 rounded object-cover" />
                                            ) : (
                                                <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100">
                                                    <Package className="h-4 w-4 text-gray-400" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                {product.last_price && (
                                                    <p className="text-muted-foreground text-sm">{formatCurrency(product.last_price)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Mostrar errores de validación */}
                    {validationErrors.length > 0 && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <h4 className="mb-2 flex items-center gap-2 font-medium text-red-800">
                                <X className="h-4 w-4" />
                                Productos duplicados detectados
                            </h4>
                            <ul className="space-y-1 text-sm text-red-700">
                                {validationErrors.map((error, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-red-500">•</span>
                                        {error.message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Formularios de variantes */}
                    <div className="space-y-4">
                        {variants.map((variant, index) => {
                            const hasError = validationErrors.some((error) => error.newIndex === index);
                            return (
                                <VariantForm
                                    key={variant.id}
                                    variant={variant}
                                    index={index}
                                    isVariantMode={isVariantMode}
                                    canRemove={variants.length > 1}
                                    onUpdate={updateVariant}
                                    onRemove={() => removeVariant(variant.id)}
                                    hasError={hasError}
                                />
                            );
                        })}
                    </div>

                    {/* Checkbox de variantes */}
                    <div className="flex items-center space-x-2">
                        <Checkbox id="is_variant" checked={isVariantMode} onCheckedChange={handleVariantModeChange} />
                        <Label htmlFor="is_variant" className="text-sm">
                            Es un producto con variantes
                        </Label>
                    </div>

                    {/* Panel de variantes */}
                    {isVariantMode && (
                        <div className="rounded-lg bg-blue-50 p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <h4 className="font-medium">Variantes del producto</h4>
                                <Button type="button" size="sm" onClick={addVariant} className="flex items-center gap-1">
                                    <Plus className="h-3 w-3" />
                                    Agregar variante
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="button" onClick={onModalSubmit} disabled={!isValid}>
                            {isVariantMode ? 'Agregar Variantes' : 'Agregar Item'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
