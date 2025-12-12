// resources/js/pages/dashboard/budgets/components/BudgetHeaderWithStatus.jsx

import BudgetStatusBadge from '@/components/BudgetStatusBadge';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle, XCircle, Send, FileEdit, FileText } from 'lucide-react';

export default function BudgetHeaderWithStatus({ budget }) {
    /**
     * Badge de vigencia (días restantes)
     * Solo aplica para presupuestos enviados (sent)
     */
    const getExpiryBadge = () => {
        // Si no está enviado, no mostramos vigencia
        if (budget.status !== 'sent') {
            return null;
        }

        const days = Math.abs(budget.days_until_expiry || 0);

        if (budget.is_expiring_today) {
            return (
                <Badge variant="warning" className="flex items-center gap-1 bg-orange-100 text-orange-800 border-orange-200">
                    <Clock className="h-3 w-3" />
                    Vence Hoy
                </Badge>
            );
        }

        if (budget.is_expired) {
            const dayText = days === 1 ? 'día' : 'días';
            return (
                <Badge variant="destructive" className="flex items-center gap-1 bg-red-100 text-red-800 border-red-200">
                    <AlertTriangle className="h-3 w-3" />
                    Vencido hace {days} {dayText}
                </Badge>
            );
        }

        if (days <= 3 && days > 0) {
            const dayText = days === 1 ? 'día' : 'días';
            return (
                <Badge variant="warning" className="flex items-center gap-1 bg-orange-100 text-orange-800 border-orange-200">
                    <Clock className="h-3 w-3" />
                    Vence en {days} {dayText}
                </Badge>
            );
        }

        const dayText = days === 1 ? 'día' : 'días';
        return (
            <Badge variant="success" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3" />
                Vigente ({days} {dayText} restantes)
            </Badge>
        );
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{budget.title}</h1>
                <p className="mt-1 text-sm text-gray-500">Presupuesto #{budget.id}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {/* Badge del estado principal (unsent, draft, sent, approved, rejected, expired) */}
                <BudgetStatusBadge 
                    status={budget.status} 
                    showIcon={true} 
                    size="default" 
                />
                
                {/* Badge de vigencia (solo si está enviado y tiene días hasta vencimiento) */}
                {budget.status === 'sent' && getExpiryBadge()}
            </div>
        </div>
    );
}
