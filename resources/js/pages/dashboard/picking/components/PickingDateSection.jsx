// resources/js/pages/dashboard/picking/components/PickingDateSection.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTodayISO, getTomorrowISO } from '@/utils/dateUtils';
import { CalendarDays } from 'lucide-react';

/**
 * Card de Fechas + Vendedor para el formulario de presupuesto de picking.
 * Maneja fecha de emisión, fecha de vencimiento y asignación de vendedor.
 */
export default function PickingDateSection({ data, setData, errors, user, vendors = [], isEditing = false }) {
    const selectedVendor = vendors.find((vendor) => vendor.value.toString() === data.vendor_id?.toString());

    // Verificar si el usuario actual es admin
    const isAdmin = user?.role?.name === 'admin';

    const getMinIssueDate = () => {
        if (isEditing) return undefined;
        return getTodayISO();
    };

    const getMaxIssueDate = () => {
        return getTodayISO();
    };

    const getMinValidUntil = () => {
        if (!data.issue_date) {
            return getTomorrowISO();
        }

        const issueDate = new Date(data.issue_date);
        const issueDatePlusOne = new Date(issueDate);
        issueDatePlusOne.setDate(issueDate.getDate() + 1);
        const issueDatePlusOneISO = issueDatePlusOne.toISOString().split('T')[0];

        if (isEditing) {
            return issueDatePlusOneISO;
        } else {
            const tomorrow = getTomorrowISO();
            return issueDatePlusOneISO > tomorrow ? issueDatePlusOneISO : tomorrow;
        }
    };

    const getMaxValidUntil = () => {
        if (data.issue_date) {
            const issueDate = new Date(data.issue_date);
            const maxDate = new Date(issueDate);
            maxDate.setFullYear(issueDate.getFullYear() + 1);
            return maxDate.toISOString().split('T')[0];
        }

        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1);
        return maxDate.toISOString().split('T')[0];
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Fechas
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Solo mostrar fecha de emisión editable si NO está editando */}
                {!isEditing && (
                    <div>
                        <Label htmlFor="issue_date">Fecha de Emisión *</Label>
                        <Input
                            id="issue_date"
                            type="date"
                            min={getMinIssueDate()}
                            max={getMaxIssueDate()}
                            value={data.issue_date}
                            onChange={(e) => setData('issue_date', e.target.value)}
                            className={errors.issue_date ? 'border-red-500' : ''}
                        />
                        {errors.issue_date && <p className="mt-1 text-sm text-red-600">{errors.issue_date}</p>}
                        <p className="mt-1 text-xs text-gray-500">La fecha de emisión debe ser la fecha de hoy</p>
                    </div>
                )}

                {/* En edición, mostrar la fecha de emisión como solo lectura */}
                {isEditing && (
                    <div>
                        <Label>Fecha de Emisión</Label>
                        <p className="rounded-md border bg-gray-50 px-3 py-2 text-sm font-medium">
                            {new Date(data.issue_date).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                            })}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">La fecha de emisión no se puede modificar</p>
                    </div>
                )}

                <div>
                    <Label htmlFor="valid_until">Fecha de Vencimiento *</Label>
                    <Input
                        id="valid_until"
                        type="date"
                        min={getMinValidUntil()}
                        max={getMaxValidUntil()}
                        value={data.valid_until}
                        onChange={(e) => setData('valid_until', e.target.value)}
                        className={errors.valid_until ? 'border-red-500' : ''}
                    />
                    {errors.valid_until && <p className="mt-1 text-sm text-red-600">{errors.valid_until}</p>}
                    {isEditing ? (
                        <p className="mt-1 text-xs text-gray-500">
                            Puede modificar la fecha de vencimiento (debe ser posterior a la fecha de emisión, máximo 1 año)
                        </p>
                    ) : (
                        <p className="mt-1 text-xs text-gray-500">Elija la fecha de vencimiento deseada (debe ser posterior a la fecha de emisión)</p>
                    )}
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
                                    className={` ${errors.vendor_id ? 'border-red-500' : ''} ${selectedVendor?.vendor_deleted ? 'bg-red-50 text-orange-800' : ''} `}
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
