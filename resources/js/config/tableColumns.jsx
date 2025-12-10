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
        label: 'Vigencia',
        sortable: false,
        render: (value, row) => (
            <div className="text-center">
                <BudgetStatusBadge status={row.status} statusText={row.status_text} showIcon={true} size="xs" />
            </div>
        ),
    },
    {
        key: 'is_active',
        label: 'Estado',
        sortable: true,
        hideOnMobile: true,
        render: (value, row) => (
            <div className="text-center">
                <StatusBadge value={value ? 'Activo' : 'Inactivo'} type={value ? 'active' : 'inactive'} />
            </div>
        ),
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

export const slidesColumns = (actions, isDeleting = false, stats = {}) => [
    {
        key: 'sort_order',
        label: 'Orden',
        sortable: true,
        render: (value) => <span className="font-mono text-sm text-gray-500">#{value}</span>,
    },
    {
        key: 'image_desktop_url',
        label: 'Preview',
        render: (value, row) => (
            <div className="flex items-center gap-2">
                {value ? (
                    <img src={value} alt={row.title} className="h-12 w-20 rounded border object-cover" />
                ) : (
                    <div className="flex h-12 w-20 items-center justify-center rounded border bg-gray-100">
                        <Images className="h-5 w-5 text-gray-400" />
                    </div>
                )}
            </div>
        ),
    },
    {
        key: 'title',
        label: 'Título',
        sortable: true,
        render: (value) => <span className="font-medium">{value}</span>,
    },
    {
        key: 'link',
        label: 'Enlace',
        render: (value) =>
            value ? (
                <span className="max-w-[200px] truncate text-sm text-blue-600">{value}</span>
            ) : (
                <span className="text-sm text-gray-400">Sin enlace</span>
            ),
    },
    {
        key: 'is_active',
        label: 'Estado',
        sortable: true,
        render: (value) => <Badge variant={value ? 'success' : 'secondary'}>{value ? 'Activo' : 'Inactivo'}</Badge>,
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
        render: (value, row) => <div className="text-center">{value}</div>,
    },
    {
        key: 'role',
        label: 'Rol',
        sortable: false,
        hideOnMobile: true,
        render: (value, row) => {
            const roleName = row.role?.name;

            if (!roleName) {
                return (
                    <div className="text-center">
                        <span className="text-gray-400 italic">Sin rol</span>
                    </div>
                );
            }

            return (
                <div className="text-center">
                    <StatusBadge value={roleName} type={roleName} />
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
        render: (value) => <div className="text-center">{value}</div>,
    },
    {
        key: 'created_at',
        label: 'Fecha de Creación',
        sortable: true,
        hideOnMobile: true,
        truncate: true,
        render: (value) => <div className="text-center">{timeAgo(value)}</div>,
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
        render: (value) => <div className="text-center">{timeAgo(value)}</div>,
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

export const productColumns = (actions, isDeleting = false, placeholderImage) => [
    {
        key: 'featured_image',
        label: 'Imagen',
        sortable: false,
        render: (value, row) => {
            const imageUrl = row.featured_image?.full_url || placeholderImage;
            return (
                <div className="flex justify-center">
                    <img
                        src={imageUrl}
                        alt={row.name}
                        className="h-12 w-12 rounded-md object-cover"
                        onError={(e) => {
                            e.target.src = placeholderImage;
                        }}
                    />
                </div>
            );
        },
    },
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
        truncate: true,
        render: (value, row) => {
            // Mostrar múltiples categorías
            if (!row.category_names || row.category_names.length === 0) {
                return <span className="text-gray-400 italic">Sin categoría</span>;
            }

            return (
                <div className="flex flex-wrap gap-1">
                    {row.category_names.map((categoryName, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                            {categoryName}
                        </Badge>
                    ))}
                </div>
            );
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
        render: (value, row) => (
            <div className="text-center">
                <ActionsDropdown row={row} actions={actions} isDeleting={isDeleting} />
            </div>
        ),
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
        key: 'show',
        label: 'Visible',
        sortable: true,
        render: (value) => (
            <div className="flex justify-center">
                {value ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
            </div>
        ),
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
        key: 'products_count',
        label: 'Productos Asociados',
        sortable: false,
        hideOnMobile: true,
        truncate: true,
        render: (value) => <div className="flex justify-center">{value}</div>,
    },
    {
        key: 'actions',
        label: 'Acciones',
        render: (value, row) => {
            const { is_external } = row.origin_config;

            return (
                <div className="text-center">
                    <ActionsDropdown isExternal={is_external} row={row} actions={actions} isDeleting={isDeleting} />
                </div>
            );
        },
    },
];
