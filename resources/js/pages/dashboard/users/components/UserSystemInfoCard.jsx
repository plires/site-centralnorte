import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

export default function UserSystemInfoCard({ user }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'No verificado';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

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
                    <p className="text-sm text-gray-900">{formatDate(user.created_at)}</p>
                </div>

                <Separator />

                <div>
                    <div className="mb-2 flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Última actualización</span>
                    </div>
                    <p className="text-sm text-gray-900">{formatDate(user.updated_at)}</p>
                </div>

                <Separator />

                <div>
                    <div className="mb-2 flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Email verificado</span>
                    </div>
                    <p className="text-sm text-gray-900">{user.email_verified_at ? formatDate(user.email_verified_at) : 'No verificado'}</p>
                </div>

                <Separator />

                <div>
                    <div className="mb-2 flex items-center">
                        <span className="text-sm font-medium text-gray-700">ID del usuario</span>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                        #{user.id}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
