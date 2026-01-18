// resources/js/pages/dashboard/picking/components/PickingClientSection.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ClientCombobox from '@/pages/dashboard/budgets/components/ClientCombobox';

/**
 * Componente para seleccionar el cliente y vendedor en un presupuesto de picking
 * Reutiliza el ClientCombobox de budgets
 */
export default function PickingClientSection({ data, setData, clients, vendors = [], user, errors, processing }) {
    const handleClientSelect = (clientId) => {
        setData('client_id', clientId);
    };

    // Verificar si el usuario actual es admin
    const isAdmin = user?.role?.name === 'admin';

    // Encontrar el vendedor seleccionado
    const selectedVendor = vendors.find((vendor) => vendor.value.toString() === data.vendor_id?.toString());

    return (
        <Card>
            <CardHeader>
                <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="title">
                        Título del presupuesto <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="title"
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="Presupuesto de picking Unilever"
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                    <Label htmlFor="client_id">Cliente *</Label>
                    <ClientCombobox
                        clients={clients}
                        value={data.client_id}
                        onChange={handleClientSelect}
                        error={errors.client_id}
                        placeholder="Seleccionar cliente..."
                        disabled={processing}
                    />
                    {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>}
                </div>

                <div>
                    <Label htmlFor="vendor_id">Vendedor *</Label>
                    {isAdmin ? (
                        // ADMIN: Select editable con vendedores
                        <>
                            <Select
                                value={data.vendor_id ? data.vendor_id.toString() : user.id.toString()}
                                onValueChange={(value) => setData('vendor_id', parseInt(value))}
                            >
                                <SelectTrigger
                                    className={`${errors.vendor_id ? 'border-red-500' : ''} ${selectedVendor?.vendor_deleted ? 'bg-red-50 text-orange-800' : ''}`}
                                >
                                    <SelectValue placeholder="Seleccionar vendedor..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {vendors.map((vendor) => (
                                        <SelectItem
                                            className={vendor.vendor_deleted ? 'bg-red-50' : ''}
                                            key={vendor.value}
                                            value={vendor.value.toString()}
                                        >
                                            {vendor.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.vendor_id && <p className="mt-1 text-sm text-red-600">{errors.vendor_id}</p>}
                            <p className="mt-1 text-xs text-gray-500">Como administrador puede cambiar el vendedor asignado</p>
                        </>
                    ) : (
                        // VENDEDOR: Input disabled con su nombre
                        <>
                            <Input id="vendor_id" type="text" value={user?.name || ''} disabled className="bg-gray-50" />
                            <p className="mt-1 text-xs text-gray-500">Este presupuesto está asignado a tu usuario</p>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
