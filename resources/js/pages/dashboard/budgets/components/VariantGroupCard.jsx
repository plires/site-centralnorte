import { Button } from '@/components/ui/button';
import { Package, Trash2 } from 'lucide-react';

export default function VariantGroupCard({ group, items, selectedVariants, onVariantChange, onRemove }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    return (
        <div className="rounded-lg border bg-blue-50 p-4">
            <div className="mb-4 flex items-start gap-4">
                <div className="flex-shrink-0">
                    {items[0].product.images && items[0].product.images.length > 0 ? (
                        <img src={items[0].product.images[0].url} alt={items[0].product.name} className="h-16 w-16 rounded-lg border object-cover" />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-gray-100">
                            <Package className="h-8 w-8 text-gray-400" />
                        </div>
                    )}
                </div>

                <div className="flex flex-1 items-start justify-between">
                    <div>
                        <h4 className="font-semibold">{items[0].product.name} - Opciones de cantidad</h4>
                        <p className="text-sm text-blue-600">Grupo de variantes ({items.length} opciones)</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="ml-20 space-y-2">
                {items.map((item) => (
                    <label
                        key={item.id}
                        className="flex cursor-pointer items-center space-x-3 rounded border-2 p-3 transition-colors hover:bg-gray-50"
                        style={{
                            borderColor: String(selectedVariants[group]) === String(item.id) ? '#3b82f6' : '#e5e7eb',
                        }}
                    >
                        <input
                            type="radio"
                            name={`variant_${group}`}
                            value={item.id}
                            checked={String(selectedVariants[group]) === String(item.id)}
                            onChange={() => onVariantChange(group, item.id)}
                            className="text-blue-600"
                        />
                        <div className="flex-1">
                            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                                <div>
                                    <span className="text-muted-foreground">Cantidad:</span>
                                    <p className="font-medium">{item.quantity}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Precio unit.:</span>
                                    <p className="font-medium">{formatCurrency(item.unit_price)}</p>
                                </div>
                                {item.production_time_days && (
                                    <div>
                                        <span className="text-muted-foreground">Producción:</span>
                                        <p className="font-medium">{item.production_time_days} días</p>
                                    </div>
                                )}
                                <div>
                                    <span className="text-muted-foreground">Total:</span>
                                    <p className="font-bold">{formatCurrency(item.line_total)}</p>
                                </div>
                            </div>
                            {item.logo_printing && (
                                <div className="mt-2">
                                    <span className="text-muted-foreground text-sm">Logo:</span>
                                    <p className="text-sm">{item.logo_printing}</p>
                                </div>
                            )}
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}
