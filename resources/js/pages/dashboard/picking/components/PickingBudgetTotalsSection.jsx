// resources/js/pages/dashboard/picking/components/PickingBudgetTotalsSection.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, TrendingDown, TrendingUp } from 'lucide-react';

/**
 * Componente para mostrar los totales de un presupuesto de picking
 * Incluye: servicios, incremento, cajas, payment condition, IVA y precio por kit
 */
export default function PickingBudgetTotalsSection({
    totals,
    incrementInfo = null,
    paymentCondition = null,
    totalKits = null,
    ivaRate = 0.21,
    showIva = true,
}) {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value || 0);
    };

    const formatPercentage = (value) => {
        const num = parseFloat(value);
        return `${num > 0 ? '+' : ''}${num.toFixed(2)} %`;
    };

    // Determinar si el ajuste de payment condition es positivo o negativo
    const isPositiveAdjustment = paymentCondition && parseFloat(paymentCondition.percentage) > 0;
    const adjustmentColor = isPositiveAdjustment ? 'text-red-600' : 'text-green-600';

    return (
        <Card className="mb-5">
            <CardHeader>
                <CardTitle>Resumen de Totales</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {/* Subtotal Servicios */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Subtotal Servicios:</span>
                        <span className="font-medium">{formatCurrency(totals.servicesSubtotal)}</span>
                    </div>

                    {/* Incremento por componentes */}
                    {incrementInfo && totals.incrementAmount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Incremento por componentes (+ {(incrementInfo.percentage * 100).toFixed(2)} %):</span>
                            <span className="font-medium">{formatCurrency(totals.incrementAmount)}</span>
                        </div>
                    )}

                    {/* Total Cajas */}
                    {totals.boxTotal > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Total Cajas:</span>
                            <span className="font-medium">{formatCurrency(totals.boxTotal)}</span>
                        </div>
                    )}

                    {/* Subtotal Base (antes de payment condition e IVA) */}
                    <div className="flex items-center justify-between border-t pt-2 font-medium">
                        <span className="text-gray-700">Subtotal:</span>
                        <span className="text-gray-900">{formatCurrency(totals.subtotal)}</span>
                    </div>

                    {/* Ajuste por Condición de Pago */}
                    {paymentCondition && totals.paymentConditionAmount !== 0 && (
                        <>
                            <div className="mb-0 flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-sm text-gray-600">
                                    Condición de Pago ({paymentCondition.description})
                                    {isPositiveAdjustment ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                    <span className="text-sm">({formatPercentage(paymentCondition.percentage)}) </span>
                                </span>
                                <span className={`pt-3 font-bold ${adjustmentColor}`}>
                                    {isPositiveAdjustment ? '+ ' : '- '}
                                    {formatCurrency(Math.abs(totals.paymentConditionAmount))}
                                </span>
                            </div>

                            {/* Nota explicativa */}
                            <div className={`mt-0 mb-3 flex items-start gap-2 text-xs ${adjustmentColor} opacity-80`}>
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
                        </>
                    )}

                    {/* IVA */}
                    {showIva && totals.iva > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">IVA ({Math.round(ivaRate * 100)}%):</span>
                            <span className="font-semibold text-gray-500">{formatCurrency(totals.iva)}</span>
                        </div>
                    )}

                    {/* Total Final */}
                    <div className="flex items-center justify-between border-t-2 border-gray-300 py-3">
                        <span className="text-lg font-bold text-gray-900">TOTAL</span>
                        <span className="text-2xl font-bold text-blue-600">{formatCurrency(totals.total)}</span>
                    </div>

                    {/* Precio unitario por kit */}
                    {totals.unitPricePerKit > 0 && (
                        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                            <span className="text-sm font-medium text-green-900">{`${totalKits} Kits Totales. Precio unitario por kit`}</span>
                            <span className="text-lg font-bold text-green-600">{formatCurrency(totals.unitPricePerKit)}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
