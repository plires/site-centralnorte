// resources/js/pages/public/components/BudgetStatusAlert.jsx

import { Alert, AlertDescription } from '@/components/ui/alert';
import { getStatusInfo } from '@/utils/budget/budgetUtils';

/**
 * Alert que muestra el estado actual del presupuesto
 * @param {Object} budget - Objeto del presupuesto
 * @returns {JSX.Element} - Componente Alert del estado
 */
export default function BudgetStatusAlert({ budget }) {
    const statusInfo = getStatusInfo(budget);
    const StatusIcon = statusInfo.icon;

    // Clases CSS basadas en el estado
    const getAlertClasses = () => {
        if (budget.is_expired) {
            return 'border-red-200 bg-red-50 text-red-800';
        }

        if (budget.days_until_expiry <= 3) {
            return 'border-orange-200 bg-orange-50 text-orange-800';
        }

        return 'border-green-200 bg-green-50 text-green-800';
    };

    return (
        <Alert className={`mb-6 ${getAlertClasses()}`}>
            <StatusIcon className="h-5 w-5" />
            <AlertDescription className="ml-2">{statusInfo.text}</AlertDescription>
        </Alert>
    );
}
