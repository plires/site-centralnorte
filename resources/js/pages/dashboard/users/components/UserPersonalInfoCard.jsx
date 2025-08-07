import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Mail, Shield, User, XCircle } from 'lucide-react';

export default function UserPersonalInfoCard({ user }) {
    const getEmailVerificationStatus = () => {
        if (user.email_verified_at) {
            return {
                status: 'verified',
                text: 'Verificado',
                icon: CheckCircle,
                color: 'bg-green-100 text-green-800 border-green-200',
            };
        }
        return {
            status: 'unverified',
            text: 'No verificado',
            icon: XCircle,
            color: 'bg-red-100 text-red-800 border-red-200',
        };
    };

    const emailStatus = getEmailVerificationStatus();
    const EmailStatusIcon = emailStatus.icon;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Información Personal
                </CardTitle>
                <CardDescription>Datos básicos del usuario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="mb-2 flex items-center">
                        <User className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Nombre completo</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                </div>

                <Separator />

                <div>
                    <div className="mb-2 flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Correo electrónico</span>
                    </div>
                    <p className="text-lg text-gray-900">{user.email}</p>
                    <div className="mt-2">
                        <Badge className={`inline-flex items-center ${emailStatus.color}`}>
                            <EmailStatusIcon className="mr-1 h-3 w-3" />
                            {emailStatus.text}
                        </Badge>
                    </div>
                </div>

                <Separator />

                <div>
                    <div className="mb-2 flex items-center">
                        <Shield className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Rol</span>
                    </div>
                    <Badge variant="outline" className="text-sm">
                        {user.role?.name || 'Sin rol asignado'}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
