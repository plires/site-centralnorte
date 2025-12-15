import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

/**
 * Badge de vigencia (días restantes)
 * Solo aplica para presupuestos enviados (sent)
 */
const getExpiryBadge = (budget) => {
    // Si no está enviado, no mostramos vigencia
    if (budget.status !== 'sent') {
        return null;
    }

    const days = Math.abs(budget.days_until_expiry || 0);

    if (budget.is_expiring_today) {
        return (
            <Badge variant="warning" className="flex items-center gap-1 border-orange-200 bg-orange-100 text-orange-800">
                <Clock className="h-3 w-3" />
                Vence Hoy
            </Badge>
        );
    }

    if (budget.is_expired) {
        const dayText = days === 1 ? 'día' : 'días';
        return (
            <Badge variant="destructive" className="flex items-center gap-1 border-red-200 bg-red-100 text-red-800">
                <AlertTriangle className="h-3 w-3" />
                Vencido hace {days} {dayText}
            </Badge>
        );
    }

    if (days <= 3 && days > 0) {
        const dayText = days === 1 ? 'día' : 'días';
        return (
            <Badge variant="warning" className="flex items-center gap-1 border-orange-200 bg-orange-100 text-orange-800">
                <Clock className="h-3 w-3" />
                Vence en {days} {dayText}
            </Badge>
        );
    }

    const dayText = days === 1 ? 'día' : 'días';
    return (
        <Badge variant="success" className="flex items-center gap-1 border-green-200 bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            Vigente ({days} {dayText} restantes)
        </Badge>
    );
};
export default getExpiryBadge;
