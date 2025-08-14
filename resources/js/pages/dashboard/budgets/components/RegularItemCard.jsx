import { Button } from '@/components/ui/button';
import { Package, Trash2 } from 'lucide-react';

export default function RegularItemCard({ item, onRemove }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    return (
        <div className="rounded-lg border p-4">
            <div className="flex items-start gap-4">
                {/* Thumbnail del producto */}
                <div className="flex-shrink-0">
                    {item.product.images && item.product.images.length > 0 ? (
                        <img src={item.product.images[0].url} alt={item.product.name} className="h-16 w-16 rounded-lg border object-cover" />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-gray-100">
                            <Package className="h-8 w-8 text-gray-400" />
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                        <h4 className="font-semibold">{item.product.name}</h4>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onRemove}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

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
                            <p className="text-lg font-bold">{formatCurrency(item.line_total)}</p>
                        </div>
                    </div>

                    {item.logo_printing && (
                        <div>
                            <span className="text-muted-foreground text-sm">Logo:</span>
                            <p className="text-sm">{item.logo_printing}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
