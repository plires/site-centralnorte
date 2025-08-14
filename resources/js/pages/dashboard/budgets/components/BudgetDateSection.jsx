import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays } from 'lucide-react';

export default function BudgetDateSection({ data, setData, errors, user }) {
    const getMinIssueDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    const getMinExpiryDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
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
                        min={getMinIssueDate()}
                        value={data.issue_date}
                        onChange={(e) => setData('issue_date', e.target.value)}
                        className={errors.issue_date ? 'border-red-500' : ''}
                    />
                    {errors.issue_date && <p className="mt-1 text-sm text-red-600">{errors.issue_date}</p>}
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
                </div>

                <div>
                    <Label>Vendedor</Label>
                    <p className="rounded-md bg-gray-50 px-3 py-2 text-sm font-medium">{user.name}</p>
                </div>
            </CardContent>
        </Card>
    );
}
