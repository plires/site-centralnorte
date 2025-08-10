import ButtonCustom from '@/components/ButtonCustom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Shield, UserPlus } from 'lucide-react';

export default function ClientForm({ data, setData, handleSubmit, processing, errors, isEditing = false }) {
    return (
        <div className="py-12">
            <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-lg font-medium">{isEditing ? 'Editar Cliente' : 'Crear Cliente'}</h3>
                            <ButtonCustom route={route('dashboard.clients.index')} variant="secondary" size="md">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </ButtonCustom>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Shield className="mr-2 h-5 w-5" />
                                    Información del Cliente
                                </CardTitle>
                                <CardDescription>
                                    {isEditing
                                        ? 'Modifica los datos del cliente para actualizarlo'
                                        : 'Completa los campos para crear un nuevo cliente'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Nombre del Cliente */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre del Cliente</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Ej: Juan Perez"
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                                    </div>

                                    {/* Empresa */}
                                    <div className="space-y-2">
                                        <Label htmlFor="company">Empresa</Label>
                                        <Input
                                            id="company"
                                            type="text"
                                            value={data.company}
                                            onChange={(e) => setData('company', e.target.value)}
                                            placeholder="Ej: Unilever"
                                            className={errors.company ? 'border-red-500' : ''}
                                        />
                                        {errors.company && <span className="text-xs text-red-500">{errors.company}</span>}
                                    </div>

                                    {/* Email del Cliente */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="Ej: info@unilever.com"
                                            className={errors.email ? 'border-red-500' : ''}
                                        />
                                        {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                                    </div>

                                    {/* Teléfono del Cliente */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Teléfono</Label>
                                        <Input
                                            id="phone"
                                            type="number"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="Ej: 115-045-7544"
                                            className={errors.phone ? 'border-red-500' : ''}
                                        />
                                        {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
                                    </div>

                                    {/* Direccion del Cliente */}
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Dirección</Label>
                                        <Input
                                            id="address"
                                            type="text"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="Ej: Pico 1200, Lanus Este, Buenos Aires, Argentina"
                                            className={errors.address ? 'border-red-500' : ''}
                                        />
                                        {errors.address && <span className="text-xs text-red-500">{errors.address}</span>}
                                    </div>

                                    {/* Botones */}
                                    <div className="flex items-center justify-end space-x-4 pt-6">
                                        <ButtonCustom route={route('dashboard.clients.index')} variant="secondary" size="md">
                                            Cancelar
                                        </ButtonCustom>

                                        <ButtonCustom type="submit" disabled={processing} variant="primary" size="md">
                                            {isEditing ? <Save className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                            {processing
                                                ? isEditing
                                                    ? 'Actualizando...'
                                                    : 'Creando...'
                                                : isEditing
                                                  ? 'Actualizar Cliente'
                                                  : 'Crear Cliente'}
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
