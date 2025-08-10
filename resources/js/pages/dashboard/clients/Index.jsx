import ButtonCustom from '@/components/ButtonCustom';
import DataTable from '@/Components/DataTable';
import { useDeleteConfirmation } from '@/components/DeleteConfirmationDialog';
import { clientsColumns } from '@/config/tableColumns';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Clientes',
        href: '/dashboard/clients',
    },
];

export default function Index({ auth, clients }) {
    const { confirmDelete, DeleteConfirmationDialog } = useDeleteConfirmation();
    const [isDeleting, setIsDeleting] = useState(false);

    const { handleCrudResponse } = useInertiaResponse();

    const handleView = (clientId) => {
        // Redirigir a la página de Show
        router.get(route('dashboard.clients.show', clientId));
    };

    const handleEdit = (clientId) => {
        // Redirigir a la página de edición
        router.get(route('dashboard.clients.edit', clientId));
    };

    const handleDelete = async (clientId, clientName) => {
        const confirmed = await confirmDelete({
            title: 'Eliminar Cliente',
            description: 'Esta acción no se puede deshacer. El cliente será eliminado permanentemente del sistema.',
            itemName: clientName,
        });

        if (confirmed) {
            setIsDeleting(true);

            router.delete(
                route('dashboard.clients.destroy', clientId),
                handleCrudResponse(setIsDeleting), // Automáticamente maneja el setIsDeleting(false)
            );
        }
    };

    const actions = { view: handleView, edit: handleEdit, delete: handleDelete };
    const columns = clientsColumns(actions, isDeleting);

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
            <Head title="Clientes" />
            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-medium">Lista de Clientes</h3>
                                <ButtonCustom route={route('dashboard.clients.create')} variant="primary" size="md">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo Cliente
                                </ButtonCustom>
                            </div>

                            <DataTable
                                data={clients.data || clients}
                                columns={columns}
                                pagination={clients.links ? clients : null}
                                onRowClick={(row) => router.visit(route('dashboard.clients.show', row.id))}
                            />
                            <DeleteConfirmationDialog />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
