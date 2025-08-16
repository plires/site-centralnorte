import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

export default function VariantGroupDisplay({ group, items, selectedVariants, onVariantChange }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    const firstVariant = items[0];
    const productImage = firstVariant?.product?.images?.[0];

    return (
        <div className="mt-6">
            <Card className="p-4 shadow-none">
                <CardHeader className="p-0 pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                        {productImage ? (
                            <img
                                src={productImage.full_url || productImage.url}
                                alt={firstVariant.product.name}
                                className="h-16 w-16 rounded object-cover"
                            />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded border bg-gray-100">
                                <Package className="h-8 w-8 text-gray-400" />
                            </div>
                        )}
                        <div>
                            <div className="font-medium text-gray-900">{firstVariant.product.name}</div>
                            <div className="text-sm font-normal text-gray-500">Selecciona una opción</div>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="ml-0 space-y-2">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className={`flex cursor-pointer justify-between rounded-lg border p-3 transition-all duration-200 ${
                                    selectedVariants[group] === item.id
                                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                                onClick={() => onVariantChange(group, item.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                                            selectedVariants[group] === item.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                        }`}
                                    >
                                        {selectedVariants[group] === item.id && <div className="h-2 w-2 rounded-full bg-white"></div>}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            <strong>Cantidad:</strong> {item.quantity} | <strong>Precio unit:</strong>{' '}
                                            {formatCurrency(item.unit_price)} | <strong>Logo:</strong> {item.logo_printing || '-'} |{' '}
                                            <strong>Días Prod:</strong> {item.production_time_days || '-'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">{formatCurrency(item.line_total)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
