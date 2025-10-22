import { ReadOnlyProductsAlert } from '@/components/dashboard/ReadOnlyProductsAlert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Productos',
        href: '/dashboard/products',
    },
    {
        title: 'Detalles del Producto',
        href: '#',
    },
];

export default function Show({ product, is_readonly }) {
    const handleSyncProduct = () => {
        router.post(
            route('dashboard.products.sync.one', product.sku),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Producto: ${product.name}`} />

            <div className="space-y-6">
                {/* Alerta de solo lectura */}
                {is_readonly && <ReadOnlyProductsAlert showSyncButton={false} />}

                {/* Header con acciones */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => router.visit(route('dashboard.products.index'))}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{product.name}</h1>
                            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {/* Botón para sincronizar este producto específico */}
                        <Button variant="outline" size="sm" onClick={handleSyncProduct}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sincronizar producto
                        </Button>

                        {/* Ya NO hay botón "Editar" porque es solo lectura */}
                        {/* El botón de eliminar solo aparece si no tiene budget_items */}
                    </div>
                </div>

                {/* Detalles del producto (tu código existente) */}
                {/* ... resto de tu componente ... */}
            </div>
        </AppLayout>
    );
}

/**
 * NOTAS DE IMPLEMENTACIÓN:
 * 
 * 1. Eliminar el botón "Editar"
 * 2. Agregar botón "Sincronizar producto" para actualizar solo este producto
 * 3. Agregar el componente <ReadOnlyProductsAlert />
 * 4. Mantener todos los campos como solo lectura (no editables)
 */
