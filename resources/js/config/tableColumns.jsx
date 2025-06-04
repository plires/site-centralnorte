import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
                <DropdownMenuItem onClick={() => actions.delete(row.id, row.name || row.title)} className="text-red-600 focus:text-red-600">
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

export const productColumns = (actions, isDeleting = false) => [
    {
        key: 'name',
        label: 'Producto',
        sortable: true,
    },
    {
        key: 'category',
        label: 'Categoría',
        sortable: true,
        hideOnMobile: true,
        render: (value, row) => row.category?.name || 'Sin categoría',
    },
    {
        key: 'price',
        label: 'Precio',
        sortable: true,
        render: (value) => `$${value?.toFixed(2) || '0.00'}`,
    },
    {
        key: 'status',
        label: 'Estado',
        sortable: false,
        hideOnMobile: true,
        render: (value) => <StatusBadge value={value} type={value} />,
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
        label: 'Productos',
        sortable: true,
        render: (value) => value || 0,
    },
    {
        key: 'actions',
        label: '',
        render: (value, row) => <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />,
    },
];
