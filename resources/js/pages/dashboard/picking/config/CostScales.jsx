import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Save, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Escalas de Costos',
        href: '/dashboard/picking/config/cost-scales',
    },
];

export default function CostScales({ scales }) {
    useInertiaResponse();

    const [expandedId, setExpandedId] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, put, processing, reset } = useForm({
        quantity_from: '',
        quantity_to: '',
        cost_without_assembly: '',
        cost_with_assembly: '',
        palletizing_without_pallet: '',
        palletizing_with_pallet: '',
        cost_with_labeling: '',
        cost_without_labeling: '',
        additional_assembly: '',
        quality_control: '',
        dome_sticking_unit: '',
        shavings_50g_unit: '',
        shavings_100g_unit: '',
        shavings_200g_unit: '',
        bag_10x15_unit: '',
        bag_20x30_unit: '',
        bag_35x45_unit: '',
        bubble_wrap_5x10_unit: '',
        bubble_wrap_10x15_unit: '',
        bubble_wrap_20x30_unit: '',
        production_time: '',
    });

    const startEdit = (scale) => {
        setEditingId(scale.id);
        setExpandedId(scale.id);
        setData({
            quantity_from: scale.quantity_from,
            quantity_to: scale.quantity_to || '',
            cost_without_assembly: scale.cost_without_assembly,
            cost_with_assembly: scale.cost_with_assembly,
            palletizing_without_pallet: scale.palletizing_without_pallet,
            palletizing_with_pallet: scale.palletizing_with_pallet,
            cost_with_labeling: scale.cost_with_labeling,
            cost_without_labeling: scale.cost_without_labeling,
            additional_assembly: scale.additional_assembly,
            quality_control: scale.quality_control,
            dome_sticking_unit: scale.dome_sticking_unit,
            shavings_50g_unit: scale.shavings_50g_unit,
            shavings_100g_unit: scale.shavings_100g_unit,
            shavings_200g_unit: scale.shavings_200g_unit,
            bag_10x15_unit: scale.bag_10x15_unit,
            bag_20x30_unit: scale.bag_20x30_unit,
            bag_35x45_unit: scale.bag_35x45_unit,
            bubble_wrap_5x10_unit: scale.bubble_wrap_5x10_unit,
            bubble_wrap_10x15_unit: scale.bubble_wrap_10x15_unit,
            bubble_wrap_20x30_unit: scale.bubble_wrap_20x30_unit,
            production_time: scale.production_time,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        reset();
    };

    const handleSave = (id) => {
        put(route('picking.config.cost-scales.update', id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
                reset();
            },
        });
    };

    const toggleExpand = (id) => {
        if (editingId === id) return;
        setExpandedId(expandedId === id ? null : id);
    };

    const formatRange = (scale) => {
        if (!scale.quantity_to) return `${scale.quantity_from.toLocaleString()}+`;
        return `${scale.quantity_from.toLocaleString()} - ${scale.quantity_to.toLocaleString()}`;
    };

    const EditableInput = ({ field, value, label, type = 'number' }) => (
        <div className="space-y-1">
            <label className="text-muted-foreground text-xs font-medium">{label}</label>
            <Input
                type={type}
                step={type === 'number' ? '0.01' : undefined}
                value={value}
                onChange={(e) => setData(field, e.target.value)}
                disabled={processing}
                className="h-8"
            />
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración - Escalas de Costos" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Escalas de Costos</h1>
                    <p className="text-muted-foreground mt-1">Gestiona las escalas de precios según cantidad de kits</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Escalas</CardTitle>
                        <CardDescription>Haz clic en una fila para expandir y ver todos los costos. Edita los valores directamente.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {scales.map((scale) => (
                                <div key={scale.id} className="rounded-lg border">
                                    {/* Fila principal */}
                                    <div
                                        className={cn(
                                            'hover:bg-muted/50 flex cursor-pointer items-center gap-4 p-4 transition-colors',
                                            expandedId === scale.id && 'bg-muted/50',
                                        )}
                                        onClick={() => toggleExpand(scale.id)}
                                    >
                                        <div className="flex-shrink-0">
                                            {expandedId === scale.id ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                        </div>
                                        <div className="grid flex-1 grid-cols-4 gap-4">
                                            <div>
                                                <div className="text-muted-foreground text-xs">Rango de Kits</div>
                                                <div className="font-medium">{formatRange(scale)}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground text-xs">Sin Armado</div>
                                                <div className="font-medium">${parseFloat(scale.cost_without_assembly).toFixed(2)}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground text-xs">Con Armado</div>
                                                <div className="font-medium">${parseFloat(scale.cost_with_assembly).toFixed(2)}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground text-xs">Tiempo Producción</div>
                                                <div className="font-medium">{scale.production_time}</div>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {editingId === scale.id ? (
                                                <Badge variant="default">Editando...</Badge>
                                            ) : (
                                                <Badge variant={scale.is_active ? 'default' : 'secondary'}>
                                                    {scale.is_active ? 'Activa' : 'Inactiva'}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contenido expandido */}
                                    {expandedId === scale.id && (
                                        <div className="bg-muted/20 border-t p-4">
                                            {editingId === scale.id ? (
                                                <div className="space-y-6">
                                                    {/* Rango */}
                                                    <div>
                                                        <h4 className="mb-3 font-semibold">Rango de Cantidad</h4>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <EditableInput field="quantity_from" value={data.quantity_from} label="Desde" />
                                                            <EditableInput
                                                                field="quantity_to"
                                                                value={data.quantity_to}
                                                                label="Hasta (vacío = ilimitado)"
                                                            />
                                                            <EditableInput
                                                                field="production_time"
                                                                value={data.production_time}
                                                                label="Tiempo de Producción"
                                                                type="text"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Servicios Base */}
                                                    <div>
                                                        <h4 className="mb-3 font-semibold">Servicios Base</h4>
                                                        <div className="grid grid-cols-4 gap-4">
                                                            <EditableInput
                                                                field="cost_without_assembly"
                                                                value={data.cost_without_assembly}
                                                                label="Sin Armado"
                                                            />
                                                            <EditableInput
                                                                field="cost_with_assembly"
                                                                value={data.cost_with_assembly}
                                                                label="Con Armado"
                                                            />
                                                            <EditableInput
                                                                field="additional_assembly"
                                                                value={data.additional_assembly}
                                                                label="Ensamble Adicional"
                                                            />
                                                            <EditableInput
                                                                field="quality_control"
                                                                value={data.quality_control}
                                                                label="Control Calidad"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Palletizado */}
                                                    <div>
                                                        <h4 className="mb-3 font-semibold">Palletizado</h4>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <EditableInput
                                                                field="palletizing_without_pallet"
                                                                value={data.palletizing_without_pallet}
                                                                label="Sin Pallet"
                                                            />
                                                            <EditableInput
                                                                field="palletizing_with_pallet"
                                                                value={data.palletizing_with_pallet}
                                                                label="Con Pallet"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Rotulado */}
                                                    <div>
                                                        <h4 className="mb-3 font-semibold">Rotulado</h4>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <EditableInput
                                                                field="cost_with_labeling"
                                                                value={data.cost_with_labeling}
                                                                label="Con Rotulado"
                                                            />
                                                            <EditableInput
                                                                field="cost_without_labeling"
                                                                value={data.cost_without_labeling}
                                                                label="Sin Rotulado"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Materiales */}
                                                    <div>
                                                        <h4 className="mb-3 font-semibold">Materiales (Costo Unitario)</h4>
                                                        <div className="grid grid-cols-4 gap-4">
                                                            <EditableInput field="dome_sticking_unit" value={data.dome_sticking_unit} label="Domes" />
                                                            <EditableInput
                                                                field="shavings_50g_unit"
                                                                value={data.shavings_50g_unit}
                                                                label="Viruta 50g"
                                                            />
                                                            <EditableInput
                                                                field="shavings_100g_unit"
                                                                value={data.shavings_100g_unit}
                                                                label="Viruta 100g"
                                                            />
                                                            <EditableInput
                                                                field="shavings_200g_unit"
                                                                value={data.shavings_200g_unit}
                                                                label="Viruta 200g"
                                                            />
                                                            <EditableInput field="bag_10x15_unit" value={data.bag_10x15_unit} label="Bolsita 10x15" />
                                                            <EditableInput field="bag_20x30_unit" value={data.bag_20x30_unit} label="Bolsita 20x30" />
                                                            <EditableInput field="bag_35x45_unit" value={data.bag_35x45_unit} label="Bolsita 35x45" />
                                                            <EditableInput
                                                                field="bubble_wrap_5x10_unit"
                                                                value={data.bubble_wrap_5x10_unit}
                                                                label="Pluribol 5x10"
                                                            />
                                                            <EditableInput
                                                                field="bubble_wrap_10x15_unit"
                                                                value={data.bubble_wrap_10x15_unit}
                                                                label="Pluribol 10x15"
                                                            />
                                                            <EditableInput
                                                                field="bubble_wrap_20x30_unit"
                                                                value={data.bubble_wrap_20x30_unit}
                                                                label="Pluribol 20x30"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Botones */}
                                                    <div className="flex justify-end gap-2 border-t pt-4">
                                                        <Button variant="ghost" onClick={cancelEdit} disabled={processing}>
                                                            <X className="mr-2 h-4 w-4" />
                                                            Cancelar
                                                        </Button>
                                                        <Button onClick={() => handleSave(scale.id)} disabled={processing}>
                                                            <Save className="mr-2 h-4 w-4" />
                                                            Guardar Cambios
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end">
                                                    <Button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            startEdit(scale);
                                                        }}
                                                    >
                                                        Editar Escala
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {scales.length === 0 && (
                                <div className="text-muted-foreground py-12 text-center">No hay escalas de costos registradas.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
