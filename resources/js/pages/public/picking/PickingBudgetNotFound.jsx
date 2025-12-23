// resources/js/pages/public/picking/PickingBudgetNotFound.jsx

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

/**
 * Página para presupuesto de picking no encontrado o no disponible
 * @param {string} message - Mensaje a mostrar
 * @param {string} reason - Razón del error (not_found, expired, approved, rejected, not_sent)
 */
export default function PickingBudgetNotFound({ message, reason = 'not_found' }) {
    console.log(message, reason);
    const appName = import.meta.env.VITE_APP_NAME || 'Central Norte';

    // Configuración de iconos y colores según razón
    const config = {
        not_found: {
            Icon: XCircle,
            color: 'red',
            bgClass: 'bg-red-50 border-red-200',
            iconClass: 'text-red-600',
            textClass: 'text-red-800',
            title: 'Presupuesto no encontrado',
        },
        expired: {
            Icon: Clock,
            color: 'orange',
            bgClass: 'bg-orange-50 border-orange-200',
            iconClass: 'text-orange-600',
            textClass: 'text-orange-800',
            title: 'Presupuesto vencido',
        },
        approved: {
            Icon: CheckCircle,
            color: 'green',
            bgClass: 'bg-green-50 border-green-200',
            iconClass: 'text-green-600',
            textClass: 'text-green-800',
            title: 'Presupuesto ya aprobado',
        },
        rejected: {
            Icon: XCircle,
            color: 'gray',
            bgClass: 'bg-gray-50 border-gray-200',
            iconClass: 'text-gray-600',
            textClass: 'text-gray-800',
            title: 'Presupuesto rechazado',
        },
        not_sent: {
            Icon: AlertCircle,
            color: 'blue',
            bgClass: 'bg-blue-50 border-blue-200',
            iconClass: 'text-blue-600',
            textClass: 'text-blue-800',
            title: 'Presupuesto no disponible',
        },
        not_visible: {
            Icon: AlertCircle,
            color: 'gray',
            bgClass: 'bg-gray-50 border-gray-200',
            iconClass: 'text-gray-600',
            textClass: 'text-gray-800',
            title: 'Presupuesto no disponible',
        },
    };

    const currentConfig = config[reason] || config.not_found;
    const Icon = currentConfig.Icon;

    return (
        <>
            <Head title={currentConfig.title} />

            {/* Header */}
            <div className="border-b bg-gradient-to-r from-blue-600 to-blue-700">
                <div className="mx-auto max-w-4xl px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-xl font-bold text-white sm:text-2xl">{appName}</h1>
                        <p className="text-sm text-blue-100">Presupuesto de Picking/Armado de Kit</p>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="mx-auto max-w-2xl px-4 py-12">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                            <div className={`rounded-full p-4 ${currentConfig.bgClass}`}>
                                <Icon className={`h-12 w-12 ${currentConfig.iconClass}`} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-gray-900">{currentConfig.title}</h2>
                                <p className="text-gray-600">{message}</p>
                            </div>

                            {/* Mensaje adicional según el tipo */}
                            {reason === 'expired' && (
                                <Alert className={currentConfig.bgClass}>
                                    <AlertDescription className={currentConfig.textClass}>
                                        Este presupuesto ya no está disponible para aprobación. Si necesitas un nuevo presupuesto, contacta con
                                        nuestro equipo de ventas.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {reason === 'approved' && (
                                <Alert className={currentConfig.bgClass}>
                                    <AlertDescription className={currentConfig.textClass}>
                                        ¡Gracias por aprobar este presupuesto! Nuestro equipo se pondrá en contacto contigo pronto.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {reason === 'not_sent' && (
                                <Alert className={currentConfig.bgClass}>
                                    <AlertDescription className={currentConfig.textClass}>
                                        Este presupuesto aún no ha sido enviado oficialmente. Espera a que el vendedor lo envíe para poder
                                        visualizarlo.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Información de contacto */}
                            <div className="mt-8 rounded-lg bg-gray-50 p-6">
                                <h3 className="mb-2 text-sm font-semibold text-gray-900">¿Necesitas ayuda?</h3>
                                <p className="text-sm text-gray-600">Contacta con nuestro equipo para obtener asistencia con tu presupuesto.</p>
                                <div className="mt-4 space-y-1 text-sm text-gray-700">
                                    <p>
                                        Email:{' '}
                                        <a
                                            href={`mailto:${import.meta.env.VITE_COMPANY_EMAIL || 'info@centralnortesrl.com'}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {import.meta.env.VITE_COMPANY_EMAIL || 'info@centralnortesrl.com'}
                                        </a>
                                    </p>
                                    <p>
                                        Teléfono:{' '}
                                        <a
                                            href={`tel:${import.meta.env.VITE_COMPANY_PHONE || '+541124797281'}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {import.meta.env.VITE_COMPANY_PHONE || '+54 11 2479-7281'}
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
