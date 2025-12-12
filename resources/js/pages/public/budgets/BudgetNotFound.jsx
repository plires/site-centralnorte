// resources/js/pages/public/budgets/BudgetNotFound.jsx

import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
    FileX, 
    Clock, 
    XCircle, 
    CheckCircle, 
    FileEdit, 
    Send,
    Home,
    RefreshCcw,
    Mail
} from 'lucide-react';

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
 * Página de presupuesto no encontrado o no disponible
 * @param {Object} props
 * @param {string} props.message - Mensaje personalizado (opcional)
 * @param {string} props.reason - Razón del estado (not_found, expired, rejected, approved, etc.)
 * @param {string} props.status - Estado actual del presupuesto (opcional)
 */
export default function BudgetNotFound({ message, reason = 'not_found', status }) {
    const config = statusConfig[reason] || statusConfig.not_found;
    const StatusIcon = config.icon;
    const displayMessage = message || config.description;

    // Obtener nombre de la empresa desde .env
    const appName = import.meta.env.VITE_APP_NAME || 'Central Norte';

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Head title="Presupuesto no disponible" />

            {/* Header de la empresa */}
            <div className="border-b-2 bg-white shadow-sm">
                <div className="mx-auto max-w-4xl px-4 py-6">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 sm:h-12 sm:w-12">
                                <svg className="h-8 w-8 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="text-center sm:text-left">
                                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{appName}</h1>
                                <p className="text-sm text-gray-600">Presupuesto Empresarial</p>
                            </div>
                        </div>
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
                            <h2 className={`mb-3 text-2xl font-bold ${config.isSuccess ? 'text-green-700' : 'text-gray-900'}`}>
                                {config.title}
                            </h2>

                            {/* Descripción */}
                            <p className="mb-4 text-gray-600">
                                {displayMessage}
                            </p>

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
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.href = '/'}
                                    className="flex items-center gap-2"
                                >
                                    <Home className="h-4 w-4" />
                                    Ir al inicio
                                </Button>

                                {!config.isSuccess && (
                                    <Button
                                        variant="default"
                                        onClick={() => window.location.reload()}
                                        className="flex items-center gap-2"
                                    >
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
            <div className="border-t bg-white py-4">
                <div className="mx-auto max-w-4xl px-4 text-center text-sm text-gray-500">
                    <p>
                        ¿Tienes dudas? Contacta a nuestro equipo de ventas.
                    </p>
                </div>
            </div>
        </div>
    );
}
