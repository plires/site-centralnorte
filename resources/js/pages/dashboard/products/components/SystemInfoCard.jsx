import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar } from 'lucide-react';

export default function SystemInfoCard({ product }) {
    const formatDate = (date) =>
        new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Información del Sistema
                </CardTitle>
                <CardDescription>Control de registro</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="mb-1 text-sm font-medium text-gray-700">Creado</div>
                    <p className="text-sm text-gray-900">{formatDate(product.created_at)}</p>
                </div>

                <Separator />

                <div>
                    <div className="mb-1 text-sm font-medium text-gray-700">Última modificación</div>
                    <p className="text-sm text-gray-900">{formatDate(product.updated_at)}</p>
                </div>

                <Separator />

                <div>
                    <span className="text-sm font-medium text-gray-700">ID del Producto</span>
                    <Badge variant="secondary" className="mt-1 block font-mono">
                        #{product.id}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
