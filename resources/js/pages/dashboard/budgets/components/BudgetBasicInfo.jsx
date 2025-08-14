import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';

export default function BudgetBasicInfo({ data, setData, errors, clients, isEditing = false }) {
    const [selectedClientName, setSelectedClientName] = useState('');

    // Inicializar cliente seleccionado cuando se está editando
    useEffect(() => {
        if (isEditing && data.client_id) {
            const client = clients.find((c) => c.id.toString() === data.client_id);
            if (client) {
                setSelectedClientName(client.name);
            }
        }
    }, [isEditing, data.client_id, clients]);

    const handleClientSelect = (clientId) => {
        const client = clients.find((c) => c.id == clientId);
        setData('client_id', clientId);
        setSelectedClientName(client ? client.name : '');
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
                    <Select value={data.client_id} onValueChange={handleClientSelect}>
                        <SelectTrigger className={errors.client_id ? 'border-red-500' : ''}>
                            <SelectValue>{selectedClientName || 'Seleccionar cliente'}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id.toString()}>
                                    <div>
                                        <p className="font-medium">{client.name}</p>
                                        <p className="text-muted-foreground text-sm">{client.email}</p>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>}
                </div>

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
            </CardContent>
        </Card>
    );
}
