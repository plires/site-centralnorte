// resources/js/pages/public/picking/components/PickingBudgetStatusAlert.jsx

import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Send, FileEdit, AlertCircle } from 'lucide-react';

/**
 * Obtiene la información de visualización según el estado del presupuesto
 * @param {Object} budget - Presupuesto de picking
 * @returns {Object} - Configuración de icono, texto y estilos
 */
const getStatusInfo = (budget) => {
    const status = budget.status;

    // Aprobado
    if (status === 'approved') {
        return {
            icon: CheckCircle,
            text: '¡Este presupuesto ha sido aprobado! Gracias por tu confianza. Nos pondremos en contacto contigo pronto.',
            alertClass: 'border-green-200 bg-green-50 text-green-800',
            iconClass: 'text-green-600',
        };
    }

    // Rechazado
    if (status === 'rejected') {
        return {
            icon: XCircle,
            text: 'Este presupuesto fue rechazado. Si necesitas una nueva propuesta, contacta con tu vendedor.',
            alertClass: 'border-red-200 bg-red-50 text-red-800',
            iconClass: 'text-red-600',
        };
    }

    // Vencido
    if (status === 'expired' || budget.is_expired) {
        return {
            icon: Clock,
            text: 'Este presupuesto ha vencido. Contacta con tu vendedor para obtener uno actualizado.',
            alertClass: 'border-orange-200 bg-orange-50 text-orange-800',
            iconClass: 'text-orange-600',
        };
    }

    // Enviado y válido
    if (status === 'sent') {
        const validUntil = new Date(budget.valid_until);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((validUntil - now) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) {
            return {
                icon: Clock,
                text: 'Este presupuesto ha vencido.',
                alertClass: 'border-orange-200 bg-orange-50 text-orange-800',
                iconClass: 'text-orange-600',
            };
        }

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
 * Alert que muestra el estado actual del presupuesto de picking
 * @param {Object} budget - Objeto del presupuesto de picking
 * @returns {JSX.Element} - Componente Alert del estado
 */
export default function PickingBudgetStatusAlert({ budget }) {
    const statusInfo = getStatusInfo(budget);
    const StatusIcon = statusInfo.icon;

    return (
        <Alert className={`mb-6 ${statusInfo.alertClass}`}>
            <StatusIcon className={`h-5 w-5 ${statusInfo.iconClass}`} />
            <AlertDescription className="ml-2">{statusInfo.text}</AlertDescription>
        </Alert>
    );
}
