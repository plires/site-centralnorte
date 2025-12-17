// resources/js/components/BudgetStatusBadge.jsx
// Componente global de badge de estado para presupuestos (merch y picking)

import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, FileEdit, FileText, Send, XCircle } from 'lucide-react';

// NOTA IMPORTANTE:
// La configuración del estado "expired" en statusConfig DEBE permanecer porque
// el badge todavía necesita renderizar correctamente cuando un presupuesto
// tiene status='expired' (por ejemplo, cuando se vence automáticamente).
//
// Solo estamos eliminando "expired" de budgetStatusOptions para que NO aparezca
// en los selectores/dropdowns donde el usuario cambia manualmente el estado.
const statusConfig = {
    unsent: {
        label: 'Sin enviar',
        variant: 'secondary',
        icon: FileEdit,
        className: 'bg-slate-100 text-slate-800 border-slate-200',
    },
    draft: {
        label: 'Borrador',
        variant: 'secondary',
        icon: FileText,
        className: 'bg-gray-100 text-gray-800 border-gray-200',
    },
    sent: {
        label: 'Enviado',
        variant: 'default',
        icon: Send,
        className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    approved: {
        label: 'Aprobado',
        variant: 'success',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200',
    },
    rejected: {
        label: 'Rechazado',
        variant: 'destructive',
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200',
    },
    expired: {
        label: 'Vencido',
        variant: 'warning',
        icon: Clock,
        className: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    // Estados de vigencia (legacy, para compatibilidad con status_text anterior)
    active: {
        label: 'Vigente',
        variant: 'success',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200',
    },
    expiring_soon: {
        label: 'Por vencer',
        variant: 'warning',
        icon: AlertTriangle,
        className: 'bg-orange-100 text-orange-800 border-orange-200',
    },
};

/**
 * Badge de estado para presupuestos
 *
 * @param {Object} props
 * @param {string} props.status - Estado del presupuesto
 * @param {string} [props.statusText] - Texto personalizado del estado (opcional)
 * @param {boolean} [props.showIcon=true] - Mostrar icono
 * @param {string} [props.size='sm'] - Tamaño: 'xs', 'sm', 'default', 'lg'
 * @param {string} [props.className] - Clases adicionales
 */
export default function BudgetStatusBadge({ status, statusText, showIcon = true, size = 'sm', className = '' }) {
    const config = statusConfig[status] || statusConfig.unsent;
    const Icon = config.icon;
    const displayText = statusText || config.label;

    const sizeClasses = {
        xs: 'px-1.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    const iconSizes = {
        xs: 'h-3 w-3',
        sm: 'h-3 w-3',
        default: 'h-3.5 w-3.5',
        lg: 'h-4 w-4',
    };

    return (
        <Badge
            variant="outline"
            className={`inline-flex items-center gap-1 border font-medium ${config.className} ${sizeClasses[size]} ${className}`}
        >
            {showIcon && <Icon className={iconSizes[size]} />}
            {displayText}
        </Badge>
    );
}

/**
 * Helpers exportados para uso externo
 */
export const budgetStatusOptions = [
    { value: 'unsent', label: 'Sin enviar' },
    { value: 'draft', label: 'Borrador' },
    { value: 'sent', label: 'Enviado' },
    { value: 'approved', label: 'Aprobado' },
    { value: 'rejected', label: 'Rechazado' },
];

export const getStatusConfig = (status) => statusConfig[status] || statusConfig.unsent;
export const isEditableStatus = (status) => ['unsent', 'draft', 'sent'].includes(status);
export const canSendStatus = (status) => ['unsent', 'draft'].includes(status);
export const isPubliclyVisibleStatus = (status) => ['sent', 'approved', 'rejected', 'expired'].includes(status);
