// resources/js/pages/public/components/BudgetNotFound.jsx

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { CheckCircle, Clock, FileEdit, FileX, Home, Mail, RefreshCcw, Send, XCircle } from 'lucide-react';

/**
 * Configuración de estados para la página de "no encontrado"
 */
const statusConfig = {
    not_found: {
        icon: FileX,
        title: 'Presupuesto no encontrado',
        description: 'El presupuesto que buscas no existe o ha sido eliminado.',
        iconBgColor: 'bg-gray-100',
        iconColor: 'text-gray-600',
    },
    not_sent: {
        icon: FileEdit,
        title: 'Presupuesto no disponible',
        description: 'Este presupuesto aún no ha sido enviado. Por favor, contacta al vendedor.',
        iconBgColor: 'bg-slate-100',
        iconColor: 'text-slate-600',
    },
    unsent: {
        icon: FileEdit,
        title: 'Presupuesto no disponible',
        description: 'Este presupuesto aún no ha sido enviado. Por favor, contacta al vendedor.',
        iconBgColor: 'bg-slate-100',
        iconColor: 'text-slate-600',
    },
    draft: {
        icon: FileEdit,
        title: 'Presupuesto en borrador',
        description: 'Este presupuesto está en borrador y no está disponible.',
        iconBgColor: 'bg-gray-100',
        iconColor: 'text-gray-600',
    },
    expired: {
        icon: Clock,
        title: 'Presupuesto vencido',
        description: 'Este presupuesto ha superado su fecha de validez y ya no está disponible.',
        iconBgColor: 'bg-orange-100',
        iconColor: 'text-orange-600',
        suggestion: 'Puedes contactar al vendedor para solicitar una nueva cotización actualizada.',
    },
    rejected: {
        icon: XCircle,
        title: 'Presupuesto rechazado',
        description: 'Este presupuesto fue rechazado y ya no está disponible para visualización.',
        iconBgColor: 'bg-red-100',
        iconColor: 'text-red-600',
        suggestion: 'Si cambiaste de opinión, contacta al vendedor para discutir nuevas opciones.',
    },
    approved: {
        icon: CheckCircle,
        title: '¡Presupuesto aprobado!',
        description: 'Gracias por aprobar este presupuesto. Nuestro equipo se pondrá en contacto contigo pronto.',
        iconBgColor: 'bg-green-100',
        iconColor: 'text-green-600',
        isSuccess: true,
    },
    inactive: {
        icon: FileX,
        title: 'Presupuesto inactivo',
        description: 'Este presupuesto ha sido desactivado temporalmente.',
        iconBgColor: 'bg-gray-100',
        iconColor: 'text-gray-600',
    },
    not_visible: {
        icon: Send,
        title: 'Presupuesto no disponible',
        description: 'Este presupuesto no está disponible para visualización pública.',
        iconBgColor: 'bg-blue-100',
        iconColor: 'text-blue-600',
    },
};

/**
 * Componente unificado para presupuestos no disponibles
 * Funciona tanto para presupuestos de Merch como de Picking
 *
 * @param {Object} props
 * @param {string} props.message - Mensaje personalizado (opcional)
 * @param {string} props.reason - Razón del estado (not_found, expired, rejected, approved, etc.)
 * @param {string} props.status - Estado actual del presupuesto (opcional)
 */
export default function BudgetNotFound({ message, reason = 'not_found', status }) {
    const config = statusConfig[reason] || statusConfig.not_found;
    const StatusIcon = config.icon;
    const displayMessage = message || config.description;

    // Obtener nombre de la empresa y color primario desde .env
    const appName = import.meta.env.VITE_APP_NAME || 'Central Norte';
    const primaryColor = import.meta.env.VITE_PRIMARY_COLOR || '#3d5095';
    const secondaryColor = import.meta.env.VITE_SECONDARY_COLOR || '#19ac90';

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Head title="Presupuesto no disponible" />

            {/* Header de la empresa con color primario */}
            <div className="border-b" style={{ backgroundColor: primaryColor }}>
                <div className="mx-auto max-w-4xl px-4 py-8">
                    <div className="flex items-center justify-center gap-4">
                        <img src="/images/logo-publico-horizontal.png" alt="Logo" className="w-auto" />
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="flex flex-1 items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            {/* Icono */}
                            <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${config.iconBgColor}`}>
                                <StatusIcon className={`h-10 w-10 ${config.iconColor}`} />
                            </div>

                            {/* Título */}
                            <h2 className={`mb-3 text-2xl font-bold ${config.isSuccess ? 'text-green-700' : 'text-gray-900'}`}>{config.title}</h2>

                            {/* Descripción */}
                            <p className="mb-4 text-gray-600">{displayMessage}</p>

                            {/* Sugerencia adicional */}
                            {config.suggestion && (
                                <div className="mb-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                                    <p>{config.suggestion}</p>
                                </div>
                            )}

                            {/* Mensaje de éxito adicional para aprobados */}
                            {config.isSuccess && (
                                <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">
                                    <p className="flex items-center justify-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Recibirás un email con los detalles de los próximos pasos.
                                    </p>
                                </div>
                            )}

                            {/* Botones de acción */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <Button variant="outline" onClick={() => (window.location.href = '/')} className="flex items-center gap-2">
                                    <Home className="h-4 w-4" />
                                    Ir al inicio
                                </Button>

                                {!config.isSuccess && (
                                    <Button variant="default" onClick={() => window.location.reload()} className="flex items-center gap-2">
                                        <RefreshCcw className="h-4 w-4" />
                                        Reintentar
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Footer */}
            <div className="border-t bg-white py-4" style={{ backgroundColor: secondaryColor }}>
                <div className="mx-auto max-w-4xl px-4 text-center text-sm text-white">
                    <p>¿Tienes dudas? Contacta a nuestro equipo de ventas.</p>
                </div>
            </div>
        </div>
    );
}
