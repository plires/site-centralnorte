// resources/js/pages/dashboard/picking/components/PickingInfoSection.jsx

import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Package, PackagePlus, User } from 'lucide-react';

/**
 * Grid de tarjetas informativas del encabezado de un presupuesto de picking.
 * Muestra: Cliente, Vendedor, Fecha, Tipo de Armado, Total de Kits, Componentes por Kit.
 */
export default function PickingInfoSection({ budget }) {
    const assemblyService = budget.services?.find((s) => s.service_type === 'assembly');

    return (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card className={budget?.client?.deleted_at ? 'border-2 border-red-800' : ''}>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                            <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Cliente</p>
                            <p className={`font-semibold ${budget?.client?.deleted_at ? 'text-red-800' : ''}`}>
                                {budget?.client?.deleted_at ? `${budget.client.name} - No disponible` : budget.client.name}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className={budget?.vendor?.deleted_at ? 'border-2 border-red-800' : ''}>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                            <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Vendedor</p>
                            <p className={`font-semibold ${budget?.vendor?.deleted_at ? 'text-red-800' : ''}`}>
                                {budget?.vendor?.deleted_at ? `${budget.vendor.name} - No disponible` : budget.vendor.name}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                            <Calendar className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Fecha</p>
                            <p className="font-semibold">{new Date(budget.created_at).toLocaleDateString('es-AR')}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                            <Package className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Tipo de Armado</p>
                            {assemblyService ? (
                                <p className="font-semibold">{assemblyService.service_description}</p>
                            ) : (
                                <p className="text-sm text-gray-500">No especificado</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                            <Package className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total de Kits</p>
                            <p className="font-semibold">{budget.total_kits.toLocaleString('es-AR')}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                            <PackagePlus className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Componentes por Kit</p>
                            <p className="font-semibold">{budget.total_components_per_kit}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
