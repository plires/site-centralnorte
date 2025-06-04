import ButtonCustom from '@/components/ButtonCustom';
import DataTable from '@/Components/DataTable';
import { useDeleteConfirmation } from '@/components/DeleteConfirmationDialog';
import { userColumns } from '@/config/tableColumns';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Usuarios',
        href: '/dashboard/users',
    },
];

export default function Index({ auth, users, filters = {} }) {
    const { confirmDelete, DeleteConfirmationDialog } = useDeleteConfirmation();
    const [isDeleting, setIsDeleting] = useState(false);

    const { handleCrudResponse } = useInertiaResponse();

    const handleView = (userId) => {
        // Redirigir a la página de Show
        router.get(route('dashboard.users.show', userId));
    };

    const handleEdit = (userId) => {
        // Redirigir a la página de edición
        router.get(route('dashboard.users.edit', userId));
    };

    const handleDelete = async (userId, userName) => {
        const confirmed = await confirmDelete({
            title: 'Eliminar usuario',
            description: 'Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema.',
            itemName: userName,
        });

        if (confirmed) {
            setIsDeleting(true);

            router.delete(
                route('dashboard.users.destroy', userId),
                handleCrudResponse(setIsDeleting), // Automáticamente maneja el setIsDeleting(false)
            );
        }
    };

    const actions = { view: handleView, edit: handleEdit, delete: handleDelete };
    const columns = userColumns(actions, isDeleting);

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
            <Head title="Usuarios" />
            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-medium">Lista de Usuarios</h3>
                                <ButtonCustom route={route('dashboard.users.create')} variant="primary" size="md">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo Usuario
                                </ButtonCustom>
                            </div>

                            <DataTable data={users.data || users} columns={columns} pagination={users.links ? users : null} filters={filters} />
                            <DeleteConfirmationDialog />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
