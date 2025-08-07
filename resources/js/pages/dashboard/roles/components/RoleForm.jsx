import ButtonCustom from '@/components/ButtonCustom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Shield, UserPlus } from 'lucide-react';

export default function RoleForm({ data, setData, handleSubmit, processing, errors, permissions, isEditing = false }) {
    const handlePermissionToggle = (id) => {
        const current = data.permissions || [];
        if (current.includes(id)) {
            setData(
                'permissions',
                current.filter((pid) => pid !== id),
            );
        } else {
            setData('permissions', [...current, id]);
        }
    };

    return (
        <div className="py-12">
            <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-lg font-medium">{isEditing ? 'Editar Rol' : 'Crear Rol'}</h3>
                            <ButtonCustom route={route('dashboard.roles.index')} variant="secondary" size="md">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </ButtonCustom>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Shield className="mr-2 h-5 w-5" />
                                    Información del Rol
                                </CardTitle>
                                <CardDescription>
                                    {isEditing ? 'Modifica el nombre o los permisos del rol' : 'Completa los campos para crear un nuevo rol'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Nombre del Rol */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre del Rol</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Ej: Administrador"
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                                    </div>

                                    {/* Permisos */}
                                    <div className="space-y-2">
                                        <Label>Permisos</Label>
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                                            {permissions.map((permission) => (
                                                <label key={permission.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`perm-${permission.id}`}
                                                        checked={data.permissions.includes(permission.id)}
                                                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                                                    />
                                                    <span className="text-sm">{permission.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.permissions && <span className="text-xs text-red-500">{errors.permissions}</span>}
                                    </div>

                                    {/* Botones */}
                                    <div className="flex items-center justify-end space-x-4 pt-6">
                                        <ButtonCustom route={route('dashboard.roles.index')} variant="secondary" size="md">
                                            Cancelar
                                        </ButtonCustom>

                                        <ButtonCustom type="submit" disabled={processing} variant="primary" size="md">
                                            {isEditing ? <Save className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                            {processing ? (isEditing ? 'Actualizando...' : 'Creando...') : isEditing ? 'Actualizar Rol' : 'Crear Rol'}
                                        </ButtonCustom>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
