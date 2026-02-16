import { Card, CardContent } from '@/components/ui/card';
import { formatDateTime } from '@/utils/dateUtils';
import { Calendar, FileText, User } from 'lucide-react';

export default function BudgetInfoSection({ budget }) {
    const getExpiryStatus = () => {
        if (budget.is_expiring_today) {
            return <span className="font-medium text-orange-600">Vence Hoy</span>;
        }

        if (budget.is_expired) {
            return <span className="font-medium text-red-600">{Math.abs(budget.days_until_expiry) === 1 ? 'Vencido hace 1 día' : 'Vencido'}</span>;
        }

        return (
            <span className="font-medium text-green-600">
                {budget.days_until_expiry === 1 ? '1 día restante' : `${budget.days_until_expiry} días restantes`}
            </span>
        );
    };

    return (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {/* Cliente */}
            <Card className={`${budget?.client?.deleted_at ? 'border-2 border-red-800' : ''}`}>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                            <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Cliente</p>
                            <p className={`font-semibold ${budget?.client?.deleted_at ? 'text-red-800' : ''}`}>
                                {budget?.client?.deleted_at
                                    ? (budget.client.name || 'Sin nombre') + ' - No disponible'
                                    : budget.client?.name || 'No disponible'}
                            </p>
                            {!budget?.client?.deleted_at && budget.client?.company && (
                                <p className="text-xs text-gray-500">{budget.client.company}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Vendedor */}
            <Card className={`${budget?.user?.deleted_at ? 'border-2 border-red-800' : ''}`}>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                            <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Vendedor</p>
                            <p className={`font-semibold ${budget?.user?.deleted_at ? 'text-red-800' : ''}`}>
                                {budget?.user?.deleted_at
                                    ? (budget.user.name || 'Sin nombre') + ' - No disponible'
                                    : budget.user?.name || 'No disponible'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Número de presupuesto */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                            <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">N° de Presupuesto</p>
                            <p className="font-semibold">{budget.budget_merch_number || 'N/A'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Fecha de emisión */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                            <Calendar className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Fecha de emisión</p>
                            <p className="font-semibold">{budget.issue_date_short || 'N/A'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Fecha de vencimiento */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                            <Calendar className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Válido hasta</p>
                            <p className="font-semibold">{budget.expiry_date_short || 'N/A'}</p>
                            <p className="text-xs">{getExpiryStatus()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Última modificación */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                            <Calendar className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Última modificación</p>
                            <p className="font-semibold">{formatDateTime(budget.updated_at)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
