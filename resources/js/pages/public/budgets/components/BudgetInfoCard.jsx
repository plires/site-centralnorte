// resources/js/pages/public/components/BudgetInfoCard.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Card con información básica del presupuesto
 * @param {Object} budget - Objeto del presupuesto
 * @returns {JSX.Element} - Componente Card de información
 */
export default function BudgetInfoCard({ budget }) {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Información del Presupuesto</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <strong>Fecha de emisión:</strong> {budget.issue_date_formatted}
                    </div>
                    <div>
                        <strong>Fecha de vencimiento:</strong> {budget.expiry_date_formatted}
                    </div>
                    <div>
                        <strong>Cliente:</strong> {budget.client.name}
                        {budget.client.company && ` (${budget.client.company})`}
                    </div>
                    <div>
                        <strong>Vendedor:</strong> {budget.user.name}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
