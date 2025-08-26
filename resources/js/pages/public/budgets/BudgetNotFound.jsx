import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { AlertTriangle, ExternalLink, Home, Lock, Search } from 'lucide-react';

export default function BudgetNotFound({ message = null, reason = 'not_found' }) {
    const getErrorInfo = () => {
        switch (reason) {
            case 'inactive':
                return {
                    icon: Lock,
                    title: 'Presupuesto No Disponible',
                    description: 'Este presupuesto ha sido desactivado temporalmente y no está disponible para visualización.',
                    bgColor: 'bg-amber-50',
                    borderColor: 'border-amber-200',
                    iconColor: 'text-amber-600',
                    titleColor: 'text-amber-900',
                };
            case 'expired':
                return {
                    icon: AlertTriangle,
                    title: 'Presupuesto Vencido',
                    description: 'Este presupuesto ha expirado y ya no está disponible.',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    iconColor: 'text-red-600',
                    titleColor: 'text-red-900',
                };
            case 'not_found':
            default:
                return {
                    icon: Search,
                    title: 'Presupuesto No Encontrado',
                    description: 'El presupuesto que estás buscando no existe o ha sido eliminado.',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    iconColor: 'text-gray-600',
                    titleColor: 'text-gray-900',
                };
        }
    };

    const errorInfo = getErrorInfo();
    const IconComponent = errorInfo.icon;

    const handleGoHome = () => {
        window.location.href = '/';
    };

    const handleContactSupport = () => {
        // Aquí podrías agregar lógica para contactar soporte
        // Por ejemplo, abrir un mailto o redirigir a una página de contacto
        window.location.href = 'mailto:soporte@ejemplo.com?subject=Problema con presupuesto';
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <Head title="Presupuesto No Disponible" />

            <div className="w-full max-w-md">
                {/* Logo o header de la empresa */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
                        <IconComponent className={`h-8 w-8 ${errorInfo.iconColor}`} />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-gray-900">Central Norte</h1>
                    <p className="text-sm text-gray-600">Merchandising & Productos Promocionales</p>
                </div>

                {/* Card principal de error */}
                <Card className={`${errorInfo.bgColor} ${errorInfo.borderColor} border-2`}>
                    <CardHeader className="pb-4 text-center">
                        <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm`}>
                            <IconComponent className={`h-10 w-10 ${errorInfo.iconColor}`} />
                        </div>
                        <CardTitle className={`text-xl ${errorInfo.titleColor}`}>{errorInfo.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-center">
                        <p className="leading-relaxed text-gray-700">{message || errorInfo.description}</p>

                        {reason === 'inactive' && (
                            <div className="rounded-lg border border-amber-200 bg-white p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                                    <div className="text-left">
                                        <h4 className="mb-1 font-medium text-amber-900">¿Necesitas ayuda?</h4>
                                        <p className="text-sm text-amber-800">
                                            Si crees que esto es un error, contacta a tu vendedor o a nuestro equipo de soporte.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {reason === 'not_found' && (
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <h4 className="mb-2 font-medium text-gray-900">Posibles causas:</h4>
                                <ul className="space-y-1 text-left text-sm text-gray-600">
                                    <li>• El enlace puede haber expirado</li>
                                    <li>• La URL fue copiada incorrectamente</li>
                                    <li>• El presupuesto fue eliminado</li>
                                </ul>
                            </div>
                        )}

                        <div className="space-y-3 pt-4">
                            <Button onClick={handleGoHome} className="w-full" size="lg">
                                <Home className="mr-2 h-4 w-4" />
                                Ir a Página Principal
                            </Button>

                            <Button onClick={handleContactSupport} variant="outline" className="w-full" size="lg">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Contactar Soporte
                            </Button>
                        </div>

                        <div className="border-t border-gray-200 pt-4 text-xs text-gray-500">
                            Si el problema persiste, guarda esta URL y compártela con nuestro equipo de soporte.
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-gray-500">
                    <p>© 2025 Central Norte. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    );
}
