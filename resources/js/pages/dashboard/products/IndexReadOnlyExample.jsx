import { ReadOnlyProductsAlert } from '@/components/dashboard/ReadOnlyProductsAlert';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

const breadcrumbs = [
    {
        title: 'Productos',
        href: '/dashboard/products',
    },
];

export default function Index({ products, last_sync_info, is_readonly, filters }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos" />

            <div className="space-y-6">
                {/* Alerta de productos de solo lectura */}
                {is_readonly && <ReadOnlyProductsAlert lastSyncInfo={last_sync_info} showSyncButton={true} />}

                {/* Header con acciones */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Productos</h1>
                        <p className="text-sm text-muted-foreground">Catálogo de productos sincronizados desde API externa</p>
                    </div>

                    {/* Ya NO hay botón "Crear Producto" porque es solo lectura */}
                    {/* Si intentan acceder a /products/create, se redirigirá con mensaje de error */}
                </div>

                {/* Filtros y tabla de productos (tu código existente) */}
                {/* ... resto de tu componente ... */}
            </div>
        </AppLayout>
    );
}

/**
 * NOTAS DE IMPLEMENTACIÓN:
 * 
 * 1. Eliminar el botón "Crear Producto" del header
 * 2. Eliminar los botones "Editar" de cada fila de la tabla
 * 3. Agregar el componente <ReadOnlyProductsAlert />
 * 4. El botón "Ver" sigue funcionando normalmente
 * 5. El botón "Eliminar" solo funciona si el producto no tiene budget_items asociados
 * 6. Agregar un botón "Sincronizar ahora" en el header o en la alerta
 */
