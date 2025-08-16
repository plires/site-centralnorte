import { Package } from 'lucide-react';

export default function RegularItemDisplay({ item }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    return (
        <div className="flex justify-between rounded-lg border p-4">
            <div className="flex gap-4">
                {item.product.images?.[0] ? (
                    <img
                        src={item.product.images[0].full_url || item.product.images[0].url}
                        alt={item.product.name}
                        className="h-16 w-16 rounded object-cover"
                    />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded border bg-gray-100">
                        <Package className="h-8 w-8 text-gray-400" />
                    </div>
                )}
                <div>
                    <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                    {item.product.description && <p className="text-sm text-gray-500">{item.product.description}</p>}
                    <p className="text-sm text-gray-600">
                        Cantidad: {item.quantity} | Precio unit: {formatCurrency(item.unit_price)}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-medium text-gray-900">{formatCurrency(item.line_total)}</p>
            </div>
        </div>
    );
}
