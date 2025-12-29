// resources/js/config/pickingBudgetsColumns.jsx

import ActionsDropdown from '@/components/ActionsDropdown';
import BudgetStatusBadge from '@/components/BudgetStatusBadge';
import getExpiryBadge from '@/components/getExpiryBadge';

// Definición de columnas para presupuestos de picking
export const pickingBudgetsColumns = (actions, isDeleting = false) => [
    {
        key: 'budget_number',
        label: 'N° Presupuesto',
        sortable: true,
        render: (value) => <span className="font-mono text-sm font-medium">{value}</span>,
    },
    {
        key: 'title',
        label: 'Título',
        sortable: true,
    },
    {
        key: 'client.name',
        label: 'Cliente',
        sortable: true,
        hideOnMobile: true,
        render: (value, row) => (
            <div>
                <div className="font-medium">{row.client?.name || 'Sin cliente'}</div>
                {row.client?.company && <div className="text-xs text-gray-500">{row.client.company}</div>}
            </div>
        ),
    },
    {
        key: 'vendor.name',
        label: 'Vendedor',
        sortable: true,
        hideOnMobile: true,
        render: (value, row) => row.vendor?.name || 'Sin vendedor',
    },
    {
        key: 'total_kits',
        label: 'Kits',
        sortable: true,
        hideOnMobile: true,
        render: (value) => <span className="font-medium">{value?.toLocaleString('es-AR') || 0}</span>,
    },
    {
        key: 'total',
        label: 'Total',
        sortable: true,
        render: (value) => {
            return new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
            }).format(value || 0);
        },
    },
    {
        key: 'valid_until',
        label: 'Vigencia',
        sortable: false,
        render: (value, row) => <div className="text-center">{getExpiryBadge(row)}</div>,
    },
    {
        key: 'status',
        label: 'Estado',
        sortable: true,
        render: (value, row) => (
            <div className="text-center">
                <BudgetStatusBadge status={row.status} showIcon={true} size="xs" />
            </div>
        ),
    },
    {
        key: 'actions',
        label: '',
        sortable: false,
        render: (value, row) => <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />,
    },
];

export default pickingBudgetsColumns;
