import ButtonCustom from '@/components/ButtonCustom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit } from 'lucide-react';

export default function UserActionsCard({ userId }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Acciones</CardTitle>
                <CardDescription>Operaciones disponibles para este usuario</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-3">
                    <ButtonCustom route={route('dashboard.users.edit', userId)} variant="primary" size="md">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Usuario
                    </ButtonCustom>
                </div>
            </CardContent>
        </Card>
    );
}
