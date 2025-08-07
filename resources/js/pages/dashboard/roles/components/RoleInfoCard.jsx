import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { KeyRound, Shield } from 'lucide-react';

export default function RoleInfoCard({ role }) {
    return (
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
    );
}
