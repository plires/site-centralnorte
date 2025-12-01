// resources/js/pages/dashboard/picking/Create.jsx

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import ClientCombobox from '@/pages/dashboard/budgets/components/ClientCombobox';
import PaymentConditionSelector from '@/pages/dashboard/budgets/components/PaymentConditionSelector';
import { router, useForm } from '@inertiajs/react';
import { Box, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PickingBudgetTotalsSection from './components/PickingBudgetTotalsSection';

export default function Create({ auth, boxes, costScales, clients, componentIncrements, paymentConditions, businessConfig }) {
    const handleClientSelect = (clientId) => {
        setData('client_id', clientId);
    };

    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        picking_payment_condition_id: '',
        total_kits: '',
        total_components_per_kit: '',
        boxes: [],
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

    // Estados locales para los servicios
    const [assemblyType, setAssemblyType] = useState('');
    const [domeSticking, setDomeSticking] = useState(false);
    const [additionalAssembly, setAdditionalAssembly] = useState(false);
    const [qualityControl, setQualityControl] = useState(false);
    const [shavingsType, setShavingsType] = useState('');
    const [bagType, setBagType] = useState('');
    const [bagQuantity, setBagQuantity] = useState('');
    const [bubbleWrapType, setBubbleWrapType] = useState('');
    const [bubbleWrapQuantity, setBubbleWrapQuantity] = useState('');
    const [palletizingType, setPalletizingType] = useState('');
    const [labelingType, setLabelingType] = useState('cost_without_labeling');

    // Estado para payment condition seleccionada:
    const [selectedPaymentCondition, setSelectedPaymentCondition] = useState(null);

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
                (inc) => inc.components_from <= components && (inc.components_to === null || inc.components_to >= components),
            );
            setCurrentIncrement(increment || null);
        } else {
            setCurrentIncrement(null);
        }
    }, [data.total_components_per_kit, componentIncrements]);

    // Actualizar servicios cuando cambian las selecciones
    useEffect(() => {
        if (!currentScale) return;

        const newServices = [];

        // 1. Tipo de armado
        if (assemblyType) {
            const description =
                assemblyType === 'cost_without_assembly' ? 'Bolsa o caja que no requiera su armado' : 'Caja para armar o mochila con cierre';
            newServices.push({
                service_type: 'assembly',
                service_description: description,
                unit_cost: currentScale[assemblyType] || 0,
                quantity: parseInt(data.total_kits) || 1,
            });
        }

        // 2. Checkboxes opcionales
        if (domeSticking && currentScale.dome_sticking_unit) {
            newServices.push({
                service_type: 'dome_sticking',
                service_description: 'Pegado de domes',
                unit_cost: currentScale.dome_sticking_unit,
                quantity: parseInt(data.total_kits) || 1,
            });
        }

        if (additionalAssembly && currentScale.additional_assembly) {
            newServices.push({
                service_type: 'additional_assembly',
                service_description: 'Ensamble adicional',
                unit_cost: currentScale.additional_assembly,
                quantity: parseInt(data.total_kits) || 1,
            });
        }

        if (qualityControl && currentScale.quality_control) {
            newServices.push({
                service_type: 'quality_control',
                service_description: 'Control de calidad',
                unit_cost: currentScale.quality_control,
                quantity: parseInt(data.total_kits) || 1,
            });
        }

        // 3. Viruta
        if (shavingsType && shavingsType !== 'none') {
            const shavingsMap = {
                shavings_50g_unit: 'Viruta de madera x 50 grs (espacio de caja hasta 10x15cm aprox.)',
                shavings_100g_unit: 'Viruta de madera x 100 grs (espacio de caja hasta 20x15cm)',
                shavings_200g_unit: 'Viruta de madera x 200 grs (espacio de caja hasta 40x30cm)',
            };
            newServices.push({
                service_type: 'shavings',
                service_description: shavingsMap[shavingsType],
                unit_cost: currentScale[shavingsType] || 0,
                quantity: parseInt(data.total_kits) || 1,
            });
        }

        // 4. Bolsitas
        if (bagType && bagType !== 'none' && bagQuantity) {
            const bagMap = {
                bag_10x15_unit: 'Bolsitas transparentes con cinta bifaz de 10x15cm',
                bag_20x30_unit: 'Bolsitas transparentes con cinta bifaz de 20x30cm',
                bag_35x45_unit: 'Bolsitas transparentes con cinta bifaz de 35x45cm',
            };
            newServices.push({
                service_type: 'bag',
                service_description: bagMap[bagType],
                unit_cost: currentScale[bagType] || 0,
                quantity: parseInt(bagQuantity) || 1,
            });
        }

        // 5. Pluribol
        if (bubbleWrapType && bubbleWrapType !== 'none' && bubbleWrapQuantity) {
            const bubbleMap = {
                bubble_wrap_5x10_unit: 'Pluribol cuadrado de 5x10cm',
                bubble_wrap_10x15_unit: 'Pluribol cuadrado de 10x15cm',
                bubble_wrap_20x30_unit: 'Pluribol cuadrado de 20x30cm',
            };
            newServices.push({
                service_type: 'bubble_wrap',
                service_description: bubbleMap[bubbleWrapType],
                unit_cost: currentScale[bubbleWrapType] || 0,
                quantity: parseInt(bubbleWrapQuantity) || 1,
            });
        }

        // 6. Palletizado
        if (palletizingType && palletizingType !== 'none') {
            const palletMap = {
                palletizing_without_pallet: 'Con palletizado sin pallet incluidos (con film strech)',
                palletizing_with_pallet: 'Con palletizado con pallet incluidos + film strech',
            };
            newServices.push({
                service_type: 'palletizing',
                service_description: palletMap[palletizingType],
                unit_cost: currentScale[palletizingType] || 0,
                quantity: parseInt(data.total_kits) || 1,
            });
        }

        // 7. Rotulado
        if (labelingType) {
            const labelMap = {
                cost_with_labeling: 'Con rotulado especial',
                cost_without_labeling: 'Sin rotulado especial',
            };
            newServices.push({
                service_type: 'labeling',
                service_description: labelMap[labelingType],
                unit_cost: currentScale[labelingType] || 0,
                quantity: parseInt(data.total_kits) || 1,
            });
        }

        setData('services', newServices);
    }, [
        assemblyType,
        domeSticking,
        additionalAssembly,
        qualityControl,
        shavingsType,
        bagType,
        bagQuantity,
        bubbleWrapType,
        bubbleWrapQuantity,
        palletizingType,
        labelingType,
        currentScale,
        data.total_kits,
    ]);

    // Calcular totales
    useEffect(() => {
        // Calcular subtotal de servicios
        const servicesSubtotal = data.services.reduce((sum, service) => {
            const unitCost = parseFloat(service.unit_cost) || 0;
            const quantity = parseInt(service.quantity) || 0;
            return sum + unitCost * quantity;
        }, 0);

        // Calcular incremento por componentes
        const incrementPercentage = currentIncrement ? parseFloat(currentIncrement.percentage) : 0;
        const incrementAmount = servicesSubtotal * incrementPercentage;
        const subtotalWithIncrement = servicesSubtotal + incrementAmount;

        // Calcular total de cajas
        const boxTotal = data.boxes.reduce((sum, box) => {
            const unitCost = parseFloat(box.box_unit_cost) || 0;
            const quantity = parseInt(box.quantity) || 0;
            return sum + unitCost * quantity;
        }, 0);

        const subtotal = subtotalWithIncrement + boxTotal;

        // Calcular ajuste por condición de pago
        let paymentConditionAmount = 0;
        if (selectedPaymentCondition) {
            paymentConditionAmount = subtotal * (parseFloat(selectedPaymentCondition.percentage) / 100);
        }

        const subtotalWithPayment = subtotal + paymentConditionAmount;

        // Aplicar IVA
        const ivaRate = businessConfig?.iva_rate ?? 0.21;
        const applyIva = businessConfig?.apply_iva ?? true;
        const ivaAmount = applyIva ? subtotalWithPayment * ivaRate : 0;

        const total = subtotalWithPayment + ivaAmount;
        const unitPricePerKit = data.total_kits > 0 ? total / data.total_kits : 0;

        setTotals({
            servicesSubtotal,
            incrementAmount,
            subtotalWithIncrement,
            boxTotal,
            paymentConditionAmount,
            subtotalWithPayment,
            iva: ivaAmount,
            total,
            unitPricePerKit,
        });
    }, [data.services, data.boxes, data.total_kits, currentIncrement, selectedPaymentCondition, businessConfig]);

    const handlePaymentConditionChange = (conditionId) => {
        setData('picking_payment_condition_id', conditionId);

        if (conditionId) {
            const condition = paymentConditions.find((c) => c.id === parseInt(conditionId));
            setSelectedPaymentCondition(condition || null);
        } else {
            setSelectedPaymentCondition(null);
        }
    };

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
            // Verificar si la caja ya existe
            const isDuplicate = newBoxes.some((box, i) => i !== index && box.box_id === value);

            if (isDuplicate) {
                toast.error('Esta caja ya fue agregada al presupuesto');
                return;
            }

            const selectedBox = boxes.find((b) => b.id === parseInt(value));
            if (selectedBox) {
                newBoxes[index].box_dimensions = selectedBox.dimensions;
                newBoxes[index].box_unit_cost = selectedBox.cost;
            }
        }

        setData('boxes', newBoxes);
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
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                <div>
                                    <Label htmlFor="client_id">Condición de pago *</Label>
                                    {/* Selector de Condición de Pago */}
                                    <PaymentConditionSelector
                                        value={data.picking_payment_condition_id}
                                        onChange={handlePaymentConditionChange}
                                        paymentConditions={paymentConditions}
                                        disabled={processing}
                                        showInfo={true}
                                    />
                                    {errors.picking_payment_condition_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.picking_payment_condition_id}</p>
                                    )}
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
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {/* Producto madre */}
                                <div>
                                    <Label htmlFor="assembly_type">Producto madre del kit *</Label>
                                    <Select value={assemblyType} onValueChange={setAssemblyType}>
                                        <SelectTrigger id="assembly_type">
                                            <SelectValue placeholder="Seleccionar tipo de armado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cost_without_assembly">Bolsa o caja que no requiera su armado</SelectItem>
                                            <SelectItem value="cost_with_assembly">Caja para armar o mochila con cierre</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {currentScale && assemblyType && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            Costo: <span className="font-medium">{formatCurrency(currentScale[assemblyType])}</span> por kit
                                        </p>
                                    )}
                                </div>

                                {/* Kits Totales */}
                                <div>
                                    <Label htmlFor="total_kits">Kits Totales *</Label>
                                    <Input
                                        id="total_kits"
                                        type="number"
                                        min="1"
                                        value={data.total_kits}
                                        onChange={(e) => setData('total_kits', e.target.value)}
                                        placeholder="Ej: 100"
                                    />
                                    {errors.total_kits && <p className="mt-1 text-sm text-red-600">{errors.total_kits}</p>}
                                </div>

                                {/* Cantidad de componentes */}
                                <div>
                                    <Label htmlFor="total_components_per_kit">Cantidad de componentes por kit *</Label>
                                    <Input
                                        id="total_components_per_kit"
                                        type="number"
                                        min="1"
                                        value={data.total_components_per_kit}
                                        onChange={(e) => setData('total_components_per_kit', e.target.value)}
                                        placeholder="Ej: 5"
                                    />
                                    {errors.total_components_per_kit && (
                                        <p className="mt-1 text-sm text-red-600">{errors.total_components_per_kit}</p>
                                    )}
                                </div>
                            </div>

                            {/* Información de la escala actual */}
                            {currentScale && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                    <p className="text-sm text-blue-900">
                                        <span className="font-medium">Escala aplicada:</span> {currentScale.quantity_from} -{' '}
                                        {currentScale.quantity_to || 'o más'} kits | Tiempo de producción: {currentScale.production_time}
                                    </p>
                                </div>
                            )}

                            {/* Información del incremento */}
                            {currentIncrement && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                                    <p className="text-sm text-amber-900">
                                        <span className="font-medium">Incremento por componentes:</span> {currentIncrement.description} (
                                        {(currentIncrement.percentage * 100).toFixed(0)}%)
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    {/* Tipo de Armado */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tipo de Armado</CardTitle>
                        </CardHeader>
                        <CardContent></CardContent>
                    </Card>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Servicios Adicionales */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Servicios Adicionales (Opcional)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="dome_sticking" checked={domeSticking} onCheckedChange={setDomeSticking} />
                                        <Label htmlFor="dome_sticking" className="cursor-pointer text-sm font-normal">
                                            Pegado de domes
                                            {currentScale?.dome_sticking_unit && (
                                                <span className="ml-2 text-gray-600">
                                                    ({formatCurrency(currentScale.dome_sticking_unit)} por kit)
                                                </span>
                                            )}
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="additional_assembly" checked={additionalAssembly} onCheckedChange={setAdditionalAssembly} />
                                        <Label htmlFor="additional_assembly" className="cursor-pointer text-sm font-normal">
                                            Ensamble adicional
                                            {currentScale?.additional_assembly && (
                                                <span className="ml-2 text-gray-600">
                                                    ({formatCurrency(currentScale.additional_assembly)} por kit)
                                                </span>
                                            )}
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="quality_control" checked={qualityControl} onCheckedChange={setQualityControl} />
                                        <Label htmlFor="quality_control" className="cursor-pointer text-sm font-normal">
                                            Control de calidad
                                            {currentScale?.quality_control && (
                                                <span className="ml-2 text-gray-600">({formatCurrency(currentScale.quality_control)} por kit)</span>
                                            )}
                                        </Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Relleno - Viruta */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Relleno - Viruta (Opcional)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <Label htmlFor="shavings_type">Tipo de viruta</Label>
                                    <Select value={shavingsType} onValueChange={setShavingsType}>
                                        <SelectTrigger id="shavings_type">
                                            <SelectValue placeholder="Sin Viruta" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Sin Viruta</SelectItem>
                                            <SelectItem value="shavings_50g_unit">
                                                Viruta de madera x 50 grs (espacio de caja hasta 10x15cm aprox.)
                                            </SelectItem>
                                            <SelectItem value="shavings_100g_unit">
                                                Viruta de madera x 100 grs (espacio de caja hasta 20x15cm)
                                            </SelectItem>
                                            <SelectItem value="shavings_200g_unit">
                                                Viruta de madera x 200 grs (espacio de caja hasta 40x30cm)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {currentScale && shavingsType && shavingsType !== 'none' && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            Costo: <span className="font-medium">{formatCurrency(currentScale[shavingsType])}</span> por kit
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Empaque - Bolsitas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Empaque - Bolsitas (Opcional)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="bag_type">Tipo de bolsita</Label>
                                        <Select
                                            value={bagType}
                                            onValueChange={(value) => {
                                                setBagType(value);
                                                if (value === 'none') setBagQuantity('');
                                            }}
                                        >
                                            <SelectTrigger id="bag_type">
                                                <SelectValue placeholder="Sin Bolsita" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Sin Bolsita</SelectItem>
                                                <SelectItem value="bag_10x15_unit">Bolsitas transparentes con cinta bifaz de 10x15cm</SelectItem>
                                                <SelectItem value="bag_20x30_unit">Bolsitas transparentes con cinta bifaz de 20x30cm</SelectItem>
                                                <SelectItem value="bag_35x45_unit">Bolsitas transparentes con cinta bifaz de 35x45cm</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {currentScale && bagType && bagType !== 'none' && (
                                            <p className="mt-2 text-sm text-gray-600">
                                                Costo unitario: <span className="font-medium">{formatCurrency(currentScale[bagType])}</span>
                                            </p>
                                        )}
                                    </div>

                                    {bagType && bagType !== 'none' && (
                                        <div>
                                            <Label htmlFor="bag_quantity">Cantidad de bolsitas *</Label>
                                            <Input
                                                id="bag_quantity"
                                                type="number"
                                                min="1"
                                                value={bagQuantity}
                                                onChange={(e) => setBagQuantity(e.target.value)}
                                                placeholder="Ingrese la cantidad"
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Protección - Pluribol */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Protección - Pluribol (Opcional)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="bubble_wrap_type">Tipo de pluribol</Label>
                                        <Select
                                            value={bubbleWrapType}
                                            onValueChange={(value) => {
                                                setBubbleWrapType(value);
                                                if (value === 'none') setBubbleWrapQuantity('');
                                            }}
                                        >
                                            <SelectTrigger id="bubble_wrap_type">
                                                <SelectValue placeholder="Sin Pluribol" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Sin Pluribol</SelectItem>
                                                <SelectItem value="bubble_wrap_5x10_unit">Pluribol cuadrado de 5x10cm</SelectItem>
                                                <SelectItem value="bubble_wrap_10x15_unit">Pluribol cuadrado de 10x15cm</SelectItem>
                                                <SelectItem value="bubble_wrap_20x30_unit">Pluribol cuadrado de 20x30cm</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {currentScale && bubbleWrapType && bubbleWrapType !== 'none' && (
                                            <p className="mt-2 text-sm text-gray-600">
                                                Costo unitario: <span className="font-medium">{formatCurrency(currentScale[bubbleWrapType])}</span>
                                            </p>
                                        )}
                                    </div>

                                    {bubbleWrapType && bubbleWrapType !== 'none' && (
                                        <div>
                                            <Label htmlFor="bubble_wrap_quantity">Cantidad de pluriboles *</Label>
                                            <Input
                                                id="bubble_wrap_quantity"
                                                type="number"
                                                min="1"
                                                value={bubbleWrapQuantity}
                                                onChange={(e) => setBubbleWrapQuantity(e.target.value)}
                                                placeholder="Ingrese la cantidad"
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Logística - Palletizado */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Logística - Palletizado (Opcional)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <Label htmlFor="palletizing_type">Tipo de palletizado</Label>
                                    <Select value={palletizingType} onValueChange={setPalletizingType}>
                                        <SelectTrigger id="palletizing_type">
                                            <SelectValue placeholder="En bultos sueltos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">En bultos sueltos</SelectItem>
                                            <SelectItem value="palletizing_without_pallet">
                                                Con palletizado sin pallet incluidos (con film strech)
                                            </SelectItem>
                                            <SelectItem value="palletizing_with_pallet">
                                                Con palletizado con pallet incluidos + film strech
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {currentScale && palletizingType && palletizingType !== 'none' && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            Costo: <span className="font-medium">{formatCurrency(currentScale[palletizingType])}</span> por kit
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rotulado */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Rotulado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <Label htmlFor="labeling_type">Tipo de rotulado</Label>
                                    <Select value={labelingType} onValueChange={setLabelingType}>
                                        <SelectTrigger id="labeling_type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cost_without_labeling">Sin rotulado especial</SelectItem>
                                            <SelectItem value="cost_with_labeling">Con rotulado especial</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {currentScale && labelingType && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            Costo: <span className="font-medium">{formatCurrency(currentScale[labelingType])}</span> por kit
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Cajas */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Cajas (Opcional)</CardTitle>
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
                                                </div>
                                                <div>
                                                    <Label htmlFor={`box_${index}_dimensions`}>Dimensiones</Label>
                                                    <Input id={`box_${index}_dimensions`} value={box.box_dimensions} disabled placeholder="Auto" />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`box_${index}_cost`}>Costo Unitario</Label>
                                                    <Input id={`box_${index}_cost`} value={box.box_unit_cost} disabled placeholder="Auto" />
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
                                                </div>
                                            </div>

                                            {box.quantity && box.box_unit_cost && (
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
                    {/* Resumen de Totales */}
                    <PickingBudgetTotalsSection
                        totals={totals}
                        incrementInfo={currentIncrement}
                        paymentCondition={selectedPaymentCondition}
                        totalKits={data.total_kits}
                        ivaRate={businessConfig?.iva_rate ?? 0.21}
                        showIva={businessConfig?.apply_iva ?? true}
                    />
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
