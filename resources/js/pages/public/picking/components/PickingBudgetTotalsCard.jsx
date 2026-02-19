// resources/js/pages/public/picking/components/PickingBudgetTotalsCard.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Info, TrendingUp } from 'lucide-react';

/**
 * Card con el resumen de totales del presupuesto de picking
 * @param {Object} budget - Objeto del presupuesto completo
 * @param {number} ivaRate - Tasa de IVA (ej: 0.21)
 * @param {boolean} applyIva - Si aplica IVA
 * @returns {JSX.Element} - Componente Card de totales
 */
export default function PickingBudgetTotalsCard({ budget, ivaRate, applyIva }) {
    const formatCurrency = (value) => {
        const num = parseFloat(value) || 0;
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2,
        }).format(num);
    };

    const formatPercentage = (percentage) => {
        const value = parseFloat(percentage) || 0;
        if (value === 0) return '0%';
        if (value > 0) return `+${value.toFixed(2)}%`;
        return `${value.toFixed(2)}%`;
    };

    // Calcular totales
    const servicesSubtotal = parseFloat(budget.services_subtotal) || 0;
    const componentIncrementAmount = parseFloat(budget.component_increment_amount) || 0;
    const componentIncrementPercentage = parseFloat(budget.component_increment_percentage) || 0;
    const subtotalWithIncrement = parseFloat(budget.subtotal_with_increment) || 0;
    const boxTotal = parseFloat(budget.box_total) || 0;
    const paymentConditionAmount = parseFloat(budget.payment_condition_amount) || 0;
    const total = parseFloat(budget.total) || 0;
    const unitPricePerKit = parseFloat(budget.unit_price_per_kit) || 0;

    // Determinar si hay incremento por componentes
    const hasComponentIncrement = componentIncrementPercentage > 0 && componentIncrementAmount > 0;

    // Determinar si hay condición de pago
    const hasPaymentCondition = budget.payment_condition_description && paymentConditionAmount !== 0;
    const isPositiveAdjustment = paymentConditionAmount > 0;
    const adjustmentColor = isPositiveAdjustment ? 'text-red-600' : 'text-green-600';
    const adjustmentBgColor = isPositiveAdjustment ? 'bg-red-50' : 'bg-green-50';
    const adjustmentBorderColor = isPositiveAdjustment ? 'border-red-200' : 'border-green-200';

    // Reconstruir subtotal antes de IVA para calcular IVA correctamente
    // (budget.total ya incluye IVA, no se puede usar como base)
    const subtotalBase = subtotalWithIncrement + boxTotal;
    const subtotalWithPayment = subtotalBase + paymentConditionAmount;
    const ivaAmount = applyIva ? subtotalWithPayment * ivaRate : 0;
    // El total almacenado ya incluye IVA, es el total final
    const totalWithIva = total;

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    Resumen del Presupuesto
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {/* Subtotal de servicios */}
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal de servicios:</span>
                        <span className="font-medium">{formatCurrency(servicesSubtotal)}</span>
                    </div>

                    {/* Incremento por componentes */}
                    {hasComponentIncrement && (
                        <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2 text-blue-800">
                                    <span className="flex items-center gap-2 text-sm font-medium">
                                        <Info className="h-4 w-4" />
                                        <span>Incremento por componentes:</span>
                                        <span className="text-xs">{budget.component_increment_description}</span>
                                    </span>
                                    <span className="font-semibold">{formatPercentage(componentIncrementPercentage)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-blue-700">
                                    <span>Monto del incremento:</span>
                                    <span className="font-semibold">{formatCurrency(componentIncrementAmount)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Subtotal con incremento */}
                    {hasComponentIncrement && (
                        <div className="flex justify-between text-gray-700">
                            <span>Subtotal con incremento:</span>
                            <span>{formatCurrency(subtotalWithIncrement)}</span>
                        </div>
                    )}

                    {/* Costo de cajas */}
                    <div className="flex justify-between text-gray-600">
                        <span>Costo de cajas:</span>
                        <span>{formatCurrency(boxTotal)}</span>
                    </div>

                    {/* Ajuste por condición de pago */}
                    {hasPaymentCondition && (
                        <div className={`rounded-md border p-3 ${adjustmentBorderColor} ${adjustmentBgColor}`}>
                            <div className="space-y-2">
                                <div className={`flex items-center justify-between gap-2 ${adjustmentColor}`}>
                                    <span className="flex items-center gap-2 font-medium">
                                        <span className="text-sm">Condición de pago:</span>
                                        <span className="text-sm">{budget.payment_condition_description}</span>
                                        {isPositiveAdjustment ? <TrendingUp className="h-4 w-4" /> : <TrendingUp className="h-4 w-4 rotate-180" />}
                                    </span>
                                    <span className="font-semibold">{formatPercentage(budget.payment_condition_percentage)}</span>
                                </div>
                                <div className={`flex justify-between text-sm ${adjustmentColor}`}>
                                    <span>Monto del ajuste:</span>
                                    <span className="font-semibold">{formatCurrency(paymentConditionAmount)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="my-4 border-t border-gray-200"></div>

                    {/* Total sin IVA */}
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal Presupuesto{applyIva}:</span>
                        <span className="font-semibold text-gray-500">{formatCurrency(applyIva ? subtotalWithPayment : total)}</span>
                    </div>

                    {/* IVA si aplica */}
                    {applyIva && (
                        <>
                            <div className="flex justify-between text-gray-600">
                                <span>IVA ({(ivaRate * 100).toFixed(0)}%):</span>
                                <span className="font-semibold text-gray-500">{formatCurrency(ivaAmount)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total Presupuesto:</span>
                                <span>{formatCurrency(totalWithIva)}</span>
                            </div>
                        </>
                    )}

                    {/* Precio unitario por kit */}
                    <div className="flex justify-between rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                        <span className="font-medium">Precio por kit:</span>
                        <span className="font-semibold">{formatCurrency(unitPricePerKit)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
