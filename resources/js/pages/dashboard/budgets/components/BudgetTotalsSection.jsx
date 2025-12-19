// resources/js/pages/dashboard/budgets/components/BudgetTotalsSection.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Info, TrendingDown, TrendingUp } from 'lucide-react';

export default function BudgetTotalsSection({ totals, ivaRate = 0.21, showIva = true, warnings, paymentCondition = null }) {
    console.log(warnings);
    const hasConditionWarning = warnings?.some((warning) => warning.type === 'condition');

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    // Formatear porcentaje
    const formatPercentage = (percentage) => {
        const value = parseFloat(percentage);
        if (value === 0) return '0%';
        if (value > 0) return `+${value.toFixed(2)}%`;
        return `${value.toFixed(2)}%`;
    };

    // Obtener el monto de ajuste desde totals
    const paymentConditionAmount = totals.paymentConditionAmount || 0;

    // Determinar si hay ajuste
    const hasPaymentCondition = paymentCondition && paymentConditionAmount !== 0;

    // Determinar color y tipo de ajuste
    const isPositiveAdjustment = paymentConditionAmount > 0;
    const adjustmentColor = isPositiveAdjustment ? 'text-red-600' : 'text-green-600';
    const adjustmentBgColor = isPositiveAdjustment ? 'bg-red-50' : 'bg-green-50';
    const adjustmentBorderColor = isPositiveAdjustment ? 'border-red-200' : 'border-green-200';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Totales del Presupuesto
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal:</span>
                    <span className="font-semibold text-gray-500">{formatCurrency(totals.subtotal)}</span>
                </div>

                {/* Ajuste por Condición de Pago con info adicional */}
                {hasPaymentCondition && (
                    <div className={`rounded-md border p-3 ${adjustmentBorderColor} `}>
                        <div className="space-y-2">
                            {/* Línea de ajuste */}
                            {hasConditionWarning && (
                                <div className="border-l-4 border-red-500 bg-red-50 p-4 text-sm font-medium text-orange-800">
                                    {/* Podés usar el mensaje específico si querés */}
                                    {warnings.find((warning) => warning.type === 'condition')?.message}
                                </div>
                            )}
                            <div className={`flex items-center justify-between ${adjustmentColor}`}>
                                <span className="flex items-center gap-2 font-medium">
                                    <span className={`${adjustmentColor}`}>Condición de pago:</span>
                                    <span>{paymentCondition.description}</span>
                                    {isPositiveAdjustment ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                    <span className="text-sm">({formatPercentage(paymentCondition.percentage)})</span>
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
                                            Se aplicó un <strong>recargo</strong> del {formatPercentage(paymentCondition.percentage)} sobre el
                                            subtotal
                                        </>
                                    ) : (
                                        <>
                                            Se aplicó un <strong>descuento</strong> del {formatPercentage(paymentCondition.percentage)} sobre el
                                            subtotal
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* IVA */}
                {showIva && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">IVA ({Math.round(ivaRate * 100)}%):</span>
                        <span className="font-semibold text-gray-500">{formatCurrency(totals.iva)}</span>
                    </div>
                )}

                {/* Total */}
                <div className="flex justify-between border-t pt-3 text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-black-600">{formatCurrency(totals.total)}</span>
                </div>
            </CardContent>
        </Card>
    );
}
