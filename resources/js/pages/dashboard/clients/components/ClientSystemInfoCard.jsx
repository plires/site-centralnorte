import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatLongDate } from '@/utils/date';
import { Calendar, Clock } from 'lucide-react';

export default function ClientSystemInfoCard({ client }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Información del Sistema
                </CardTitle>
                <CardDescription>Fechas y estado de la cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="mb-2 flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Fecha de registro</span>
                    </div>
                    <p className="text-sm text-gray-900">{formatLongDate(client.created_at)}</p>
                </div>

                <Separator />

                <div>
                    <div className="mb-2 flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Última actualización</span>
                    </div>
                    <p className="text-sm text-gray-900">{formatLongDate(client.updated_at)}</p>
                </div>

                <Separator />

                <div>
                    <div className="mb-2 flex items-center">
                        <span className="text-sm font-medium text-gray-700">ID del cliente</span>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                        #{client.id}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
