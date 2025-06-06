import ButtonCustom from '@/components/ButtonCustom';
import DataTable from '@/Components/DataTable';
import { useDeleteConfirmation } from '@/components/DeleteConfirmationDialog';
import { rolesColumns } from '@/config/tableColumns';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Roles de Usuarios',
        href: '/dashboard/users/roles',
    },
];

export default function Index({ auth, roles, filters = {} }) {
    const { confirmDelete, DeleteConfirmationDialog } = useDeleteConfirmation();
    const [isDeleting, setIsDeleting] = useState(false);

    const { handleCrudResponse } = useInertiaResponse();

    const handleView = (rolId) => {
        // Redirigir a la página de Show
        router.get(route('dashboard.roles.show', rolId));
    };

    const handleEdit = (rolId) => {
        // Redirigir a la página de edición
        router.get(route('dashboard.roles.edit', rolId));
    };

    const handleDelete = async (rolId, userName) => {
        const confirmed = await confirmDelete({
            title: 'Eliminar Rol',
            description:
                'Esta acción no se puede deshacer. El rol será eliminado permanentemente del sistema. Tenga en cuenta que para borrar el rol, no debe contener ningun usuario asociado a el.',
            itemName: userName,
        });

        if (confirmed) {
            setIsDeleting(true);

            router.delete(
                route('dashboard.roles.destroy', rolId),
                handleCrudResponse(setIsDeleting), // Automáticamente maneja el setIsDeleting(false)
            );
        }
    };

    const actions = { view: handleView, edit: handleEdit, delete: handleDelete };
    const columns = rolesColumns(actions, isDeleting);

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
            <Head title="Roles de Usuarios" />
            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-medium">Lista de Roles</h3>
                                <ButtonCustom route={route('dashboard.roles.create')} variant="primary" size="md">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo Rol
                                </ButtonCustom>
                            </div>

                            <DataTable data={roles.data || roles} columns={columns} pagination={roles.links ? roles : null} filters={filters} />
                            <DeleteConfirmationDialog />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
