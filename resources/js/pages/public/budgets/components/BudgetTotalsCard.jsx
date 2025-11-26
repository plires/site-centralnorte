// resources/js/pages/public/components/BudgetTotalsCard.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/budget/budgetUtils';
import { TrendingDown, TrendingUp } from 'lucide-react';

/**
 * Card con el resumen de totales del presupuesto
 * @param {Object} calculatedTotals - Totales calculados
 * @param {number} ivaRate - Tasa de IVA
 * @param {boolean} applyIva - Si aplica IVA
 * @returns {JSX.Element} - Componente Card de totales
 */

// Formatear porcentaje
const formatPercentage = (percentage) => {
    const value = parseFloat(percentage);
    if (value === 0) return '0%';
    if (value > 0) return `+${value.toFixed(2)}%`;
    return `${value.toFixed(2)}%`;
};

export default function BudgetTotalsCard({ budget = null, calculatedTotals, ivaRate, applyIva }) {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(calculatedTotals.subtotal)}</span>
                    </div>

                    {/* Mostrar ajuste de condición de pago */}
                    {calculatedTotals.paymentConditionAmount !== 0 && (
                        <>
                            <div
                                className={`flex justify-between ${calculatedTotals.paymentConditionAmount > 0 ? 'text-red-600' : 'text-green-600'}`}
                            >
                                <span className="flex items-center gap-1">
                                    {calculatedTotals.paymentConditionAmount > 0 ? (
                                        <TrendingUp className="h-4 w-4" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4" />
                                    )}
                                    {budget.payment_condition?.description}:
                                </span>
                                <span className="font-semibold">
                                    {calculatedTotals.paymentConditionAmount > 0 ? '+' : ''}
                                    {formatCurrency(calculatedTotals.paymentConditionAmount)}
                                </span>
                            </div>
                            <div className="pl-6 text-xs text-gray-500">
                                {calculatedTotals.paymentConditionAmount > 0 ? 'Recargo' : 'Descuento'} del{' '}
                                {formatPercentage(budget.payment_condition_percentage)}
                            </div>
                        </>
                    )}

                    {applyIva && (
                        <div className="flex justify-between">
                            <span>IVA ({(ivaRate * 100).toFixed(0)}%):</span>
                            <span>{formatCurrency(calculatedTotals.iva)}</span>
                        </div>
                    )}

                    <div className="border-t pt-2">
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total:</span>
                            <span>{formatCurrency(calculatedTotals.total)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
