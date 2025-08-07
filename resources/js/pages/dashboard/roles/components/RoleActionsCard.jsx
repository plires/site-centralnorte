import ButtonCustom from '@/components/ButtonCustom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit } from 'lucide-react';

export default function RoleActionsCard({ roleId }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Acciones</CardTitle>
                <CardDescription>Operaciones disponibles para este rol</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-3">
                    <ButtonCustom route={route('dashboard.roles.edit', roleId)} variant="primary" size="md">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Rol
                    </ButtonCustom>
                </div>
            </CardContent>
        </Card>
    );
}
