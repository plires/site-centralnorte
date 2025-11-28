// resources/js/config/pickingBudgetsColumns.jsx

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

// Badge de estado de presupuesto de picking
const PickingBudgetStatusBadge = ({ status, label }) => {
    const variants = {
        draft: 'bg-gray-100 text-gray-800',
        sent: 'bg-blue-100 text-blue-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        expired: 'bg-orange-100 text-orange-800',
    };

    const className = variants[status] || variants.draft;

    return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`}>{label}</span>;
};

// Dropdown de acciones
const ActionsDropdown = ({ row, actions, isDeleting }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <button className="h-8 w-8 rounded-md p-0 transition-colors hover:bg-gray-100">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="mx-auto h-4 w-4" />
            </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {actions.view && <DropdownMenuItem onClick={() => actions.view(row.id)}>Ver detalles</DropdownMenuItem>}
            {actions.edit && row.status === 'draft' && <DropdownMenuItem onClick={() => actions.edit(row.id)}>Editar</DropdownMenuItem>}
            {actions.duplicate && <DropdownMenuItem onClick={() => actions.duplicate(row.id)}>Duplicar</DropdownMenuItem>}
            <DropdownMenuSeparator />
            {actions.delete && row.status === 'draft' && (
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => actions.delete(row.id, row.budget_number)}
                    disabled={isDeleting}
                >
                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </DropdownMenuItem>
            )}
        </DropdownMenuContent>
    </DropdownMenu>
);

export const pickingBudgetsColumns = (actions, isDeleting = false) => [
    {
        key: 'budget_number',
        label: 'Nº Presupuesto',
        sortable: true,
        render: (value) => <span className="font-medium text-blue-600">{value}</span>,
    },
    {
        key: 'client_name',
        label: 'Cliente',
        sortable: true,
    },
    {
        key: 'vendor.name',
        label: 'Vendedor',
        sortable: false,
        hideOnMobile: true,
        render: (value, row) => row.vendor?.name || 'Sin vendedor',
    },
    {
        key: 'total_kits',
        label: 'Kits',
        sortable: true,
        hideOnMobile: true,
        render: (value) => <div className="text-center">{value.toLocaleString('es-AR')}</div>,
    },
    {
        key: 'unit_price_per_kit',
        label: 'Precio/Kit',
        sortable: true,
        hideOnMobile: true,
        render: (value) => {
            return new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
            }).format(value);
        },
    },
    {
        key: 'total',
        label: 'Total',
        sortable: true,
        render: (value) => {
            return new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
            }).format(value);
        },
    },
    {
        key: 'valid_until',
        label: 'Válido hasta',
        sortable: true,
        hideOnMobile: true,
        render: (value) => {
            // Si viene como string YYYY-MM-DD, parsearlo correctamente
            if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [year, month, day] = value.split('-');
                return `${day}/${month}/${year}`;
            }

            return new Date(value).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                timeZone: 'America/Argentina/Buenos_Aires',
            });
        },
    },
    {
        key: 'status',
        label: 'Estado',
        sortable: false,
        render: (value, row) => {
            const labels = {
                draft: 'Borrador',
                sent: 'Enviado',
                approved: 'Aprobado',
                rejected: 'Rechazado',
                expired: 'Vencido',
            };

            return (
                <div className="text-center">
                    <PickingBudgetStatusBadge status={value} label={labels[value] || value} />
                </div>
            );
        },
    },
    {
        key: 'actions',
        label: 'Acciones',
        render: (value, row) => (
            <div className="text-center">
                <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />
            </div>
        ),
    },
];
