import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock } from 'lucide-react';

export default function BudgetHeaderWithStatus({ budget }) {
    const getStatusBadge = () => {
        const days = Math.abs(budget.days_until_expiry);

        if (budget.is_expiring_today) {
            return (
                <Badge variant="warning" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Vence Hoy
                </Badge>
            );
        }

        if (budget.is_expired) {
            if (days === 1) {
                return (
                    <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Vencido hace 1 día
                    </Badge>
                );
            } else {
                return (
                    <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Vencido
                    </Badge>
                );
            }
        }

        if (days <= 3 && days > 0) {
            const dayText = days === 1 ? 'día' : 'días';
            return (
                <Badge variant="warning" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Vence en {days} {dayText}
                </Badge>
            );
        }

        const dayText = days === 1 ? 'día' : 'días';
        return (
            <Badge variant="success" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Vigente ({days} {dayText} restantes)
            </Badge>
        );
    };

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{budget.title}</h1>
                <p className="mt-1 text-sm text-gray-500">Presupuesto #{budget.id}</p>
            </div>
            <div className="flex items-center gap-2">{getStatusBadge()}</div>
        </div>
    );
}
