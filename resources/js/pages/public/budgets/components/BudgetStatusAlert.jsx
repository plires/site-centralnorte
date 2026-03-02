// resources/js/pages/public/budgets/components/BudgetStatusAlert.jsx

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CalendarClock, CheckCircle, Clock, FileEdit, Send, XCircle } from 'lucide-react';

/**
 * Obtiene información del estado del presupuesto
 * @param {Object} budget - Objeto del presupuesto
 * @returns {Object} - Información del estado (icon, text, classes)
 */
const getStatusInfo = (budget) => {
    const daysUntilExpiry = budget.days_until_expiry || 0;

    // Si está aprobado
    if (budget.status === 'approved') {
        return {
            icon: CheckCircle,
            text: '¡Gracias! Este presupuesto ha sido aprobado. Nos pondremos en contacto contigo pronto.',
            alertClass: 'border-green-200 bg-green-50 text-green-800',
            iconClass: 'text-green-600',
        };
    }

    // Si está rechazado
    if (budget.status === 'rejected') {
        return {
            icon: XCircle,
            text: 'Este presupuesto fue rechazado.',
            alertClass: 'border-red-200 bg-red-50 text-red-800',
            iconClass: 'text-red-600',
        };
    }

    // Si está vencido
    if (budget.status === 'expired' || budget.is_expired) {
        return {
            icon: AlertTriangle,
            text: 'Este presupuesto ha vencido. Contacta al vendedor si deseas una nueva cotización.',
            alertClass: 'border-red-200 bg-red-50 text-red-800',
            iconClass: 'text-red-600',
        };
    }

    // Si vence hoy
    if (budget.is_expiring_today) {
        return {
            icon: Clock,
            text: '¡Atención! Este presupuesto vence hoy. Aprovecha para revisarlo y tomar una decisión.',
            alertClass: 'border-orange-200 bg-orange-50 text-orange-800',
            iconClass: 'text-orange-600',
        };
    }

    // Si vence pronto (3 días o menos)
    if (daysUntilExpiry > 0 && daysUntilExpiry <= 3) {
        const dayText = daysUntilExpiry === 1 ? 'día' : 'días';
        return {
            icon: CalendarClock,
            text: `Este presupuesto vence en ${daysUntilExpiry} ${dayText}. Te recomendamos revisarlo pronto.`,
            alertClass: 'border-orange-200 bg-orange-50 text-orange-800',
            iconClass: 'text-orange-600',
        };
    }

    // Estado normal - enviado y vigente
    if (budget.status === 'sent') {
        const dayText = daysUntilExpiry === 1 ? 'día' : 'días';
        return {
            icon: Send,
            text: `Este presupuesto está vigente. Tienes ${daysUntilExpiry} ${dayText} para revisarlo.`,
            alertClass: 'border-blue-200 bg-blue-50 text-blue-800',
            iconClass: 'text-blue-600',
        };
    }

    // Fallback
    return {
        icon: FileEdit,
        text: 'Presupuesto disponible para tu revisión.',
        alertClass: 'border-gray-200 bg-gray-50 text-gray-800',
        iconClass: 'text-gray-600',
    };
};

/**
 * Alert que muestra el estado actual del presupuesto
 * @param {Object} budget - Objeto del presupuesto
 * @returns {JSX.Element} - Componente Alert del estado
 */
export default function BudgetStatusAlert({ budget }) {
    const statusInfo = getStatusInfo(budget);
    const StatusIcon = statusInfo.icon;

    return (
        <Alert className={`mb-6 ${statusInfo.alertClass}`}>
            <StatusIcon className={`h-5 w-5 ${statusInfo.iconClass}`} />
            <AlertDescription className="ml-2">{statusInfo.text}</AlertDescription>
        </Alert>
    );
}
