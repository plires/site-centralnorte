import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';

export default function VariantForm({
    variant,
    index,
    isVariantMode,
    canRemove,
    onUpdate,
    onRemove,
    hasError,
    allVariants = [],
    onVariantSelect = null,
}) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount || 0);
    };

    const handleSelectionChange = (variantId) => {
        if (onVariantSelect) {
            onVariantSelect(variantId);
        }
    };

    return (
        <div className={`rounded-lg border p-4 ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h5 className="font-medium text-gray-900">{isVariantMode ? `Variante ${index + 1}` : 'Producto'}</h5>

                    {/* Radio button para seleccionar variante - solo si hay múltiples variantes */}
                    {isVariantMode && allVariants.length > 1 && (
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id={`variant_${variant.id}`}
                                name="selected_variant"
                                checked={variant.is_selected || false}
                                onChange={() => handleSelectionChange(variant.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor={`variant_${variant.id}`} className="text-sm text-gray-600">
                                Seleccionada
                            </Label>
                        </div>
                    )}
                </div>

                {canRemove && (
                    <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor={`quantity_${variant.id}`}>Cantidad *</Label>
                    <Input
                        id={`quantity_${variant.id}`}
                        type="number"
                        min="1"
                        value={variant.quantity}
                        onChange={(e) => onUpdate(variant.id, 'quantity', e.target.value)}
                        placeholder="Ej: 100"
                        className={hasError ? 'border-red-300' : ''}
                    />
                </div>

                <div>
                    <Label htmlFor={`unit_price_${variant.id}`}>Precio Unitario *</Label>
                    <Input
                        id={`unit_price_${variant.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.unit_price}
                        onChange={(e) => onUpdate(variant.id, 'unit_price', e.target.value)}
                        placeholder="Ej: 1500.00"
                        className={hasError ? 'border-red-300' : ''}
                    />
                </div>

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

            {/* Mostrar total calculado */}
            {variant.quantity && variant.unit_price && (
                <div className="mt-3 flex items-center justify-between rounded bg-gray-50 p-2">
                    <span className="text-sm font-medium text-gray-600">Total de esta línea:</span>
                    <span className="font-bold text-gray-900">
                        {formatCurrency(parseFloat(variant.quantity || 0) * parseFloat(variant.unit_price || 0))}
                    </span>
                </div>
            )}

            {/* Indicador visual si está seleccionada */}
            {isVariantMode && variant.is_selected && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Esta variante será incluida en el total del presupuesto</span>
                </div>
            )}
        </div>
    );
}
