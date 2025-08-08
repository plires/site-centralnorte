import ButtonCustom from '@/components/ButtonCustom';
import DataTable from '@/Components/DataTable';
import { useDeleteConfirmation } from '@/components/DeleteConfirmationDialog';
import { categoryColumns } from '@/config/tableColumns';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Categorías',
        href: '/dashboard/productos/categorías',
    },
];

export default function Index({ auth, categories, filters = {} }) {
    const { confirmDelete, DeleteConfirmationDialog } = useDeleteConfirmation();
    const [isDeleting, setIsDeleting] = useState(false);

    const { handleCrudResponse } = useInertiaResponse();

    const handleView = (categoryId) => {
        // Redirigir a la página de Show
        router.get(route('dashboard.categories.show', categoryId));
    };

    const handleEdit = (categoryId) => {
        // Redirigir a la página de edición
        router.get(route('dashboard.categories.edit', categoryId));
    };

    const handleDelete = async (categoryId, userName) => {
        const confirmed = await confirmDelete({
            title: 'Eliminar Categoría',
            description:
                'Esta acción no se puede deshacer. La categoría será eliminada permanentemente del sistema. Tenga en cuenta que para borrar esta categoría, no debe contener ningun producto asociado a ella.',
            itemName: userName,
        });

        if (confirmed) {
            setIsDeleting(true);

            router.delete(
                route('dashboard.categories.destroy', categoryId),
                handleCrudResponse(setIsDeleting), // Automáticamente maneja el setIsDeleting(false)
            );
        }
    };

    const actions = { view: handleView, edit: handleEdit, delete: handleDelete };
    const columns = categoryColumns(actions, isDeleting);

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
            <Head title="Categorías de Productos" />
            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-medium">Lista de Categorías</h3>
                                <ButtonCustom route={route('dashboard.categories.create')} variant="primary" size="md">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nueva Categoría
                                </ButtonCustom>
                            </div>

                            <DataTable
                                data={categories.data || categories}
                                columns={columns}
                                pagination={categories.links ? categories : null}
                                filters={filters}
                                onRowClick={(row) => router.visit(route('dashboard.categories.show', row.id))}
                            />
                            <DeleteConfirmationDialog />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
