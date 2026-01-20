// resources/js/config/tableColumns.jsx

import ActionsDropdown from '@/components/ActionsDropdown';
import BudgetStatusBadge from '@/components/BudgetStatusBadge';
import getExpiryBadge from '@/components/getExpiryBadge';
import { Badge } from '@/components/ui/badge';
import { timeAgo } from '@/utils/date';
import { Eye, EyeOff, Images } from 'lucide-react';

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
        key: 'budget_merch_number',
        label: 'N° Presupuesto',
        sortable: true,
        align: 'left',
    },
    {
        key: 'title',
        label: 'Título',
        sortable: true,
        align: 'left',
    },
    {
        key: 'client.name',
        label: 'Cliente',
        sortable: true,
        hideOnMobile: true,
        align: 'left',
        render: (value, row) => row.client?.name || 'Sin cliente',
    },
    {
        key: 'user.name',
        label: 'Vendedor',
        sortable: true,
        align: 'left',
        hideOnMobile: true,
        render: (value, row) => row.user?.name || 'Sin vendedor',
    },
    {
        key: 'total',
        label: 'Total',
        sortable: true,
        align: 'left',
        render: (value) => {
            return new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
            }).format(value);
        },
    },
    {
        key: 'expiry_date',
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
        label: 'Acciones',
        sortable: false,
        render: (value, row) => (
            <>
                <div className="text-center">
                    <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />
                </div>
            </>
        ),
    },
];

export const pickingBudgetsColumns = (actions, isDeleting = false) => [
    {
        key: 'budget_number',
        label: 'N° Presupuesto',
        sortable: true,
        align: 'left',
        render: (value) => <span className="font-mono text-sm font-medium">{value}</span>,
    },
    {
        key: 'title',
        label: 'Título',
        align: 'left',
        sortable: true,
    },
    {
        key: 'client.name',
        label: 'Cliente',
        sortable: true,
        align: 'left',
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
        align: 'left',
        hideOnMobile: true,
        render: (value, row) => row.vendor?.name || 'Sin vendedor',
    },
    {
        key: 'total_kits',
        label: 'Kits',
        sortable: true,
        align: 'left',
        hideOnMobile: true,
        render: (value) => <span className="font-medium">{value?.toLocaleString('es-AR') || 0}</span>,
    },
    {
        key: 'total',
        label: 'Total',
        sortable: true,
        align: 'left',
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
        label: 'Acciones',
        sortable: false,
        render: (value, row) => (
            <>
                <div className="text-center">
                    <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />
                </div>
            </>
        ),
    },
];

export const userColumns = (actions, isDeleting = false) => [
    {
        key: 'name',
        label: 'Nombre',
        sortable: true,
        align: 'left',
    },
    {
        key: 'email',
        label: 'Email',
        sortable: true,
        align: 'left',
        hideOnMobile: true,
    },
    {
        key: 'role.name',
        label: 'Rol',
        sortable: false,
        hideOnMobile: true,
        render: (value, row) => <StatusBadge value={row.role?.name || 'Sin rol'} type={row.role?.name || 'default'} />,
    },
    {
        key: 'created_at',
        label: 'Registrado',
        sortable: true,
        hideOnMobile: true,
        render: (value) => timeAgo(value),
    },
    {
        key: 'actions',
        label: 'Acciones',
        sortable: false,
        render: (value, row) => (
            <>
                <div className="text-center">
                    <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />
                </div>
            </>
        ),
    },
];

export const clientsColumns = (actions, isDeleting = false) => [
    {
        key: 'name',
        label: 'Nombre',
        sortable: true,
        align: 'left',
    },
    {
        key: 'company',
        label: 'Empresa',
        sortable: true,
        hideOnMobile: true,
        align: 'left',
        render: (value) => value || '-',
    },
    {
        key: 'email',
        label: 'Email',
        sortable: true,
        align: 'left',
        hideOnMobile: true,
    },
    {
        key: 'phone',
        label: 'Teléfono',
        sortable: false,
        align: 'left',
        hideOnMobile: true,
        render: (value) => value || '-',
    },
    {
        key: 'created_at',
        label: 'Registrado',
        sortable: true,
        hideOnMobile: true,
        render: (value) => timeAgo(value),
    },
    {
        key: 'actions',
        label: 'Acciones',
        sortable: false,
        render: (value, row) => (
            <>
                <div className="text-center">
                    <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />
                </div>
            </>
        ),
    },
];

export const rolesColumns = (actions, isDeleting = false) => [
    {
        key: 'name',
        label: 'Nombre',
        sortable: true,
        align: 'left',
    },
    {
        key: 'permissions_count',
        label: 'Permisos',
        sortable: false,
        hideOnMobile: true,
        render: (value, row) => (
            <Badge variant="outline" className="rounded-full">
                {row.permissions?.length || 0} permisos
            </Badge>
        ),
    },
    {
        key: 'users_count',
        label: 'Usuarios',
        sortable: false,
        hideOnMobile: true,
        render: (value, row) => (
            <Badge variant="outline" className="rounded-full">
                {row.users_count || 0} usuarios
            </Badge>
        ),
    },
    {
        key: 'created_at',
        label: 'Creado',
        sortable: true,
        hideOnMobile: true,
        render: (value) => timeAgo(value),
    },
    {
        key: 'actions',
        label: 'Acciones',
        sortable: false,
        render: (value, row) => (
            <>
                <div className="text-center">
                    <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />
                </div>
            </>
        ),
    },
];

export const categoryColumns = (actions, isDeleting = false) => [
    {
        key: 'name',
        label: 'Nombre',
        sortable: true,
        align: 'left',
    },
    {
        key: 'show',
        label: 'Visible',
        sortable: true,
        align: 'left',
        hideOnMobile: true,
        render: (value) =>
            value ? (
                <span className="flex items-center gap-1 text-green-600">
                    <Eye className="h-4 w-4" /> Sí
                </span>
            ) : (
                <span className="flex items-center gap-1 text-gray-400">
                    <EyeOff className="h-4 w-4" /> No
                </span>
            ),
    },
    {
        key: 'products_count',
        label: 'Productos',
        sortable: false,
        hideOnMobile: true,
        render: (value, row) => row.products_count || 0,
    },
    {
        key: 'origin',
        label: 'Origen',
        sortable: true,
        render: (value, row) => {
            const { label, className } = row.origin_config;

            return (
                <div className="text-center">
                    <Badge variant="outline" className={className}>
                        {label}
                    </Badge>
                </div>
            );
        },
    },
    {
        key: 'actions',
        label: 'Acciones',
        sortable: false,
        render: (value, row) => {
            const isExternal = row.origin !== 'local';

            return (
                <div className="text-center">
                    <ActionsDropdown isExternal={isExternal} row={row} actions={actions} isDeleting={isDeleting} />
                </div>
            );
        },
    },
];

export const productColumns = (actions, isDeleting = false) => [
    {
        key: 'featured_image',
        label: '',
        sortable: false,
        render: (value, row) => {
            const imageUrl = row.featured_image?.full_url;
            return imageUrl ? (
                <img src={imageUrl} alt={row.name} className="h-10 w-10 rounded object-cover" loading="lazy" />
            ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                    <Images className="h-5 w-5 text-gray-400" />
                </div>
            );
        },
    },
    {
        key: 'name',
        label: 'Nombre',
        sortable: true,
        align: 'left',
        render: (value, row) => (
            <div>
                <div className="font-medium">{value}</div>
                <div className="text-xs text-gray-500">SKU: {row.sku}</div>
            </div>
        ),
    },
    {
        key: 'categories',
        label: 'Categoría',
        sortable: false,
        align: 'left',
        hideOnMobile: true,
        render: (value, row) => {
            const cats = row.categories || [];
            if (cats.length === 0) return '-';
            return cats.map((c) => c.name).join(', ');
        },
    },
    {
        key: 'origin',
        label: 'Origen',
        sortable: true,
        render: (value, row) => {
            const { label, className } = row.origin_config;

            return (
                <div className="text-center">
                    <Badge variant="outline" className={className}>
                        {label}
                    </Badge>
                </div>
            );
        },
    },
    {
        key: 'actions',
        label: 'Acciones',
        sortable: false,
        render: (value, row) => {
            const isExternal = row.origin !== 'local';

            return (
                <div className="text-center">
                    <ActionsDropdown isExternal={isExternal} row={row} actions={actions} isDeleting={isDeleting} />
                </div>
            );
        },
    },
];

export const slidesColumns = (actions, isDeleting = false) => [
    {
        key: 'image',
        label: 'Imagen',
        sortable: false,
        render: (value, row) => {
            const imageUrl = row.image_url || row.image;
            return imageUrl ? (
                <img src={imageUrl} alt={row.title || 'Slide'} className="h-12 w-20 rounded object-cover" loading="lazy" />
            ) : (
                <div className="flex h-12 w-20 items-center justify-center rounded bg-gray-100">
                    <Images className="h-5 w-5 text-gray-400" />
                </div>
            );
        },
    },
    {
        key: 'title',
        label: 'Título',
        sortable: true,
        render: (value) => value || 'Sin título',
    },
    {
        key: 'order',
        label: 'Orden',
        sortable: true,
        hideOnMobile: true,
    },
    {
        key: 'is_active',
        label: 'Activo',
        sortable: true,
        hideOnMobile: true,
        render: (value) => <StatusBadge value={value ? 'Activo' : 'Inactivo'} type={value ? 'active' : 'inactive'} />,
    },
    {
        key: 'actions',
        label: 'Acciones',
        sortable: false,
        render: (value, row) => (
            <>
                <div className="text-center">
                    <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />
                </div>
            </>
        ),
    },
];
