import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, MapPinHouse, Phone, User } from 'lucide-react';

export default function ClientPersonalInfoCard({ client }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Información Personal
                </CardTitle>
                <CardDescription>Datos básicos del cliente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="mb-2 flex items-center">
                        <User className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Nombre completo</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{client.name}</p>
                </div>

                <Separator />

                <div>
                    <div className="mb-2 flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Correo electrónico</span>
                    </div>
                    <p className="text-sm text-gray-900">{client.email}</p>
                </div>

                <Separator />

                <div>
                    <div className="mb-2 flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Teléfono</span>
                    </div>
                    <p className="text-sm text-gray-900">{client.phone}</p>
                </div>

                <Separator />

                <div>
                    <div className="mb-2 flex items-center">
                        <MapPinHouse className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Dirección</span>
                    </div>
                    <p className="text-sm text-gray-900">{client.address}</p>
                </div>
            </CardContent>
        </Card>
    );
}
