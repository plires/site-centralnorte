// resources/js/pages/dashboard/picking/components/PickingNotesSection.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

/**
 * Componente para agregar notas opcionales al presupuesto de picking
 */
export default function PickingNotesSection({ data, setData, errors, processing }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notas (Opcional)</CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Notas adicionales sobre el presupuesto..."
                    rows={4}
                    disabled={processing}
                />
                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
            </CardContent>
        </Card>
    );
}
