import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getTodayISO, getTomorrowISO } from '@/utils/dateUtils';
import { CalendarDays } from 'lucide-react';

export default function BudgetDateSection({ data, setData, errors, user, isEditing = false }) {
    const getMinExpiryDate = () => {
        // Para vencimiento, mínimo debe ser mañana o un día después de la fecha de emisión
        const tomorrow = getTomorrowISO();

        if (data.issue_date) {
            const issueDate = new Date(data.issue_date);
            issueDate.setDate(issueDate.getDate() + 1);
            const issueDatePlusOne = issueDate.toISOString().split('T')[0];

            // Tomar la fecha mayor entre mañana y un día después de la emisión
            return issueDatePlusOne > tomorrow ? issueDatePlusOne : tomorrow;
        }

        return tomorrow;
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
                <div>
                    <Label htmlFor="issue_date">Fecha de Emisión *</Label>
                    <Input
                        id="issue_date"
                        type="date"
                        min={getTodayISO()}
                        value={data.issue_date}
                        onChange={(e) => setData('issue_date', e.target.value)}
                        className={errors.issue_date ? 'border-red-500' : ''}
                    />
                    {errors.issue_date && <p className="mt-1 text-sm text-red-600">{errors.issue_date}</p>}
                    {isEditing && <p className="mt-1 text-xs text-gray-500">La fecha de emisión no puede ser anterior a hoy</p>}
                </div>

                <div>
                    <Label htmlFor="expiry_date">Fecha de Vencimiento *</Label>
                    <Input
                        id="expiry_date"
                        type="date"
                        min={getMinExpiryDate()}
                        value={data.expiry_date}
                        onChange={(e) => setData('expiry_date', e.target.value)}
                        className={errors.expiry_date ? 'border-red-500' : ''}
                    />
                    {errors.expiry_date && <p className="mt-1 text-sm text-red-600">{errors.expiry_date}</p>}
                    {isEditing && <p className="mt-1 text-xs text-gray-500">Debe ser al menos un día posterior a la fecha de emisión</p>}
                </div>

                <div>
                    <Label>Vendedor</Label>
                    <p className="rounded-md bg-gray-50 px-3 py-2 text-sm font-medium">{user.name}</p>
                </div>
            </CardContent>
        </Card>
    );
}
