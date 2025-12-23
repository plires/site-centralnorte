// resources/js/pages/public/picking/components/PickingBudgetComments.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

/**
 * Componente para mostrar notas/comentarios del presupuesto de picking
 * @param {Object} budget - Objeto del presupuesto de picking
 * @returns {JSX.Element|null} - Componente Card de comentarios o null si no hay comentarios
 */
export default function PickingBudgetComments({ budget }) {
    // No renderizar si no hay notas
    if (!budget.notes || budget.notes.trim() === '') {
        return null;
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Notas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="whitespace-pre-wrap text-gray-700">{budget.notes}</p>
            </CardContent>
        </Card>
    );
}
