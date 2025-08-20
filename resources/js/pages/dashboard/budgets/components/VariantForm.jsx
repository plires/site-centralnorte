import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';

function VariantForm({
    variant,
    index,
    isVariantMode,
    canRemove,
    onUpdate,
    onRemove,
    errors,
    formatCurrency,
    calculateLineTotal,
    hasVariantError, // Función helper
    getVariantError, // Función helper
}) {
    // Verificar errores específicos para esta variante
    const hasQuantityError = hasVariantError(index, 'quantity');
    const hasPriceError = hasVariantError(index, 'price');
    const hasAnyError = hasQuantityError || hasPriceError;

    // Obtener mensajes de error específicos
    const quantityError = getVariantError(index, 'quantity');
    const priceError = getVariantError(index, 'price');

    const lineTotal = calculateLineTotal(variant.quantity, variant.unit_price);

    return (
        <div className={`rounded-lg border p-4 ${hasAnyError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="mb-4 flex items-center justify-between">
                <h5 className="font-medium text-gray-900">{isVariantMode ? `Variante ${index + 1}` : 'Producto'}</h5>
                {canRemove && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(variant.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Campo de cantidad */}
                <div>
                    <Label htmlFor={`quantity_${variant.id}`}>Cantidad *</Label>
                    <Input
                        id={`quantity_${variant.id}`}
                        type="number"
                        min="1"
                        value={variant.quantity}
                        onChange={(e) => onUpdate(variant.id, 'quantity', e.target.value)}
                        placeholder="Ej: 100"
                        className={hasQuantityError ? 'border-red-500' : ''}
                    />
                    {quantityError && <p className="mt-1 text-sm text-red-600">{quantityError}</p>}
                </div>

                {/* Campo de precio unitario */}
                <div>
                    <Label htmlFor={`unit_price_${variant.id}`}>Precio Unitario *</Label>
                    <Input
                        id={`unit_price_${variant.id}`}
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={variant.unit_price}
                        onChange={(e) => onUpdate(variant.id, 'unit_price', e.target.value)}
                        placeholder="Ej: 1500.00"
                        className={hasPriceError ? 'border-red-500' : ''}
                    />
                    {priceError && <p className="mt-1 text-sm text-red-600">{priceError}</p>}
                </div>

                {/* Campo de tiempo de producción */}
                <div>
                    <Label htmlFor={`production_time_${variant.id}`}>Tiempo de Producción (días)</Label>
                    <Input
                        id={`production_time_${variant.id}`}
                        type="number"
                        min="1"
                        value={variant.production_time_days}
                        onChange={(e) => onUpdate(variant.id, 'production_time_days', e.target.value)}
                        placeholder="Ej: 15"
                    />
                </div>

                {/* Campo de impresión de logo */}
                <div>
                    <Label htmlFor={`logo_printing_${variant.id}`}>Impresión de Logo</Label>
                    <Input
                        id={`logo_printing_${variant.id}`}
                        value={variant.logo_printing}
                        onChange={(e) => onUpdate(variant.id, 'logo_printing', e.target.value)}
                        placeholder="Ej: Serigrafía 1 color"
                    />
                </div>
            </div>

            {/* Mostrar total calculado si ambos campos están completos y válidos */}
            {variant.quantity && variant.unit_price && !hasQuantityError && !hasPriceError && lineTotal > 0 && (
                <div className="mt-3 flex items-center justify-between rounded bg-gray-100 p-2">
                    <span className="text-sm font-medium text-gray-600">Total de esta línea:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(lineTotal)}</span>
                </div>
            )}

            {/* Indicador visual si está seleccionada (solo en modo variante) */}
            {isVariantMode && variant.is_selected && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Esta variante será incluida en el total del presupuesto</span>
                </div>
            )}
        </div>
    );
}
export default VariantForm;
