import ButtonCustom from '@/components/ButtonCustom';
import DataTable from '@/components/DataTable';
import { useDeleteConfirmation } from '@/components/DeleteConfirmationDialog';
import { budgetsColumns } from '@/config/tableColumns';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Presupuestos',
        href: '/dashboard/budgets',
    },
];

export default function Index({ auth, budgets, filters = {} }) {
    const { confirmDelete, DeleteConfirmationDialog } = useDeleteConfirmation();
    const [isDeleting, setIsDeleting] = useState(false);

    const { handleCrudResponse } = useInertiaResponse();

    const handleView = (budgetId) => {
        router.get(route('dashboard.budgets.show', budgetId));
    };

    const handleEdit = (budgetId) => {
        router.get(route('dashboard.budgets.edit', budgetId));
    };

    const handleDelete = async (budgetId, productName) => {
        const confirmed = await confirmDelete({
            title: 'Eliminar producto',
            description: 'Esta acción no se puede deshacer. El producto será eliminado permanentemente del sistema.',
            itemName: productName,
        });

        if (confirmed) {
            setIsDeleting(true);

            router.delete(route('dashboard.budgets.destroy', budgetId), handleCrudResponse(setIsDeleting));
        }
    };

    const actions = { view: handleView, edit: handleEdit, delete: handleDelete };
    const columns = budgetsColumns(actions, isDeleting);

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
            <Head title="Presupuestos" />
            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium">Lista de Presupuestos</h3>
                                    <p className="mt-1 text-sm text-gray-600">Gestiona los presupuestos de merchandising</p>
                                </div>
                                <ButtonCustom route={route('dashboard.budgets.create')} variant="primary" size="md">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo Presupuesto
                                </ButtonCustom>
                            </div>

                            <DataTable
                                data={budgets.data || budgets}
                                columns={columns}
                                pagination={budgets.links ? budgets : null}
                                filters={filters}
                                onRowClick={(row) => router.visit(route('dashboard.budgets.show', row.id))}
                            />

                            <DeleteConfirmationDialog />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
