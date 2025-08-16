import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CalendarDays, User } from 'lucide-react';

export default function BudgetInfoSection({ budget }) {
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date));
    };

    const formatDateShort = (date) => {
        return new Intl.DateTimeFormat('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(new Date(date));
    };

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
        <>
            {/* Información básica del presupuesto */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Información del Cliente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                            <dd className="text-sm text-gray-900">{budget.client.name}</dd>
                        </div>
                        {budget.client.company && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Empresa</dt>
                                <dd className="text-sm text-gray-900">{budget.client.company}</dd>
                            </div>
                        )}
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="text-sm text-gray-900">{budget.client.email || 'No configurado'}</dd>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5" />
                            Fechas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Fecha de emisión</dt>
                            <dd className="text-sm text-gray-900">{formatDateShort(budget.issue_date)}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Fecha de vencimiento</dt>
                            <dd className="text-sm text-gray-900">{formatDateShort(budget.expiry_date)}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Última modificación</dt>
                            <dd className="text-sm text-gray-900">{formatDate(budget.updated_at)}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Vencimiento del presupuesto</dt>
                            <dd className="text-sm text-gray-900">{getExpiryStatus()}</dd>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Vendedor */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Vendedor Asignado
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                        <dd className="text-sm text-gray-900">{budget.user.name}</dd>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
