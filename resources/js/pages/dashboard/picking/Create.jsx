// resources/js/pages/dashboard/picking/Create.jsx
// EJEMPLO BÁSICO - Expandir según necesidades

import ButtonCustom from '@/components/ButtonCustom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs = [
    {
        title: 'Presupuestos de Picking',
        href: '/dashboard/picking',
    },
    {
        title: 'Nuevo Presupuesto',
        href: '#',
    },
];

export default function Create({ auth, boxes, costScales, componentIncrements }) {
    const { data, setData, post, processing, errors } = useForm({
        client_name: '',
        client_email: '',
        client_phone: '',
        total_kits: '',
        total_components_per_kit: '',
        box_id: '',
        services: [],
        notes: '',
    });

    const [currentScale, setCurrentScale] = useState(null);
    const [currentIncrement, setCurrentIncrement] = useState(null);
    const [totals, setTotals] = useState({
        servicesSubtotal: 0,
        incrementAmount: 0,
        subtotalWithIncrement: 0,
        boxCost: 0,
        total: 0,
    });

    // Buscar escala según cantidad de kits
    useEffect(() => {
        if (data.total_kits) {
            const scale = costScales.find(
                (s) =>
                    s.quantity_from <= parseInt(data.total_kits) &&
                    (s.quantity_to === null || s.quantity_to >= parseInt(data.total_kits)),
            );
            setCurrentScale(scale);
        }
    }, [data.total_kits, costScales]);

    // Buscar incremento según componentes
    useEffect(() => {
        if (data.total_components_per_kit) {
            const increment = componentIncrements.find(
                (i) =>
                    i.components_from <= parseInt(data.total_components_per_kit) &&
                    (i.components_to === null || i.components_to >= parseInt(data.total_components_per_kit)),
            );
            setCurrentIncrement(increment);
        }
    }, [data.total_components_per_kit, componentIncrements]);

    // Calcular totales
    useEffect(() => {
        const servicesSubtotal = data.services.reduce((sum, service) => {
            return sum + service.unit_cost * service.quantity;
        }, 0);

        const incrementAmount = currentIncrement ? servicesSubtotal * parseFloat(currentIncrement.percentage) : 0;

        const subtotalWithIncrement = servicesSubtotal + incrementAmount;

        const selectedBox = boxes.find((b) => b.id === parseInt(data.box_id));
        const boxCost = selectedBox ? parseFloat(selectedBox.cost) : 0;

        const total = subtotalWithIncrement + boxCost;

        setTotals({
            servicesSubtotal,
            incrementAmount,
            subtotalWithIncrement,
            boxCost,
            total,
        });
    }, [data.services, data.box_id, currentIncrement, boxes]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('dashboard.picking.budgets.store'), {
            onSuccess: () => {
                toast.success('Presupuesto creado correctamente');
            },
            onError: () => {
                toast.error('Error al crear el presupuesto');
            },
        });
    };

    const addService = () => {
        setData('services', [
            ...data.services,
            {
                service_type: 'assembly',
                service_description: 'Con armado',
                unit_cost: currentScale?.cost_with_assembly || 0,
                quantity: 1,
            },
        ]);
    };

    const removeService = (index) => {
        const newServices = data.services.filter((_, i) => i !== index);
        setData('services', newServices);
    };

    const updateService = (index, field, value) => {
        const newServices = [...data.services];
        newServices[index][field] = value;
        setData('services', newServices);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
            <Head title="Nuevo Presupuesto de Picking" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Nuevo Presupuesto de Picking</h2>
                            <div className="flex gap-2">
                                <ButtonCustom type="button" variant="outline" route={route('dashboard.picking.budgets.index')}>
                                    Cancelar
                                </ButtonCustom>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Guardando...' : 'Guardar'}
                                </Button>
                            </div>
                        </div>

                        {/* Información del Cliente */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Información del Cliente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <Label htmlFor="client_name">
                                            Nombre <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="client_name"
                                            value={data.client_name}
                                            onChange={(e) => setData('client_name', e.target.value)}
                                            placeholder="Nombre del cliente"
                                            className={errors.client_name ? 'border-red-500' : ''}
                                        />
                                        {errors.client_name && <p className="mt-1 text-sm text-red-500">{errors.client_name}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="client_email">Email</Label>
                                        <Input
                                            id="client_email"
                                            type="email"
                                            value={data.client_email}
                                            onChange={(e) => setData('client_email', e.target.value)}
                                            placeholder="email@ejemplo.com"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="client_phone">Teléfono</Label>
                                        <Input
                                            id="client_phone"
                                            value={data.client_phone}
                                            onChange={(e) => setData('client_phone', e.target.value)}
                                            placeholder="+54 11 1234-5678"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cantidades */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Cantidades</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="total_kits">
                                            Total de Kits <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="total_kits"
                                            type="number"
                                            value={data.total_kits}
                                            onChange={(e) => setData('total_kits', e.target.value)}
                                            placeholder="100"
                                            min="1"
                                            className={errors.total_kits ? 'border-red-500' : ''}
                                        />
                                        {errors.total_kits && <p className="mt-1 text-sm text-red-500">{errors.total_kits}</p>}
                                        {currentScale && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                Escala: {currentScale.quantity_from} -{' '}
                                                {currentScale.quantity_to || '∞'} | Tiempo: {currentScale.production_time}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="total_components_per_kit">
                                            Componentes por Kit <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="total_components_per_kit"
                                            type="number"
                                            value={data.total_components_per_kit}
                                            onChange={(e) => setData('total_components_per_kit', e.target.value)}
                                            placeholder="5"
                                            min="1"
                                            className={errors.total_components_per_kit ? 'border-red-500' : ''}
                                        />
                                        {errors.total_components_per_kit && (
                                            <p className="mt-1 text-sm text-red-500">{errors.total_components_per_kit}</p>
                                        )}
                                        {currentIncrement && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                Incremento: {currentIncrement.description} -{' '}
                                                {(currentIncrement.percentage * 100).toFixed(0)}%
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Selección de Caja */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>
                                    Caja <span className="text-red-500">*</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Select value={data.box_id.toString()} onValueChange={(value) => setData('box_id', value)}>
                                    <SelectTrigger className={errors.box_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Seleccionar caja" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {boxes.map((box) => (
                                            <SelectItem key={box.id} value={box.id.toString()}>
                                                {box.dimensions} - ${parseFloat(box.cost).toFixed(2)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.box_id && <p className="mt-1 text-sm text-red-500">{errors.box_id}</p>}
                            </CardContent>
                        </Card>

                        {/* Servicios - SIMPLIFICADO */}
                        <Card className="mb-6">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        Servicios <span className="text-red-500">*</span>
                                    </CardTitle>
                                    <Button type="button" variant="outline" size="sm" onClick={addService}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Agregar Servicio
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {data.services.length === 0 && (
                                    <p className="text-center text-sm text-gray-500 py-4">
                                        No hay servicios agregados. Haz clic en "Agregar Servicio" para comenzar.
                                    </p>
                                )}
                                {data.services.map((service, index) => (
                                    <div key={index} className="mb-4 rounded border p-4">
                                        <div className="grid gap-4 md:grid-cols-4">
                                            <div>
                                                <Label>Descripción</Label>
                                                <Input
                                                    value={service.service_description}
                                                    onChange={(e) => updateService(index, 'service_description', e.target.value)}
                                                    placeholder="Descripción del servicio"
                                                />
                                            </div>
                                            <div>
                                                <Label>Costo Unitario</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={service.unit_cost}
                                                    onChange={(e) => updateService(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <Label>Cantidad</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={service.quantity}
                                                    onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                                                    placeholder="1"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => removeService(index)}
                                                    className="w-full"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {errors.services && <p className="mt-1 text-sm text-red-500">{errors.services}</p>}
                            </CardContent>
                        </Card>

                        {/* Totales */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Totales</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal de servicios:</span>
                                        <span className="font-medium">
                                            {new Intl.NumberFormat('es-AR', {
                                                style: 'currency',
                                                currency: 'ARS',
                                            }).format(totals.servicesSubtotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Incremento por componentes (
                                            {currentIncrement ? (currentIncrement.percentage * 100).toFixed(0) : 0}%):
                                        </span>
                                        <span className="font-medium">
                                            {new Intl.NumberFormat('es-AR', {
                                                style: 'currency',
                                                currency: 'ARS',
                                            }).format(totals.incrementAmount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Caja:</span>
                                        <span className="font-medium">
                                            {new Intl.NumberFormat('es-AR', {
                                                style: 'currency',
                                                currency: 'ARS',
                                            }).format(totals.boxCost)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                        <span>Total:</span>
                                        <span>
                                            {new Intl.NumberFormat('es-AR', {
                                                style: 'currency',
                                                currency: 'ARS',
                                            }).format(totals.total)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notas */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Notas (Opcional)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Notas adicionales sobre el presupuesto..."
                                    rows={4}
                                />
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
