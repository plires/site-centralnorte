import ButtonCustom from '@/components/ButtonCustom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit } from 'lucide-react';

export default function ClientActionsCard({ clientId }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Acciones</CardTitle>
                <CardDescription>Operaciones disponibles para este cliente</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-3">
                    <ButtonCustom route={route('dashboard.clients.edit', clientId)} variant="primary" size="md">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Cliente
                    </ButtonCustom>
                </div>
            </CardContent>
        </Card>
    );
}
