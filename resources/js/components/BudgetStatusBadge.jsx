import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function BudgetStatusBadge({ status, statusText, showIcon = true, size = 'sm' }) {
    const getStatusConfig = () => {
        switch (status) {
            case 'expired':
                return {
                    variant: 'destructive',
                    icon: AlertTriangle,
                    className: 'bg-red-100 text-red-800 border-red-200',
                };
            case 'expiring_soon':
                return {
                    variant: 'warning',
                    icon: Clock,
                    className: 'bg-orange-100 text-orange-800 border-orange-200',
                };
            case 'active':
            default:
                return {
                    variant: 'success',
                    icon: CheckCircle,
                    className: 'bg-green-100 text-green-800 border-green-200',
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <Badge
            variant={config.variant}
            className={`inline-flex items-center gap-1 ${config.className} ${size === 'xs' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'}`}
        >
            {showIcon && <Icon className="h-3 w-3" />}
            {statusText}
        </Badge>
    );
}
