import ButtonCustom from '@/components/ButtonCustom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Lock, Mail, Save, Shield, User, UserPlus } from 'lucide-react';
import { useState } from 'react';

export default function UserForm({ data, setData, handleSubmit, processing, errors, roles, isEditing = false }) {
    const [showPassword, setShowPassword] = useState(false);
    const isEmailVerified = data?.email_verified_at;
    const showVerificationOption = isEditing && !isEmailVerified;

    const handleManualVerificationChange = (checked) => {
        setData('manual_verification', checked);
    };

    return (
        <div className="py-12">
            <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-lg font-medium">{isEditing ? 'Editar Usuario' : 'Crear Usuario'}</h3>
                            <ButtonCustom route={route('dashboard.users.index')} variant="secondary" size="md">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </ButtonCustom>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="mr-2 h-5 w-5" />
                                    Información del Usuario
                                </CardTitle>
                                <CardDescription>
                                    {isEditing
                                        ? 'Modifica los campos que desees actualizar'
                                        : 'Completa todos los campos para crear un nuevo usuario'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Nombre */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="flex items-center">
                                            <User className="mr-2 h-4 w-4" />
                                            Nombre completo
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Ingresa el nombre completo"
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center">
                                            <Mail className="mr-2 h-4 w-4" />
                                            Correo electrónico
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="usuario@ejemplo.com"
                                            className={errors.email ? 'border-red-500' : ''}
                                        />
                                        {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                                    </div>

                                    {/* Opción de verificación manual */}
                                    {showVerificationOption && (
                                        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                            <div className="flex items-start space-x-3">
                                                <Checkbox
                                                    id="manual_verification"
                                                    checked={data.manual_verification || false}
                                                    onCheckedChange={handleManualVerificationChange}
                                                />
                                                <div className="space-y-1">
                                                    <Label htmlFor="manual_verification" className="cursor-pointer text-sm font-medium">
                                                        Marcar correo como verificado manualmente
                                                    </Label>
                                                    <p className="text-xs text-amber-700">
                                                        Esta acción marcará el correo electrónico como verificado sin enviar un email de confirmación.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Contraseña */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="flex items-center">
                                            <Lock className="mr-2 h-4 w-4" />
                                            Contraseña {isEditing && <span className="ml-1 text-xs text-gray-500">(opcional)</span>}
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder={isEditing ? 'Dejar vacío para no cambiar' : 'Mínimo 8 caracteres'}
                                                className={errors.password ? 'border-red-500' : ''}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-600 hover:text-gray-800"
                                            >
                                                {showPassword ? 'Ocultar' : 'Mostrar'}
                                            </button>
                                        </div>
                                        {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
                                    </div>

                                    {/* Confirmar Contraseña */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation" className="flex items-center">
                                            <Lock className="mr-2 h-4 w-4" />
                                            Confirmar contraseña
                                        </Label>
                                        <Input
                                            id="password_confirmation"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder={isEditing ? 'Confirmar nueva contraseña' : 'Repite la contraseña'}
                                            className={errors.password_confirmation ? 'border-red-500' : ''}
                                        />
                                        {errors.password_confirmation && <span className="text-xs text-red-500">{errors.password_confirmation}</span>}
                                    </div>

                                    {/* Rol */}
                                    <div className="space-y-2">
                                        <Label htmlFor="role" className="flex items-center">
                                            <Shield className="mr-2 h-4 w-4" />
                                            Rol del usuario
                                        </Label>
                                        <Select value={data.role_id} onValueChange={(value) => setData('role_id', value)}>
                                            <SelectTrigger className={errors.role_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Selecciona un rol" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((role) => (
                                                    <SelectItem key={role.id} value={role.id.toString()}>
                                                        {role.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.role_id && <span className="text-xs text-red-500">{errors.role_id}</span>}
                                    </div>

                                    {/* Botones */}
                                    <div className="flex items-center justify-end space-x-4 pt-6">
                                        <ButtonCustom route={route('dashboard.users.index')} variant="secondary" size="md">
                                            Cancelar
                                        </ButtonCustom>

                                        <ButtonCustom type="submit" disabled={processing} variant="primary" size="md">
                                            {isEditing ? <Save className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                            {processing
                                                ? isEditing
                                                    ? 'Actualizando...'
                                                    : 'Creando...'
                                                : isEditing
                                                  ? 'Actualizar Usuario'
                                                  : 'Crear Usuario'}
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
