// resources/js/pages/dashboard/budgets/components/BudgetStatusSwitch.jsx
// DEPRECATED: Este componente ya no se usa con el nuevo sistema de estados.
// El control de estado ahora está integrado en BudgetActionsSection.jsx
// usando un Select en lugar de un Switch.
//
// Se mantiene este archivo por compatibilidad hacia atrás,
// pero redirige la funcionalidad a mostrar solo información del estado.

import BudgetStatusBadge from '@/components/BudgetStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

/**
 * @deprecated Use BudgetActionsSection instead
 * Este componente ahora solo muestra información del estado.
 * El cambio de estado se maneja en BudgetActionsSection.
 */
export default function BudgetStatusSwitch({ budget, className = '' }) {
    // Mensajes según el estado
    const getStatusMessage = () => {
        switch (budget.status) {
            case 'unsent':
                return 'El presupuesto aún no ha sido enviado. Puedes editarlo libremente.';
            case 'draft':
                return 'Este es un borrador. Puedes editarlo antes de enviarlo.';
            case 'sent':
                return 'El presupuesto está visible para el cliente.';
            case 'approved':
                return '¡El cliente aprobó este presupuesto!';
            case 'rejected':
                return 'El cliente rechazó este presupuesto.';
            case 'expired':
                return 'Este presupuesto ha vencido.';
            default:
                return 'Estado del presupuesto.';
        }
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Estado del Presupuesto
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-sm">{getStatusMessage()}</p>
                    </div>
                    <BudgetStatusBadge status={budget.status} size="default" />
                </div>
            </CardContent>
        </Card>
    );
}
