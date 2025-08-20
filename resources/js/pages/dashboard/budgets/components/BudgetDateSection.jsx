import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getTodayISO, getTomorrowISO } from '@/utils/dateUtils';
import { CalendarDays } from 'lucide-react';

export default function BudgetDateSection({ data, setData, errors, user, isEditing = false }) {
    const getMinIssueDate = () => {
        // Si está editando, no aplicar restricción mínima (aunque no debería ser editable)
        if (isEditing) {
            return undefined;
        }
        return getTodayISO();
    };

    const getMaxIssueDate = () => {
        // Siempre limitar a no ser mayor a hoy
        return getTodayISO();
    };

    const getMinExpiryDate = () => {
        if (!data.issue_date) {
            // Si no hay fecha de emisión, usar mañana como mínimo
            return getTomorrowISO();
        }

        const issueDate = new Date(data.issue_date);
        const issueDatePlusOne = new Date(issueDate);
        issueDatePlusOne.setDate(issueDate.getDate() + 1);
        const issueDatePlusOneISO = issueDatePlusOne.toISOString().split('T')[0];

        if (isEditing) {
            // Al editar: permitir fechas desde un día después de la emisión
            // sin restricción de "mínimo mañana" (más flexible)
            return issueDatePlusOneISO;
        } else {
            // Al crear: debe ser mínimo mañana Y al menos un día después de la emisión
            const tomorrow = getTomorrowISO();
            return issueDatePlusOneISO > tomorrow ? issueDatePlusOneISO : tomorrow;
        }
    };

    const getMaxExpiryDate = () => {
        // Limitar a máximo 1 año desde la fecha de emisión
        if (data.issue_date) {
            const issueDate = new Date(data.issue_date);
            const maxDate = new Date(issueDate);
            maxDate.setFullYear(issueDate.getFullYear() + 1);
            return maxDate.toISOString().split('T')[0];
        }

        // Si no hay fecha de emisión, limitar a 1 año desde hoy
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1);
        return maxDate.toISOString().split('T')[0];
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Fechas
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* NUEVO: Solo mostrar fecha de emisión si NO está editando */}
                {!isEditing && (
                    <div>
                        <Label htmlFor="issue_date">Fecha de Emisión *</Label>
                        <Input
                            id="issue_date"
                            type="date"
                            min={getMinIssueDate()}
                            max={getMaxIssueDate()}
                            value={data.issue_date}
                            onChange={(e) => setData('issue_date', e.target.value)}
                            className={errors.issue_date ? 'border-red-500' : ''}
                        />
                        {errors.issue_date && <p className="mt-1 text-sm text-red-600">{errors.issue_date}</p>}
                        <p className="mt-1 text-xs text-gray-500">La fecha de emisión debe ser la fecha de hoy</p>
                    </div>
                )}

                {/* NUEVO: Si está editando, mostrar la fecha de emisión como solo lectura */}
                {isEditing && (
                    <div>
                        <Label>Fecha de Emisión</Label>
                        <p className="rounded-md border bg-gray-50 px-3 py-2 text-sm font-medium">
                            {new Date(data.issue_date).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                            })}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">La fecha de emisión no se puede modificar</p>
                    </div>
                )}

                <div>
                    <Label htmlFor="expiry_date">Fecha de Vencimiento *</Label>
                    <Input
                        id="expiry_date"
                        type="date"
                        min={getMinExpiryDate()}
                        max={getMaxExpiryDate()}
                        value={data.expiry_date}
                        onChange={(e) => setData('expiry_date', e.target.value)}
                        className={errors.expiry_date ? 'border-red-500' : ''}
                    />
                    {errors.expiry_date && <p className="mt-1 text-sm text-red-600">{errors.expiry_date}</p>}
                    {isEditing ? (
                        <p className="mt-1 text-xs text-gray-500">
                            Puede modificar la fecha de vencimiento (debe ser posterior a la fecha de emisión, máximo 1 año)
                        </p>
                    ) : (
                        <p className="mt-1 text-xs text-gray-500">Elija la fecha de vencimiento deseada (debe ser posterior a la fecha de emisión)</p>
                    )}
                </div>

                <div>
                    <Label>Vendedor</Label>
                    <p className="rounded-md bg-gray-50 px-3 py-2 text-sm font-medium">{user.name}</p>
                </div>
            </CardContent>
        </Card>
    );
}
