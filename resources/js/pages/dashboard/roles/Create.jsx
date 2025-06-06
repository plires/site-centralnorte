import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Shield, Users } from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Roles de Usuarios',
        href: '/dashboard/roles',
    },
    {
        title: 'Crear Rol',
        href: '#',
    },
];

export default function RolesCreate({ auth, roles, permissions }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [],
    });

    const togglePermission = (permId) => {
        setData('permissions', data.permissions.includes(permId) ? data.permissions.filter((id) => id !== permId) : [...data.permissions, permId]);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/dashboard/roles');
    };

    // Agrupar permisos por categorías (opcional)
    const groupedPermissions = permissions.reduce((acc, perm) => {
        const category = perm.name.split('.')[0] || 'general';
        if (!acc[category]) acc[category] = [];
        acc[category].push(perm);
        return acc;
    }, {});

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
            <Head title="Crear Rol" />
            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="space-y-6">
                                {/* Header */}
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                                        <Shield className="text-primary h-5 w-5" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-semibold tracking-tight">Crear Nuevo Rol</h1>
                                        <p className="text-muted-foreground text-sm">Define un nuevo rol y asigna los permisos correspondientes</p>
                                    </div>
                                </div>

                                <div className="grid gap-6 lg:grid-cols-3">
                                    {/* Formulario de creación */}
                                    <div className="lg:col-span-2">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Plus className="h-4 w-4" />
                                                    Información del Rol
                                                </CardTitle>
                                                <CardDescription>Completa la información básica del nuevo rol</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <form onSubmit={submit} className="space-y-6">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name">Nombre del Rol</Label>
                                                        <Input
                                                            id="name"
                                                            type="text"
                                                            value={data.name}
                                                            onChange={(e) => setData('name', e.target.value)}
                                                            placeholder="Ej: Editor, Moderador, Administrador..."
                                                            className={errors.name ? 'border-destructive' : ''}
                                                        />
                                                        {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                                                    </div>

                                                    <Separator />

                                                    {/* Permisos */}
                                                    <div className="space-y-4">
                                                        <div>
                                                            <Label className="text-base font-medium">Permisos</Label>
                                                            <p className="text-muted-foreground text-sm">
                                                                Selecciona los permisos que tendrá este rol
                                                            </p>
                                                        </div>

                                                        {Object.keys(groupedPermissions).length > 1 ? (
                                                            // Vista agrupada por categorías
                                                            <div className="space-y-6">
                                                                {Object.entries(groupedPermissions).map(([category, perms]) => (
                                                                    <div key={category} className="space-y-3">
                                                                        <h4 className="flex items-center gap-2 text-sm font-medium capitalize">
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                {category}
                                                                            </Badge>
                                                                            <span className="text-muted-foreground">({perms.length} permisos)</span>
                                                                        </h4>
                                                                        <div className="grid grid-cols-1 gap-3 pl-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                                                            {perms.map((perm) => (
                                                                                <div key={perm.id} className="flex items-center space-x-2">
                                                                                    <Checkbox
                                                                                        id={`perm-${perm.id}`}
                                                                                        checked={data.permissions.includes(perm.id)}
                                                                                        onCheckedChange={() => togglePermission(perm.id)}
                                                                                    />
                                                                                    <Label
                                                                                        htmlFor={`perm-${perm.id}`}
                                                                                        className="cursor-pointer text-sm leading-tight font-normal"
                                                                                    >
                                                                                        {perm.name.replace(`${category}.`, '')}
                                                                                    </Label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            // Vista simple - Layout responsivo progresivo
                                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                                                                {permissions.map((perm) => (
                                                                    <div key={perm.id} className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id={`perm-${perm.id}`}
                                                                            checked={data.permissions.includes(perm.id)}
                                                                            onCheckedChange={() => togglePermission(perm.id)}
                                                                        />
                                                                        <Label
                                                                            htmlFor={`perm-${perm.id}`}
                                                                            className="cursor-pointer text-sm leading-tight font-normal"
                                                                        >
                                                                            {perm.name}
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {data.permissions.length > 0 && (
                                                            <div className="bg-muted/50 rounded-lg p-3">
                                                                <p className="text-muted-foreground mb-2 text-sm">
                                                                    Permisos seleccionados: {data.permissions.length}
                                                                </p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {permissions
                                                                        .filter((p) => data.permissions.includes(p.id))
                                                                        .map((p) => (
                                                                            <Badge key={p.id} variant="secondary" className="text-xs">
                                                                                {p.name}
                                                                            </Badge>
                                                                        ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex justify-end gap-3 pt-4">
                                                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                                            Cancelar
                                                        </Button>
                                                        <Button type="submit" disabled={processing || !data.name.trim()} className="min-w-[120px]">
                                                            {processing ? (
                                                                <>
                                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                                    Creando...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Plus className="mr-2 h-4 w-4" />
                                                                    Crear Rol
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Sidebar con roles existentes */}
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-base">
                                                    <Users className="h-4 w-4" />
                                                    Roles Existentes
                                                </CardTitle>
                                                <CardDescription>Roles actualmente configurados en el sistema</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {roles.length > 0 ? (
                                                    roles.map((role) => (
                                                        <div key={role.id} className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="text-sm font-medium">{role.name}</h4>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {role.permissions.length} permisos
                                                                </Badge>
                                                            </div>
                                                            {role.permissions.length > 0 && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {role.permissions.slice(0, 3).map((perm) => (
                                                                        <Badge key={perm.id} variant="secondary" className="text-xs">
                                                                            {perm.name}
                                                                        </Badge>
                                                                    ))}
                                                                    {role.permissions.length > 3 && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            +{role.permissions.length - 3} más
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-muted-foreground py-4 text-center text-sm">No hay roles configurados</p>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Información adicional */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">💡 Consejos</CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-muted-foreground space-y-3 text-sm">
                                                <p>• Usa nombres descriptivos para los roles</p>
                                                <p>• Asigna solo los permisos necesarios</p>
                                                <p>• Considera el principio de menor privilegio</p>
                                                <p>• Revisa periódicamente los permisos asignados</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
