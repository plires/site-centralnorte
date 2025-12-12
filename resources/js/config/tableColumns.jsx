// resources/js/config/tableColumns.jsx

import ActionsDropdown from '@/components/ActionsDropdown';
import BudgetStatusBadge from '@/components/BudgetStatusBadge';
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
        label: 'Estado',
        sortable: true,
        render: (value, row) => (
            <div className="text-center">
                <BudgetStatusBadge 
                    status={row.status} 
                    showIcon={true} 
                    size="xs" 
                />
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

export const usersColumns = (actions, isDeleting = false) => [
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
        label: '',
        sortable: false,
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
        hideOnMobile: true,
        render: (value) => value || '-',
    },
    {
        key: 'email',
        label: 'Email',
        sortable: true,
        hideOnMobile: true,
    },
    {
        key: 'phone',
        label: 'Teléfono',
        sortable: false,
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
        label: '',
        sortable: false,
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
        label: '',
        sortable: false,
        render: (value, row) => <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />,
    },
];

export const categoriesColumns = (actions, isDeleting = false) => [
    {
        key: 'name',
        label: 'Nombre',
        sortable: true,
    },
    {
        key: 'slug',
        label: 'Slug',
        sortable: true,
        hideOnMobile: true,
    },
    {
        key: 'is_visible',
        label: 'Visible',
        sortable: true,
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
        key: 'actions',
        label: '',
        sortable: false,
        render: (value, row) => <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />,
    },
];

export const productsColumns = (actions, isDeleting = false) => [
    {
        key: 'featured_image',
        label: '',
        sortable: false,
        render: (value, row) => {
            const imageUrl = row.featured_image?.thumbnail_url || row.featured_image?.url;
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
        hideOnMobile: true,
        render: (value, row) => {
            const cats = row.categories || [];
            if (cats.length === 0) return '-';
            return cats.map((c) => c.name).join(', ');
        },
    },
    {
        key: 'stock',
        label: 'Stock',
        sortable: true,
        hideOnMobile: true,
        render: (value) => {
            const stockValue = parseInt(value) || 0;
            const colorClass = stockValue > 10 ? 'text-green-600' : stockValue > 0 ? 'text-orange-600' : 'text-red-600';
            return <span className={colorClass}>{stockValue}</span>;
        },
    },
    {
        key: 'source',
        label: 'Origen',
        sortable: true,
        hideOnMobile: true,
        render: (value) => (
            <Badge variant="outline" className="text-xs">
                {value === 'zecat' ? 'Zecat' : 'Local'}
            </Badge>
        ),
    },
    {
        key: 'actions',
        label: '',
        sortable: false,
        render: (value, row) => <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />,
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
        label: '',
        sortable: false,
        render: (value, row) => <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />,
    },
];
