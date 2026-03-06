import ButtonCustom from '@/components/ButtonCustom';
import DataTable from '@/components/DataTable';
import { useUserDeleteDialog } from '@/components/UserDeleteDialog';
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

export default function Index({ auth, users, availableSellers = [], filters = {} }) {
    const { confirmDelete, UserDeleteDialog } = useUserDeleteDialog();
    const [isDeleting, setIsDeleting] = useState(false);

    const { handleCrudResponse } = useInertiaResponse();

    const handleView = (userId) => {
        router.get(route('dashboard.users.show', userId));
    };

    const handleEdit = (userId) => {
        router.get(route('dashboard.users.edit', userId));
    };

    const handleDelete = async (userId, userName) => {
        // Buscar los datos del usuario (incluye conteos precargados desde el controller)
        const userRecord = (users.data || users).find((u) => u.id === userId);

        const result = await confirmDelete({
            userName,
            merchCount:   userRecord?.merch_budget_count   ?? 0,
            pickingCount: userRecord?.picking_budget_count ?? 0,
            clientsCount: userRecord?.clients_count        ?? 0,
            // Excluir al propio usuario del listado de destino de reasignación
            availableSellers: availableSellers.filter((s) => s.id !== userId),
        });

        if (result.confirmed) {
            setIsDeleting(true);

            router.delete(route('dashboard.users.destroy', userId), {
                data: { reassign_to: result.reassignTo },
                ...handleCrudResponse(setIsDeleting),
            });
        }
    };

    const actions = { view: handleView, edit: handleEdit, delete: handleDelete };
    const columns = userColumns(actions, isDeleting, auth.user.id);

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

                            <DataTable
                                data={users.data || users}
                                columns={columns}
                                pagination={users.links ? users : null}
                                filters={filters}
                                onRowClick={(row) => router.visit(route('dashboard.users.show', row.id))}
                            />

                            <UserDeleteDialog />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
