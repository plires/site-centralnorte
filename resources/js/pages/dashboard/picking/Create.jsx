// resources/js/pages/dashboard/picking/Create.jsx
// EJEMPLO BÁSICO - Expandir según necesidades

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import ClientCombobox from '@/pages/dashboard/budgets/components/ClientCombobox';
import { useForm } from '@inertiajs/react';
import { Box, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Create({ auth, boxes, costScales, clients, componentIncrements }) {
    const handleClientSelect = (clientId) => {
        setData('client_id', clientId);
    };
    const { data, setData, post, processing, errors } = useForm({
        client_name: '',
        client_email: '',
        client_phone: '',
        total_kits: '',
        total_components_per_kit: '',
        boxes: [], // Array de cajas
        services: [],
        notes: '',
    });

    const [currentScale, setCurrentScale] = useState(null);
    const [currentIncrement, setCurrentIncrement] = useState(null);
    const [totals, setTotals] = useState({
        servicesSubtotal: 0,
        incrementAmount: 0,
        subtotalWithIncrement: 0,
        boxTotal: 0,
        total: 0,
        unitPricePerKit: 0,
    });

    // Buscar escala según total_kits
    useEffect(() => {
        if (data.total_kits && costScales) {
            const kits = parseInt(data.total_kits);
            const scale = costScales.find((s) => s.quantity_from <= kits && (s.quantity_to === null || s.quantity_to >= kits));
            setCurrentScale(scale || null);
        } else {
            setCurrentScale(null);
        }
    }, [data.total_kits, costScales]);

    // Buscar incremento según total_components_per_kit
    useEffect(() => {
        if (data.total_components_per_kit && componentIncrements) {
            const components = parseInt(data.total_components_per_kit);
            const increment = componentIncrements.find(
                (i) => i.components_from <= components && (i.components_to === null || i.components_to >= components),
            );
            setCurrentIncrement(increment || null);
        } else {
            setCurrentIncrement(null);
        }
    }, [data.total_components_per_kit, componentIncrements]);

    // Calcular totales en tiempo real
    useEffect(() => {
        // Subtotal de servicios
        const servicesSubtotal = data.services.reduce((sum, service) => {
            const unitCost = parseFloat(service.unit_cost) || 0;
            const quantity = parseInt(service.quantity) || 0;
            return sum + unitCost * quantity;
        }, 0);

        // Incremento por componentes
        const incrementPercentage = currentIncrement ? currentIncrement.percentage : 0;
        const incrementAmount = servicesSubtotal * incrementPercentage;

        // Subtotal con incremento
        const subtotalWithIncrement = servicesSubtotal + incrementAmount;

        // Total de cajas (suma de todas las cajas)
        const boxTotal = data.boxes.reduce((sum, box) => {
            const unitCost = parseFloat(box.box_unit_cost) || 0;
            const quantity = parseInt(box.quantity) || 0;
            return sum + unitCost * quantity;
        }, 0);

        // Total general
        const total = subtotalWithIncrement + boxTotal;

        // Precio unitario por kit
        const kits = parseInt(data.total_kits) || 0;
        const unitPricePerKit = kits > 0 ? total / kits : 0;

        setTotals({
            servicesSubtotal,
            incrementAmount,
            subtotalWithIncrement,
            boxTotal,
            total,
            unitPricePerKit,
        });
    }, [data.services, data.boxes, data.total_kits, currentIncrement]);

    // Agregar caja
    const addBox = () => {
        setData('boxes', [
            ...data.boxes,
            {
                box_id: '',
                box_dimensions: '',
                box_unit_cost: '',
                quantity: '',
            },
        ]);
    };

    // Eliminar caja
    const removeBox = (index) => {
        const newBoxes = data.boxes.filter((_, i) => i !== index);
        setData('boxes', newBoxes);
    };

    // Actualizar caja
    const updateBox = (index, field, value) => {
        const newBoxes = [...data.boxes];
        newBoxes[index][field] = value;

        // Si se selecciona una caja del select, autocompletar dimensiones y costo
        if (field === 'box_id' && value) {
            // VALIDACIÓN: Verificar si la caja ya existe
            const isDuplicate = newBoxes.some((box, i) => i !== index && box.box_id === value);

            if (isDuplicate) {
                toast.error('Esta caja ya fue agregada al presupuesto');
                return; // No permitir la selección
            }

            const selectedBox = boxes.find((b) => b.id === parseInt(value));
            if (selectedBox) {
                newBoxes[index].box_dimensions = selectedBox.dimensions;
                newBoxes[index].box_unit_cost = selectedBox.cost;
            }
        }

        setData('boxes', newBoxes);
    };

    // Agregar servicio
    const addService = () => {
        setData('services', [
            ...data.services,
            {
                service_type: '',
                service_description: '',
                unit_cost: '',
                quantity: '',
            },
        ]);
    };

    // Eliminar servicio
    const removeService = (index) => {
        const newServices = data.services.filter((_, i) => i !== index);
        setData('services', newServices);
    };

    // Actualizar servicio
    const updateService = (index, field, value) => {
        const newServices = [...data.services];
        newServices[index][field] = value;
        setData('services', newServices);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('dashboard.picking.budgets.store'), {
            onSuccess: () => {
                toast.success('Presupuesto creado correctamente');
            },
            onError: () => {
                toast.error('Error al crear el presupuesto. Verifica los datos.');
            },
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(value);
    };

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

    return (
        <AppLayout user={auth.user} breadcrumbs={breadcrumbs}>
            <div className="p-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8"></div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Nuevo Presupuesto de Picking</h1>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Guardando...' : 'Guardar Presupuesto'}
                        </Button>
                    </div>

                    {/* Información del Cliente */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <Label htmlFor="client_id">Cliente *</Label>
                                    <ClientCombobox
                                        clients={clients}
                                        value={data.client_id}
                                        onChange={handleClientSelect}
                                        error={errors.client_id}
                                        placeholder="Seleccionar cliente..."
                                    />
                                    {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cantidades */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cantidades</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="total_kits">
                                        Total de Kits <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="total_kits"
                                        type="number"
                                        min="1"
                                        value={data.total_kits}
                                        onChange={(e) => setData('total_kits', e.target.value)}
                                        placeholder="100"
                                    />
                                    {errors.total_kits && <p className="mt-1 text-sm text-red-600">{errors.total_kits}</p>}
                                    {currentScale && (
                                        <p className="mt-1 text-sm text-green-600">
                                            ✓ Escala encontrada: {currentScale.quantity_from} - {currentScale.quantity_to || 'más'} kits
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
                                        min="1"
                                        value={data.total_components_per_kit}
                                        onChange={(e) => setData('total_components_per_kit', e.target.value)}
                                        placeholder="5"
                                    />
                                    {errors.total_components_per_kit && (
                                        <p className="mt-1 text-sm text-red-600">{errors.total_components_per_kit}</p>
                                    )}
                                    {currentIncrement && (
                                        <p className="mt-1 text-sm text-green-600">
                                            ✓ Incremento: {currentIncrement.description} ({(currentIncrement.percentage * 100).toFixed(0)}%)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Selección de Cajas */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Box className="h-5 w-5" />
                                Selección de Cajas
                            </CardTitle>
                            <Button type="button" onClick={addBox} size="sm" variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Caja
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {data.boxes.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    <Box className="mx-auto mb-3 h-12 w-12 opacity-30" />
                                    <p>No hay cajas agregadas.</p>
                                    <p className="mt-1 text-sm">Haz clic en "Agregar Caja" para añadir una o más cajas.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data.boxes.map((box, index) => (
                                        <div key={index} className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Caja #{index + 1}</span>
                                                <Button
                                                    type="button"
                                                    onClick={() => removeBox(index)}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                                                <div>
                                                    <Label htmlFor={`box_${index}_select`}>
                                                        Seleccionar Caja <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Select
                                                        value={box.box_id.toString()}
                                                        onValueChange={(value) => updateBox(index, 'box_id', value)}
                                                    >
                                                        <SelectTrigger id={`box_${index}_select`}>
                                                            <SelectValue placeholder="Elegir caja..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {boxes.map((b) => {
                                                                // Deshabilitar cajas ya seleccionadas
                                                                const isAlreadySelected = data.boxes.some(
                                                                    (selectedBox, i) => i !== index && selectedBox.box_id === b.id.toString(),
                                                                );

                                                                return (
                                                                    <SelectItem key={b.id} value={b.id.toString()} disabled={isAlreadySelected}>
                                                                        {b.dimensions} - ${b.cost}
                                                                        {isAlreadySelected && ' (Ya agregada)'}
                                                                    </SelectItem>
                                                                );
                                                            })}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors[`boxes.${index}.box_id`] && (
                                                        <p className="mt-1 text-sm text-red-600">{errors[`boxes.${index}.box_id`]}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor={`box_${index}_dimensions`}>Dimensiones</Label>
                                                    <Input
                                                        id={`box_${index}_dimensions`}
                                                        value={box.box_dimensions}
                                                        readOnly
                                                        className="bg-gray-100"
                                                        placeholder="Auto"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor={`box_${index}_cost`}>Costo Unitario</Label>
                                                    <Input
                                                        id={`box_${index}_cost`}
                                                        type="number"
                                                        step="0.01"
                                                        value={box.box_unit_cost}
                                                        onChange={(e) => updateBox(index, 'box_unit_cost', e.target.value)}
                                                        placeholder="0.00"
                                                    />
                                                    {errors[`boxes.${index}.box_unit_cost`] && (
                                                        <p className="mt-1 text-sm text-red-600">{errors[`boxes.${index}.box_unit_cost`]}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor={`box_${index}_quantity`}>
                                                        Cantidad <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id={`box_${index}_quantity`}
                                                        type="number"
                                                        min="1"
                                                        value={box.quantity}
                                                        onChange={(e) => updateBox(index, 'quantity', e.target.value)}
                                                        placeholder="1"
                                                    />
                                                    {errors[`boxes.${index}.quantity`] && (
                                                        <p className="mt-1 text-sm text-red-600">{errors[`boxes.${index}.quantity`]}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {box.box_unit_cost && box.quantity && (
                                                <div className="mt-2 text-right text-sm text-gray-600">
                                                    Subtotal:{' '}
                                                    <span className="font-medium text-gray-900">
                                                        {formatCurrency(parseFloat(box.box_unit_cost) * parseInt(box.quantity || 0))}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {errors.boxes && <p className="text-sm text-red-600">{errors.boxes}</p>}

                                    <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3">
                                        <span className="text-sm font-medium text-blue-900">Total Cajas:</span>
                                        <span className="text-lg font-bold text-blue-600">{formatCurrency(totals.boxTotal)}</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Servicios */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Servicios</CardTitle>
                            <Button type="button" onClick={addService} size="sm" variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Servicio
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {data.services.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    <p>No hay servicios agregados.</p>
                                    <p className="mt-1 text-sm">Haz clic en "Agregar Servicio" para añadir servicios al presupuesto.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data.services.map((service, index) => (
                                        <div key={index} className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Servicio #{index + 1}</span>
                                                <Button
                                                    type="button"
                                                    onClick={() => removeService(index)}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                                                <div>
                                                    <Label htmlFor={`service_${index}_type`}>Tipo</Label>
                                                    <Input
                                                        id={`service_${index}_type`}
                                                        value={service.service_type}
                                                        onChange={(e) => updateService(index, 'service_type', e.target.value)}
                                                        placeholder="assembly"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`service_${index}_desc`}>Descripción</Label>
                                                    <Input
                                                        id={`service_${index}_desc`}
                                                        value={service.service_description}
                                                        onChange={(e) => updateService(index, 'service_description', e.target.value)}
                                                        placeholder="Con armado"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`service_${index}_cost`}>Costo Unitario</Label>
                                                    <Input
                                                        id={`service_${index}_cost`}
                                                        type="number"
                                                        step="0.01"
                                                        value={service.unit_cost}
                                                        onChange={(e) => updateService(index, 'unit_cost', e.target.value)}
                                                        placeholder="120.00"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`service_${index}_qty`}>Cantidad</Label>
                                                    <Input
                                                        id={`service_${index}_qty`}
                                                        type="number"
                                                        min="1"
                                                        value={service.quantity}
                                                        onChange={(e) => updateService(index, 'quantity', e.target.value)}
                                                        placeholder="100"
                                                    />
                                                </div>
                                            </div>

                                            {service.unit_cost && service.quantity && (
                                                <div className="mt-2 text-right text-sm text-gray-600">
                                                    Subtotal:{' '}
                                                    <span className="font-medium text-gray-900">
                                                        {formatCurrency(parseFloat(service.unit_cost) * parseInt(service.quantity || 0))}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {errors.services && <p className="text-sm text-red-600">{errors.services}</p>}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Totales */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Totales del Presupuesto</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-600">Subtotal servicios</span>
                                    <span className="text-base font-medium">{formatCurrency(totals.servicesSubtotal)}</span>
                                </div>
                                {totals.incrementAmount > 0 && (
                                    <div className="flex items-center justify-between border-t py-2">
                                        <span className="text-sm text-gray-600">
                                            Incremento por componentes ({currentIncrement ? (currentIncrement.percentage * 100).toFixed(0) : 0}
                                            %)
                                        </span>
                                        <span className="text-base font-medium">{formatCurrency(totals.incrementAmount)}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between border-t py-2">
                                    <span className="text-sm text-gray-600">Subtotal con incremento</span>
                                    <span className="text-base font-medium">{formatCurrency(totals.subtotalWithIncrement)}</span>
                                </div>
                                <div className="flex items-center justify-between border-t py-2">
                                    <span className="text-sm text-gray-600">Total cajas</span>
                                    <span className="text-base font-medium">{formatCurrency(totals.boxTotal)}</span>
                                </div>
                                <div className="flex items-center justify-between border-t-2 border-gray-300 py-3">
                                    <span className="text-lg font-bold text-gray-900">TOTAL</span>
                                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(totals.total)}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                                    <span className="text-sm font-medium text-green-900">Precio unitario por kit</span>
                                    <span className="text-lg font-bold text-green-600">{formatCurrency(totals.unitPricePerKit)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notas */}
                    <Card>
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
                            {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                        </CardContent>
                    </Card>

                    {/* Botón de guardar al final */}
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('dashboard.picking.budgets.index'))}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Guardando...' : 'Guardar Presupuesto'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
