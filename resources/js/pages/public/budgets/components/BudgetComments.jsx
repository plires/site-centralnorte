// resources/js/pages/public/components/BudgetComments.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Componente para mostrar comentarios del pie del presupuesto
 * @param {Object} budget - Objeto del presupuesto
 * @returns {JSX.Element|null} - Componente Card de comentarios o null si no hay comentarios
 */
export default function BudgetComments({ budget }) {
    // No renderizar si no hay comentarios
    if (!budget.footer_comments) {
        return null;
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Comentarios</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-gray-700">{budget.footer_comments}</p>
            </CardContent>
        </Card>
    );
}
