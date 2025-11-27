// resources/js/pages/public/budgets/components/BudgetTotalsCard.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/budget/budgetUtils';
import { Info, TrendingDown, TrendingUp } from 'lucide-react';

/**
 * Card con el resumen de totales del presupuesto
 * @param {Object} budget - Objeto del presupuesto completo
 * @param {Object} calculatedTotals - Totales calculados
 * @param {number} ivaRate - Tasa de IVA
 * @param {boolean} applyIva - Si aplica IVA
 * @returns {JSX.Element} - Componente Card de totales
 */
export default function BudgetTotalsCard({ budget, calculatedTotals, ivaRate, applyIva }) {
    // Formatear porcentaje
    const formatPercentage = (percentage) => {
        const value = parseFloat(percentage);
        if (value === 0) return '0%';
        if (value > 0) return `+${value.toFixed(2)}%`;
        return `${value.toFixed(2)}%`;
    };

    // Obtener el monto de ajuste
    const paymentConditionAmount = calculatedTotals.paymentConditionAmount || 0;

    // Determinar si hay ajuste
    const hasPaymentCondition = budget.payment_condition_description && paymentConditionAmount !== 0;

    // Determinar color y tipo de ajuste
    const isPositiveAdjustment = paymentConditionAmount > 0;
    const adjustmentColor = isPositiveAdjustment ? 'text-red-600' : 'text-green-600';
    const adjustmentBgColor = isPositiveAdjustment ? 'bg-red-50' : 'bg-green-50';
    const adjustmentBorderColor = isPositiveAdjustment ? 'border-red-200' : 'border-green-200';

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Resumen del Presupuesto</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {/* Subtotal */}
                    <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal:</span>
                        <span className="font-semibold text-gray-500">{formatCurrency(calculatedTotals.subtotal)}</span>
                    </div>

                    {/* Ajuste por Condición de Pago */}
                    {hasPaymentCondition && (
                        <div className={`rounded-md border p-3 ${adjustmentBorderColor} `}>
                            <div className="space-y-2">
                                {/* Línea de ajuste */}
                                <div className={`flex items-center justify-between gap-2 ${adjustmentColor}`}>
                                    <span className="flex items-center gap-2 font-medium">
                                        <span className={`${adjustmentColor}`}>Condición de pago:</span>
                                        <span>{budget.payment_condition_description}</span>
                                        {isPositiveAdjustment ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        <span className="text-sm">({formatPercentage(budget.payment_condition_percentage)})</span>
                                    </span>
                                    <span className="font-bold">
                                        {isPositiveAdjustment ? '+ ' : '- '}
                                        {formatCurrency(Math.abs(paymentConditionAmount))}
                                    </span>
                                </div>

                                {/* Nota explicativa */}
                                <div className={`flex items-start gap-2 text-xs ${adjustmentColor} opacity-80`}>
                                    <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                    <span>
                                        {isPositiveAdjustment ? (
                                            <>
                                                Se aplicó un <strong>recargo</strong> del {formatPercentage(budget.payment_condition_percentage)}{' '}
                                                sobre el subtotal
                                            </>
                                        ) : (
                                            <>
                                                Se aplicó un <strong>descuento</strong> del {formatPercentage(budget.payment_condition_percentage)}{' '}
                                                sobre el subtotal
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* IVA */}
                    {applyIva && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">IVA ({(ivaRate * 100).toFixed(0)}%):</span>
                            <span className="font-semibold text-gray-500">{formatCurrency(calculatedTotals.iva)}</span>
                        </div>
                    )}

                    {/* Total */}
                    <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total:</span>
                            <span className="text-black-600">{formatCurrency(calculatedTotals.total)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
