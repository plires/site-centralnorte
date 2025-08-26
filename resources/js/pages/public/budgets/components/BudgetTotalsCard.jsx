// resources/js/pages/public/components/BudgetTotalsCard.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/budget/budgetUtils';

/**
 * Card con el resumen de totales del presupuesto
 * @param {Object} calculatedTotals - Totales calculados
 * @param {number} ivaRate - Tasa de IVA
 * @param {boolean} applyIva - Si aplica IVA
 * @returns {JSX.Element} - Componente Card de totales
 */
export default function BudgetTotalsCard({ calculatedTotals, ivaRate, applyIva }) {
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
