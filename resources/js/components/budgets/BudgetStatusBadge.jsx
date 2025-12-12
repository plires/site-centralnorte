import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FileEdit, FileText, Send, CheckCircle, XCircle, Clock } from 'lucide-react';

/**
 * Configuración de estados de presupuesto
 * Unificado para Budget (merch) y PickingBudget
 */
const statusConfig = {
    unsent: {
        label: 'Sin enviar',
        color: 'bg-slate-100 text-slate-800 border-slate-200',
        icon: FileEdit,
    },
    draft: {
        label: 'Borrador',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: FileText,
    },
    sent: {
        label: 'Enviado',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Send,
    },
    approved: {
        label: 'Aprobado',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
    },
    rejected: {
        label: 'Rechazado',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
    },
    expired: {
        label: 'Vencido',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Clock,
    },
};

/**
 * Badge de estado para presupuestos
 * 
 * @param {Object} props
 * @param {string} props.status - Estado del presupuesto (unsent, draft, sent, approved, rejected, expired)
 * @param {string} [props.label] - Etiqueta personalizada (opcional, usa la del config si no se provee)
 * @param {boolean} [props.showIcon=true] - Mostrar icono
 * @param {string} [props.size='default'] - Tamaño: 'sm', 'default', 'lg'
 * @param {string} [props.className] - Clases adicionales
 */
export function BudgetStatusBadge({ 
    status, 
    label, 
    showIcon = true, 
    size = 'default',
    className 
}) {
    const config = statusConfig[status] || statusConfig.unsent;
    const Icon = config.icon;
    
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    const iconSizes = {
        sm: 'h-3 w-3',
        default: 'h-3.5 w-3.5',
        lg: 'h-4 w-4',
    };

    return (
        <Badge 
            variant="outline"
            className={cn(
                'inline-flex items-center gap-1.5 font-medium border',
                config.color,
                sizeClasses[size],
                className
            )}
        >
            {showIcon && <Icon className={iconSizes[size]} />}
            {label || config.label}
        </Badge>
    );
}

/**
 * Dropdown/Select de estados para que el vendedor cambie el estado
 */
export const budgetStatusOptions = [
    { value: 'unsent', label: 'Sin enviar' },
    { value: 'draft', label: 'Borrador' },
    { value: 'sent', label: 'Enviado' },
    { value: 'approved', label: 'Aprobado' },
    { value: 'rejected', label: 'Rechazado' },
    { value: 'expired', label: 'Vencido' },
];

/**
 * Helper para obtener la configuración de un estado
 */
export function getStatusConfig(status) {
    return statusConfig[status] || statusConfig.unsent;
}

/**
 * Helper para verificar si un estado permite edición
 */
export function isEditableStatus(status) {
    return ['unsent', 'draft'].includes(status);
}

/**
 * Helper para verificar si un estado permite envío
 */
export function canSendStatus(status) {
    return ['unsent', 'draft', 'rejected'].includes(status);
}

/**
 * Helper para verificar si es visible públicamente
 */
export function isPubliclyVisibleStatus(status) {
    return status === 'sent';
}

export default BudgetStatusBadge;
