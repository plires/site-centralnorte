// resources/js/pages/dashboard/budgets/components/UnifiedItemDisplay.jsx
import { Button } from '@/components/ui/button';
import { usePage } from '@inertiajs/react';
import { Edit, Package, Trash2 } from 'lucide-react';

export default function UnifiedItemDisplay({ item, showActions = false, onEdit, onRemove }) {
    const { errors } = usePage().props;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    const productImageUrl = (() => {
        const fi = item.product?.featured_image;
        if (!fi) return null;
        return typeof fi === 'string' ? fi : fi.full_url || fi.url || null;
    })();

    return (
        <div className={`rounded-lg border p-4 ${item.is_product_deleted ? 'bg-red-50' : ''}`}>
            <div className="flex justify-between">
                {/* Lado izquierdo: Imagen + Contenido */}
                <div className="flex flex-1 gap-4">
                    {/* Imagen del producto */}
                    {productImageUrl ? (
                        <img
                            src={productImageUrl}
                            alt={item.product?.name ?? 'Producto'}
                            className="h-16 w-16 rounded object-cover"
                        />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded border bg-gray-100">
                            <Package className="h-8 w-8 text-gray-400" />
                        </div>
                    )}
                    <div className="flex-1">
                        {item.is_product_deleted && (
                            <span className="block text-xs font-medium text-orange-800">Producto no disponible en catálogo actual</span>
                        )}
                        <div>
                            <h5 className="font-medium text-gray-900">{item.product?.name}</h5>
                        </div>

                        {/* Información del item en una sola línea */}
                        <div className="mt-2">
                            <p className="text-sm text-gray-600">
                                <strong>Cantidad:</strong> {item.quantity} | <strong>Precio unit:</strong> {formatCurrency(item.unit_price)}
                                {item.logo_printing && (
                                    <span>
                                        {' '}
                                        | <strong>Logo:</strong> {item.logo_printing}
                                    </span>
                                )}
                                {item.production_time_days && (
                                    <span>
                                        {' '}
                                        | <strong>Días Prod:</strong> {item.production_time_days}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Lado derecho: Botones arriba, Precio abajo */}
                <div className="flex min-h-[4rem] flex-col items-end justify-between">
                    {/* Botones de acción arriba a la derecha */}
                    <div className="flex gap-2">
                        {showActions && (
                            <>
                                {!item.is_product_deleted && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={onEdit}
                                        className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                )}

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={onRemove}
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Precio total abajo a la derecha */}
                    <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(item.line_total)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
