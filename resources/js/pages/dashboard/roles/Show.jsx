import ButtonCustom from '@/components/ButtonCustom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ArrowLeft, Edit, KeyRound, Shield, User2 } from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Roles',
        href: '/dashboard/roles',
    },
    {
        title: 'Detalles del Rol',
        href: '#',
    },
];

export default function Show({ role }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rol - ${role.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="text-end">
                            <ButtonCustom className="mt-6 mr-6" route={route('dashboard.roles.index')} variant="secondary" size="md">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </ButtonCustom>
                        </div>
                        <div className="p-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Información del Rol */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Shield className="mr-2 h-5 w-5" />
                                            Información del Rol
                                        </CardTitle>
                                        <CardDescription>Nombre y permisos asignados</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <div className="mb-2 flex items-center">
                                                <Shield className="mr-2 h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium text-gray-700">Nombre del rol</span>
                                            </div>
                                            <p className="text-lg font-semibold text-gray-900">{role.name}</p>
                                        </div>

                                        <Separator />

                                        <div>
                                            <div className="mb-2 flex items-center">
                                                <KeyRound className="mr-2 h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium text-gray-700">Permisos</span>
                                            </div>
                                            {role.permissions.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {role.permissions.map((permission) => (
                                                        <Badge key={permission.id} variant="outline">
                                                            {permission.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">Este rol no tiene permisos asignados.</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Usuarios con este Rol */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <User2 className="mr-2 h-5 w-5" />
                                            Usuarios con este rol
                                        </CardTitle>
                                        <CardDescription>Listado de usuarios asignados</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {role.users.length > 0 ? (
                                            role.users.map((user) => (
                                                <div key={user.id} className="text-sm text-gray-900">
                                                    {user.name} <span className="text-gray-500">({user.email})</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">No hay usuarios asignados a este rol.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Acciones adicionales */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Acciones</CardTitle>
                                    <CardDescription>Operaciones disponibles para este rol</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-3">
                                        <ButtonCustom route={route('dashboard.roles.edit', role.id)} variant="primary" size="md">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Editar Rol
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
