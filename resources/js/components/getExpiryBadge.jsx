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
            <Badge variant="warning" className="border-orange-200 bg-orange-100 text-orange-800">
                <Clock className="nr-1 h-3 w-3" />
                Vence Hoy
            </Badge>
        );
    }

    if (budget.is_expired) {
        const dayText = days === 1 ? 'día' : 'días';
        const messageWithDays = 'Vencido hace ' + days + ' ' + dayText;
        const message = days > 5 ? 'Vencido' : messageWithDays;
        return (
            <Badge variant="destructive" className="border-red-200 bg-red-100 text-red-800">
                <AlertTriangle className="nr-1 h-3 w-3" />
                {message}
            </Badge>
        );
    }

    if (days <= 3 && days > 0) {
        const dayText = days === 1 ? 'día' : 'días';
        return (
            <Badge variant="warning" className="border-orange-200 bg-orange-100 text-orange-800">
                <Clock className="nr-1 h-3 w-3" />
                Vence en {days} {dayText}
            </Badge>
        );
    }

    const dayText = days === 1 ? 'día' : 'días';
    return (
        <Badge variant="success" className="border-green-200 bg-green-100 text-green-800">
            <CheckCircle className="nr-1 h-3 w-3" />
            Vigente ({days} {dayText} restantes)
        </Badge>
    );
};
export default getExpiryBadge;
