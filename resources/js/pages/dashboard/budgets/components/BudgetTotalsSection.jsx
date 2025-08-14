import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export default function BudgetTotalsSection({ totals }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Totales
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span>IVA (21%):</span>
                    <span className="font-semibold">{formatCurrency(totals.iva)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(totals.total)}</span>
                </div>
            </CardContent>
        </Card>
    );
}
