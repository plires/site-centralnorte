import ButtonCustom from '@/components/ButtonCustom';
import DataTable from '@/components/DataTable';
import { useDeleteConfirmation } from '@/components/DeleteConfirmationDialog';
import { productColumns } from '@/config/tableColumns';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { SyncAllProductsButton } from './components/SyncAllProductsButton';

const breadcrumbs = [
    {
        title: 'Productos',
        href: '/dashboard/products',
    },
];

export default function Index({ auth, products, filters = {}, last_sync_info }) {
    const { product } = usePage().props;
    const { confirmDelete, DeleteConfirmationDialog } = useDeleteConfirmation();
    const [isDeleting, setIsDeleting] = useState(false);

    const { handleCrudResponse } = useInertiaResponse();

    const handleView = (productId) => {
        router.get(route('dashboard.products.show', productId));
    };

    const handleEdit = (productId) => {
        router.get(route('dashboard.products.edit', productId));
    };

    const handleDelete = async (productId, productName) => {
        const confirmed = await confirmDelete({
            title: 'Eliminar producto',
            description: 'Esta acción no se puede deshacer. El producto será eliminado permanentemente del sistema.',
            itemName: productName,
        });

        if (confirmed) {
            setIsDeleting(true);

            router.delete(route('dashboard.products.destroy', productId), handleCrudResponse(setIsDeleting));
        }
    };

    const actions = { view: handleView, edit: handleEdit, delete: handleDelete };
    const columns = productColumns(actions, isDeleting, product.placeholder_image);

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
            <Head title="Productos" />
            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <SyncAllProductsButton lastSyncInfo={last_sync_info} />
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-medium">Lista de Productos</h3>
                                <ButtonCustom route={route('dashboard.products.create')} variant="primary" size="md">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo Producto
                                </ButtonCustom>
                            </div>

                            <DataTable
                                data={products.data || products}
                                columns={columns}
                                pagination={products.links ? products : null}
                                filters={filters}
                                onRowClick={(row) => router.visit(route('dashboard.products.show', row.id))}
                            />
                            <DeleteConfirmationDialog />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
