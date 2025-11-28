// resources/js/pages/dashboard/picking/Index.jsx

import ButtonCustom from '@/components/ButtonCustom';
import DataTable from '@/components/DataTable';
import { useDeleteConfirmation } from '@/components/DeleteConfirmationDialog';
import { pickingBudgetsColumns } from '@/config/pickingBudgetsColumns';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Presupuestos de Picking',
        href: '/dashboard/picking',
    },
];

export default function Index({ auth, budgets, filters = {} }) {
    const { confirmDelete, DeleteConfirmationDialog } = useDeleteConfirmation();
    const [isDeleting, setIsDeleting] = useState(false);

    const { handleCrudResponse } = useInertiaResponse();

    const handleView = (budgetId) => {
        router.get(route('dashboard.picking.budgets.show', budgetId));
    };

    const handleEdit = (budgetId) => {
        router.get(route('dashboard.picking.budgets.edit', budgetId));
    };

    const handleDelete = async (budgetId, budgetNumber) => {
        const confirmed = await confirmDelete({
            title: 'Eliminar presupuesto de picking',
            description: 'Esta acción no se puede deshacer. El presupuesto será eliminado permanentemente del sistema.',
            itemName: budgetNumber,
        });

        if (confirmed) {
            setIsDeleting(true);

            router.delete(route('dashboard.picking.budgets.destroy', budgetId), handleCrudResponse(setIsDeleting));
        }
    };

    const handleDuplicate = (budgetId) => {
        router.post(route('dashboard.picking.budgets.duplicate', budgetId));
    };

    const actions = { 
        view: handleView, 
        edit: handleEdit, 
        delete: handleDelete,
        duplicate: handleDuplicate 
    };
    
    const columns = pickingBudgetsColumns(actions, isDeleting);

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
            <Head title="Presupuestos de Picking" />
            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium">Presupuestos de Picking / Armado de Kits</h3>
                                    <p className="mt-1 text-sm text-gray-600">Gestiona los presupuestos de armado de kits y picking</p>
                                </div>
                                <ButtonCustom route={route('dashboard.picking.budgets.create')} variant="primary" size="md">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo Presupuesto
                                </ButtonCustom>
                            </div>

                            <DataTable
                                data={budgets.data || budgets}
                                columns={columns}
                                pagination={budgets.links ? budgets : null}
                                filters={filters}
                                onRowClick={(row) => router.visit(route('dashboard.picking.budgets.show', row.id))}
                            />

                            <DeleteConfirmationDialog />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
