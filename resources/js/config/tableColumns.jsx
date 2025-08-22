import BudgetStatusBadge from '@/components/BudgetStatusBadge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { timeAgo } from '@/utils/date';
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';

// Componente reutilizable para acciones
const ActionsDropdown = ({ row, actions, isDeleting = false }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            {actions.view && (
                <DropdownMenuItem onClick={() => actions.view(row.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver
                </DropdownMenuItem>
            )}
            {actions.edit && (
                <DropdownMenuItem onClick={() => actions.edit(row.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                </DropdownMenuItem>
            )}
            {(actions.view || actions.edit) && actions.delete && <DropdownMenuSeparator />}
            {actions.delete && (
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation(); // Por seguridad adicional
                        actions.delete(row.id, row.name || row.title);
                    }}
                    className="text-red-600 focus:text-red-600"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </DropdownMenuItem>
            )}
        </DropdownMenuContent>
    </DropdownMenu>
);

// Renderizador de badges/etiquetas reutilizable
const StatusBadge = ({ value, type = 'default' }) => {
    const variants = {
        admin: 'bg-green-100 text-green-800',
        vendedor: 'bg-blue-100 text-blue-800',
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-red-100 text-red-800',
        default: 'bg-gray-100 text-gray-800',
    };

    const className = variants[type] || variants.default;

    return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`}>{value}</span>;
};

// Definiciones de columnas por entidad
export const budgetsColumns = (actions, isDeleting = false) => [
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
        render: (value, row) => row.client?.name || 'Sin cliente',
    },
    {
        key: 'user.name',
        label: 'Vendedor',
        sortable: true,
        hideOnMobile: true,
        render: (value, row) => row.user?.name || 'Sin vendedor',
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
        key: 'expiry_date',
        label: 'Vencimiento',
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
        label: 'Vigencia',
        sortable: false,
        render: (value, row) => <BudgetStatusBadge status={row.status} statusText={row.status_text} showIcon={true} size="xs" />,
    },
    {
        key: 'is_active',
        label: 'Estado',
        sortable: true,
        hideOnMobile: true,
        render: (value, row) => {
            return <StatusBadge value={value ? 'Activo' : 'Inactivo'} type={value ? 'active' : 'inactive'} />;
        },
    },
    {
        key: 'actions',
        label: '',
        render: (value, row) => <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />,
    },
];

export const userColumns = (actions, isDeleting = false) => [
    {
        key: 'name',
        label: 'Nombre',
        sortable: true,
    },
    {
        key: 'email',
        label: 'Email',
        sortable: true,
        hideOnMobile: true,
        truncate: true,
    },
    {
        key: 'role',
        label: 'Rol',
        sortable: false,
        hideOnMobile: true,
        render: (value, row) => {
            const roleName = row.role?.name;

            if (!roleName) {
                return <span className="text-gray-400 italic">Sin rol</span>;
            }

            return <StatusBadge value={roleName} type={roleName} />;
        },
    },
    {
        key: 'actions',
        label: '',
        render: (value, row) => <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />,
    },
];

export const clientsColumns = (actions, isDeleting = false) => [
    {
        key: 'name',
        label: 'Nombre',
        sortable: true,
    },
    {
        key: 'company',
        label: 'Empresa',
        sortable: true,
    },
    {
        key: 'created_at',
        label: 'Fecha de Creación',
        sortable: true,
        hideOnMobile: true,
        truncate: true,
        render: (value) => timeAgo(value),
    },
    {
        key: 'actions',
        label: '',
        render: (value, row) => <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />,
    },
];

export const rolesColumns = (actions, isDeleting = false) => [
    {
        key: 'name',
        label: 'Nombre',
        sortable: true,
    },
    {
        key: 'created_at',
        label: 'Fecha de Creación',
        sortable: true,
        hideOnMobile: true,
        truncate: true,
        render: (value) => timeAgo(value),
    },
    {
        key: 'actions',
        label: '',
        render: (value, row) => <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />,
    },
];

export const productColumns = (actions, isDeleting = false) => [
    {
        key: 'name',
        label: 'Producto',
        sortable: true,
    },
    {
        key: 'category.name',
        label: 'Categoría',
        sortable: true,
        hideOnMobile: true,
        render: (value, row) => row.category?.name || 'Sin categoría',
    },
    {
        key: 'proveedor',
        label: 'Proveedor',
        sortable: true,
    },
    {
        key: 'actions',
        label: '',
        render: (value, row) => <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />,
    },
];

export const categoryColumns = (actions, isDeleting = false) => [
    {
        key: 'name',
        label: 'Categoría',
        sortable: true,
    },
    {
        key: 'description',
        label: 'Descripción',
        sortable: false,
        hideOnMobile: true,
        truncate: true,
    },
    {
        key: 'products_count',
        label: 'Productos Asociados',
        sortable: false,
        hideOnMobile: true,
        truncate: true,
    },
    {
        key: 'actions',
        label: '',
        render: (value, row) => <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />,
    },
];
