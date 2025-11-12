import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ClientCombobox from './ClientCombobox';

export default function BudgetBasicInfo({ data, setData, errors, clients, isEditing = false }) {
    const handleClientSelect = (clientId) => {
        setData('client_id', clientId);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="title">Título del Presupuesto *</Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="ej: Presupuesto: Cotización cuadernos, bolígrafos..."
                        className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                    <Label htmlFor="client_id">Cliente *</Label>
                    <ClientCombobox
                        clients={clients}
                        value={data.client_id}
                        onChange={handleClientSelect}
                        error={errors.client_id}
                        placeholder="Seleccionar cliente..."
                    />
                    {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>}
                </div>

                {!isEditing && (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="send_email"
                            checked={data.send_email_to_client}
                            onCheckedChange={(checked) => setData('send_email_to_client', checked)}
                        />
                        <Label htmlFor="send_email" className="text-sm">
                            Enviar automáticamente por email al cliente
                        </Label>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
