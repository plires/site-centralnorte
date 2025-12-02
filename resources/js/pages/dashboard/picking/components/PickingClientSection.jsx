// resources/js/pages/dashboard/picking/components/PickingClientSection.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import ClientCombobox from '@/pages/dashboard/budgets/components/ClientCombobox';

/**
 * Componente para seleccionar el cliente en un presupuesto de picking
 * Reutiliza el ClientCombobox de budgets
 */
export default function PickingClientSection({ data, setData, clients, errors, processing }) {
    const handleClientSelect = (clientId) => {
        setData('client_id', clientId);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="client_id">Cliente *</Label>
                    <ClientCombobox
                        clients={clients}
                        value={data.client_id}
                        onChange={handleClientSelect}
                        error={errors.client_id}
                        placeholder="Seleccionar cliente..."
                        disabled={processing}
                    />
                    {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
