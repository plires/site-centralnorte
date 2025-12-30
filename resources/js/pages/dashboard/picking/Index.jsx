// resources/js/pages/dashboard/picking/Index.jsx

import BudgetStatusBadge, { budgetStatusOptions } from '@/components/BudgetStatusBadge';
import ButtonCustom from '@/components/ButtonCustom';
import DataTable from '@/components/DataTable';
import { useDeleteConfirmation } from '@/components/DeleteConfirmationDialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { pickingBudgetsColumns } from '@/config/pickingBudgetsColumns';
import { useExcelExport } from '@/hooks/use-excel-export';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { FileDown, Filter, Plus, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Presupuestos de Picking',
        href: '/dashboard/picking',
    },
];

export default function Index({ auth, budgets, vendors = [], filters = {}, statuses = [] }) {
    const { confirmDelete, DeleteConfirmationDialog } = useDeleteConfirmation();
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedVendor, setSelectedVendor] = useState(filters.vendor_id || '');

    const { handleCrudResponse } = useInertiaResponse();
    const { handleExport, isExporting } = useExcelExport();

    // Verificar si el usuario es admin
    const isAdmin = auth.user.role?.name === 'admin';

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

    const handleSend = (budgetId) => {
        router.post(route('dashboard.picking.budgets.send', budgetId));
    };

    const handleStatusFilter = (value) => {
        const newStatus = value === 'all' ? '' : value;
        setSelectedStatus(newStatus);

        router.get(
            route('dashboard.picking.budgets.index'),
            {
                ...filters,
                status: newStatus || undefined,
                page: 1,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleVendorFilter = (value) => {
        const newVendor = value === 'all' ? '' : value;
        setSelectedVendor(newVendor);

        router.get(
            route('dashboard.picking.budgets.index'),
            {
                ...filters,
                vendor_id: newVendor || undefined,
                page: 1,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        setSelectedStatus('');
        setSelectedVendor('');

        router.get(
            route('dashboard.picking.budgets.index'),
            { search: filters.search || undefined },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const hasActiveFilters = selectedStatus || selectedVendor;

    const actions = {
        view: handleView,
        edit: handleEdit,
        delete: handleDelete,
        duplicate: handleDuplicate,
        send: handleSend,
    };

    const columns = pickingBudgetsColumns(actions, isDeleting);

    // Usar statuses del backend o los predefinidos
    const statusOptions = statuses.length > 0 ? statuses : budgetStatusOptions;

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
            <Head title="Presupuestos de Picking" />
            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Header */}
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-lg font-medium">Presupuestos de Picking / Armado de Kits</h3>
                                    <p className="mt-1 text-sm text-gray-600">Gestiona los presupuestos de armado de kits y picking</p>
                                </div>
                                {/* Grupo de botones */}
                                <div className="flex gap-2">
                                    {/* Botón Exportar - Solo para admins */}
                                    {isAdmin && (
                                        <ButtonCustom
                                            onClick={() => handleExport(route('dashboard.picking.budgets.export'), 'picking_export.xlsx')}
                                            disabled={isExporting}
                                            variant="outline"
                                            size="md"
                                            className="flex items-center gap-2"
                                        >
                                            <FileDown className={`h-4 w-4 ${isExporting ? 'animate-bounce' : ''}`} />
                                            {isExporting ? 'Exportando...' : 'Exportar Excel'}
                                        </ButtonCustom>
                                    )}

                                    <ButtonCustom route={route('dashboard.picking.budgets.create')} variant="primary" size="md">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Nuevo Presupuesto
                                    </ButtonCustom>
                                </div>
                            </div>

                            {/* Filtros */}
                            <div className="mb-4 flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">Filtros:</span>
                                </div>

                                {/* Filtro por estado */}
                                <Select value={selectedStatus || 'all'} onValueChange={handleStatusFilter}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="Estado">
                                            {selectedStatus ? <BudgetStatusBadge status={selectedStatus} size="xs" /> : 'Todos los estados'}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los estados</SelectItem>
                                        {statusOptions.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                <BudgetStatusBadge status={status.value} size="xs" />
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Filtro por vendedor (solo admin) */}
                                {vendors.length > 0 && (
                                    <Select value={selectedVendor || 'all'} onValueChange={handleVendorFilter}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Vendedor">
                                                {selectedVendor
                                                    ? vendors.find((v) => v.id.toString() === selectedVendor)?.name || 'Vendedor'
                                                    : 'Todos los vendedores'}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los vendedores</SelectItem>
                                            {vendors.map((vendor) => (
                                                <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                                    {vendor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {/* Botón limpiar filtros */}
                                {hasActiveFilters && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-gray-700">
                                        <X className="mr-1 h-4 w-4" />
                                        Limpiar
                                    </Button>
                                )}
                            </div>

                            {/* Tabla */}
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
