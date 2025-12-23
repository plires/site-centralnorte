// resources/js/pages/public/picking/components/PickingBudgetInfoCard.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, User, Calendar, Clock, Box } from 'lucide-react';

/**
 * Card con información básica del presupuesto de picking
 * @param {Object} budget - Objeto del presupuesto de picking
 * @returns {JSX.Element} - Componente Card de información
 */
export default function PickingBudgetInfoCard({ budget }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Información del Presupuesto
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {/* Cliente */}
                    <div className="flex items-start gap-3">
                        <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-gray-700">Cliente:</p>
                            <p className="text-gray-900">{budget.client?.name || 'N/A'}</p>
                            {budget.client?.company && (
                                <p className="text-xs text-gray-500">{budget.client.company}</p>
                            )}
                        </div>
                    </div>

                    {/* Vendedor */}
                    <div className="flex items-start gap-3">
                        <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-gray-700">Vendedor:</p>
                            <p className="text-gray-900">{budget.vendor?.name || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Fecha de emisión */}
                    <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-gray-700">Fecha de emisión:</p>
                            <p className="text-gray-900">{formatDate(budget.created_at)}</p>
                        </div>
                    </div>

                    {/* Fecha de vencimiento */}
                    <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-gray-700">Válido hasta:</p>
                            <p className="text-gray-900">{formatDate(budget.valid_until)}</p>
                        </div>
                    </div>

                    {/* Cantidad de kits */}
                    <div className="flex items-start gap-3">
                        <Box className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-gray-700">Cantidad de kits:</p>
                            <p className="text-gray-900">{budget.total_kits?.toLocaleString('es-AR') || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Componentes por kit */}
                    <div className="flex items-start gap-3">
                        <Package className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-gray-700">Componentes por kit:</p>
                            <p className="text-gray-900">{budget.total_components_per_kit || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Tiempo de producción */}
                    <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-gray-700">Tiempo de producción:</p>
                            <p className="text-gray-900">{budget.production_time || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
