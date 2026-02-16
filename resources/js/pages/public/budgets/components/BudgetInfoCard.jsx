// resources/js/pages/public/components/BudgetInfoCard.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Package, User } from 'lucide-react';

/**
 * Card con información básica del presupuesto
 * @param {Object} budget - Objeto del presupuesto
 * @returns {JSX.Element} - Componente Card de información
 */
export default function BudgetInfoCard({ budget }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
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
                <div className="grid grid-cols-2 gap-4 text-sm">
                    {/* Fecha de emisión */}
                    <div className="flex items-start gap-3">
                        <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                        <div>
                            <p className="font-medium text-gray-700">Fecha de emisión:</p>
                            <p className="text-gray-900">{formatDate(budget.issue_date)}</p>
                        </div>
                    </div>

                    {/* Fecha de vencimiento */}
                    <div className="flex items-start gap-3">
                        <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                        <div>
                            <p className="font-medium text-gray-700">Válido hasta:</p>
                            <p className="text-gray-900">{formatDate(budget.expiry_date)}</p>
                        </div>
                    </div>

                    {/* Cliente */}
                    <div className="flex items-start gap-3">
                        <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                        <div>
                            <p className="font-medium text-gray-700">Cliente:</p>
                            <p className="text-gray-900">{budget.client?.name || 'N/A'}</p>
                            {budget.client?.company && <p className="text-xs text-gray-500">{budget.client.company}</p>}
                        </div>
                    </div>

                    {/* Vendedor */}
                    <div className="flex items-start gap-3">
                        <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                        <div>
                            <p className="font-medium text-gray-700">Vendedor:</p>
                            <p className="text-gray-900">{budget.user?.name || 'Central Norte'}</p>
                            {budget.user?.email && (
                                <a href={`mailto:${budget.user.email}`} className="text-xs text-blue-600 hover:underline">
                                    {budget.user.email}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
                {budget.user?.email && (
                    <p className="mt-4 text-sm text-gray-600">
                        Si tenés alguna pregunta, no dudes en contactar a tu vendedor en{' '}
                        <a href={`mailto:${budget.user.email}`} className="text-blue-600 hover:underline">
                            {budget.user.email}
                        </a>
                        .
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
