import ButtonCustom from '@/components/ButtonCustom';
import PageHeader from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, Edit, Mail, Shield, User, XCircle } from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Usuarios',
        href: '/dashboard/users',
    },
    {
        title: 'Detalles del Usuario',
        href: '#',
    },
];

export default function Show({ user }) {
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Usuario - ${user.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {/* Header con botón volver */}
                        <PageHeader backRoute={route('dashboard.users.index')} backText="Volver" />
                        <div className="p-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Información Personal */}
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

                                {/* Información del Sistema */}
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
                                            <p className="text-sm text-gray-900">
                                                {user.email_verified_at ? formatDate(user.email_verified_at) : 'No verificado'}
                                            </p>
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
                            </div>

                            {/* Acciones adicionales */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Acciones</CardTitle>
                                    <CardDescription>Operaciones disponibles para este usuario</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-3">
                                        <ButtonCustom route={route('dashboard.users.edit', user.id)} variant="primary" size="md">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Editar Usuario
                                        </ButtonCustom>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
