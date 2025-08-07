import ButtonCustom from '@/components/ButtonCustom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit } from 'lucide-react';

export default function ProductActionsCard({ productId }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Acciones</CardTitle>
                <CardDescription>Operaciones disponibles</CardDescription>
            </CardHeader>
            <CardContent>
                <ButtonCustom route={route('dashboard.products.edit', productId)} variant="primary" size="md">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Producto
                </ButtonCustom>
            </CardContent>
        </Card>
    );
}
