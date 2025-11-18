import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Percent, Plus, Save, Trash2, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CostScales({ scales: initialScales }) {
    const { handleResponse } = useInertiaResponse();

    const [isEditMode, setIsEditMode] = useState(false);
    const [editedScales, setEditedScales] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [percentageValue, setPercentageValue] = useState('');

    // Inicializar editedScales cuando cambian las escalas
    useEffect(() => {
        setEditedScales(initialScales.map((scale) => ({ ...scale })));
    }, [initialScales]);

    const handleCellChange = (index, field, value) => {
        const newScales = [...editedScales];
        newScales[index] = {
            ...newScales[index],
            [field]: value,
        };
        setEditedScales(newScales);
        setHasChanges(true);
    };

    const handleSaveAll = () => {
        router.put(
            route('dashboard.picking.config.cost-scales.update-all'),
            {
                scales: editedScales,
            },
            {
                preserveScroll: true,
                ...handleResponse(() => {
                    // Callback de éxito
                    setIsEditMode(false);
                    setHasChanges(false);
                    setPercentageValue('');
                }),
            },
        );
    };

    const handleCancel = () => {
        // Restaurar valores originales
        setEditedScales(initialScales.map((scale) => ({ ...scale })));
        setIsEditMode(false);
        setHasChanges(false);
        setPercentageValue('');
    };

    const handleAddRow = () => {
        const newScale = {
            id: `new-${Date.now()}`,
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
            is_active: true,
            isNew: true,
        };
        setEditedScales([...editedScales, newScale]);
        setHasChanges(true);
        if (!isEditMode) {
            setIsEditMode(true);
        }
    };

    const handleDeleteRow = (index) => {
        if (confirm('¿Estás seguro de eliminar esta escala de costos?')) {
            const newScales = [...editedScales];
            newScales.splice(index, 1);
            setEditedScales(newScales);
            setHasChanges(true);
        }
    };

    // Función para aplicar incremento/decremento porcentual masivo
    const applyPercentageChange = (isIncrease) => {
        const percentage = parseFloat(percentageValue);

        if (isNaN(percentage) || percentage <= 0) {
            alert('Por favor ingresa un porcentaje válido mayor a 0');
            return;
        }

        if (percentage > 100) {
            alert('El porcentaje no puede ser mayor a 100%');
            return;
        }

        // Confirmar la acción
        const action = isIncrease ? 'incrementar' : 'decrementar';
        if (!confirm(`¿Estás seguro de ${action} todos los valores numéricos en ${percentage}%?`)) {
            return;
        }

        // Campos numéricos que se pueden modificar
        const numericFields = [
            'cost_without_assembly',
            'cost_with_assembly',
            'palletizing_without_pallet',
            'palletizing_with_pallet',
            'cost_with_labeling',
            'cost_without_labeling',
            'additional_assembly',
            'quality_control',
            'dome_sticking_unit',
            'shavings_50g_unit',
            'shavings_100g_unit',
            'shavings_200g_unit',
            'bag_10x15_unit',
            'bag_20x30_unit',
            'bag_35x45_unit',
            'bubble_wrap_5x10_unit',
            'bubble_wrap_10x15_unit',
            'bubble_wrap_20x30_unit',
        ];

        const multiplier = isIncrease ? 1 + percentage / 100 : 1 - percentage / 100;

        const newScales = editedScales.map((scale) => {
            const updatedScale = { ...scale };

            numericFields.forEach((field) => {
                const currentValue = parseFloat(updatedScale[field]);
                if (!isNaN(currentValue) && currentValue > 0) {
                    // Guardar sin toFixed para mantener los decimales originales
                    const newValue = currentValue * multiplier;
                    // Redondear a 2 decimales pero sin forzar el formato
                    updatedScale[field] = Math.round(newValue * 100) / 100;
                }
            });

            return updatedScale;
        });

        setEditedScales(newScales);
        setHasChanges(true);
        setPercentageValue(''); // Limpiar el input después de aplicar
    };

    // Componente reutilizable para celdas editables
    const EditableCell = ({ index, field, value, type = 'text', placeholder = '', className = '' }) => {
        const [localValue, setLocalValue] = useState(value || '');

        // Sincronizar con el valor externo solo cuando cambia desde fuera
        useEffect(() => {
            setLocalValue(value || '');
        }, [value]);

        if (isEditMode) {
            const inputType = type === 'number' ? 'text' : type;

            return (
                <Input
                    type={inputType}
                    value={localValue}
                    onChange={(e) => {
                        const inputValue = e.target.value;
                        setLocalValue(inputValue); // Actualizar estado local inmediatamente
                    }}
                    onBlur={(e) => {
                        // Solo actualizar el estado global cuando pierda el foco
                        let finalValue = localValue;

                        if (type === 'number') {
                            finalValue = finalValue.replace(',', '.');
                        }

                        handleCellChange(index, field, finalValue);
                    }}
                    placeholder={placeholder}
                    className={`h-7 px-2 text-xs ${className}`}
                    inputMode={type === 'number' ? 'decimal' : undefined}
                />
            );
        }
        return <span className="text-xs font-medium">{value ? parseFloat(value) : '-'}</span>;
    };

    return (
        <AppLayout>
            <Head title="Configuración - Escalas de Costos" />

            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-lg font-medium">Configuración de Escalas de Costos</h3>
                                    <p className="text-muted-foreground mt-1 text-sm">Gestiona las escalas de precios según la cantidad de kits</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch id="edit-mode" checked={isEditMode} onCheckedChange={setIsEditMode} />
                                        <Label htmlFor="edit-mode" className="cursor-pointer">
                                            Modo Edición
                                        </Label>
                                    </div>
                                    {!isEditMode && (
                                        <Button onClick={handleAddRow}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Agregar Fila
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Panel de incremento/decremento porcentual masivo */}
                            {isEditMode && (
                                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <Percent className="h-5 w-5 text-blue-600" />
                                        <h4 className="font-semibold text-blue-900">Ajuste Masivo de Valores</h4>
                                    </div>
                                    <p className="text-muted-foreground mb-4 text-sm">
                                        Incrementa o decrementa todos los valores numéricos de todas las filas en un porcentaje específico
                                    </p>
                                    <div className="flex flex-wrap items-end gap-3">
                                        <div className="min-w-[200px] flex-1">
                                            <Label htmlFor="percentage" className="mb-2 block text-sm font-medium">
                                                Porcentaje (%)
                                            </Label>
                                            <Input
                                                id="percentage"
                                                type="number"
                                                value={percentageValue}
                                                onChange={(e) => setPercentageValue(e.target.value)}
                                                placeholder="Ej: 10"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                className="h-10"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => applyPercentageChange(true)}
                                                variant="default"
                                                disabled={!percentageValue}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <TrendingUp className="mr-2 h-4 w-4" />
                                                Incrementar
                                            </Button>
                                            <Button
                                                onClick={() => applyPercentageChange(false)}
                                                variant="default"
                                                disabled={!percentageValue}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                <TrendingDown className="mr-2 h-4 w-4" />
                                                Decrementar
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground mt-3 text-xs">
                                        ⚠️ <strong>Importante:</strong> Esta acción afectará todas las celdas numéricas de todas las filas. Asegúrate
                                        de revisar los cambios antes de guardar.
                                    </p>
                                </div>
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle>Listado de Escalas de Costos</CardTitle>
                                    <CardDescription>
                                        {isEditMode
                                            ? '✏️ Modo edición activo: Modifica las celdas que necesites y guarda todos los cambios juntos'
                                            : '📋 Vista de solo lectura: Activa el modo edición para modificar'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="text-xs">
                                                    {isEditMode ? (
                                                        <>
                                                            <TableHead className="sticky left-0 min-w-[80px] bg-white px-2 py-2 text-xs">
                                                                Desde
                                                            </TableHead>
                                                            <TableHead className="min-w-[80px] px-2 py-2 text-xs">Hasta</TableHead>
                                                        </>
                                                    ) : (
                                                        <TableHead className="sticky left-0 min-w-[120px] bg-white px-2 py-2 text-xs">
                                                            Rango
                                                        </TableHead>
                                                    )}
                                                    <TableHead className="min-w-[100px] px-2 py-2 text-xs">Sin Armado</TableHead>
                                                    <TableHead className="min-w-[100px] px-2 py-2 text-xs">Con Armado</TableHead>
                                                    <TableHead className="min-w-[100px] px-2 py-2 text-xs">Paletiz. S/P</TableHead>
                                                    <TableHead className="min-w-[100px] px-2 py-2 text-xs">Paletiz. C/P</TableHead>
                                                    <TableHead className="min-w-[100px] px-2 py-2 text-xs">Con Etiq.</TableHead>
                                                    <TableHead className="min-w-[100px] px-2 py-2 text-xs">Sin Etiq.</TableHead>
                                                    <TableHead className="min-w-[100px] px-2 py-2 text-xs">Armado Adic.</TableHead>
                                                    <TableHead className="min-w-[100px] px-2 py-2 text-xs">Control Cal.</TableHead>
                                                    <TableHead className="min-w-[90px] px-2 py-2 text-xs">Pegado Dome</TableHead>
                                                    <TableHead className="min-w-[90px] px-2 py-2 text-xs">Virutas 50g</TableHead>
                                                    <TableHead className="min-w-[90px] px-2 py-2 text-xs">Virutas 100g</TableHead>
                                                    <TableHead className="min-w-[90px] px-2 py-2 text-xs">Virutas 200g</TableHead>
                                                    <TableHead className="min-w-[90px] px-2 py-2 text-xs">Bolsa 10x15</TableHead>
                                                    <TableHead className="min-w-[90px] px-2 py-2 text-xs">Bolsa 20x30</TableHead>
                                                    <TableHead className="min-w-[90px] px-2 py-2 text-xs">Bolsa 35x45</TableHead>
                                                    <TableHead className="min-w-[90px] px-2 py-2 text-xs">Burb. 5x10</TableHead>
                                                    <TableHead className="min-w-[90px] px-2 py-2 text-xs">Burb. 10x15</TableHead>
                                                    <TableHead className="min-w-[90px] px-2 py-2 text-xs">Burb. 20x30</TableHead>
                                                    <TableHead className="min-w-[100px] px-2 py-2 text-xs">T. Produc.</TableHead>
                                                    <TableHead className="min-w-[80px] px-2 py-2 text-xs">Estado</TableHead>
                                                    {isEditMode && (
                                                        <TableHead className="sticky right-0 bg-white px-2 py-2 text-right text-xs">Acc.</TableHead>
                                                    )}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {editedScales.map((scale, index) => (
                                                    <TableRow key={scale.id} className={scale.isNew ? 'bg-blue-50' : ''}>
                                                        {isEditMode ? (
                                                            <>
                                                                <TableCell className="sticky left-0 bg-white px-2 py-2">
                                                                    <EditableCell
                                                                        index={index}
                                                                        field="quantity_from"
                                                                        value={scale.quantity_from}
                                                                        type="number"
                                                                        placeholder="1"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="px-2 py-2">
                                                                    <EditableCell
                                                                        index={index}
                                                                        field="quantity_to"
                                                                        value={scale.quantity_to}
                                                                        type="number"
                                                                        placeholder="o más"
                                                                    />
                                                                </TableCell>
                                                            </>
                                                        ) : (
                                                            <TableCell className="sticky left-0 bg-white px-2 py-2">
                                                                <span className="text-xs font-medium">
                                                                    {scale.quantity_from && scale.quantity_to
                                                                        ? `de ${scale.quantity_from} a ${scale.quantity_to}`
                                                                        : scale.quantity_from
                                                                          ? `${scale.quantity_from} o más`
                                                                          : '-'}
                                                                </span>
                                                            </TableCell>
                                                        )}
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="cost_without_assembly"
                                                                value={scale.cost_without_assembly}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="cost_with_assembly"
                                                                value={scale.cost_with_assembly}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="palletizing_without_pallet"
                                                                value={scale.palletizing_without_pallet}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="palletizing_with_pallet"
                                                                value={scale.palletizing_with_pallet}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="cost_with_labeling"
                                                                value={scale.cost_with_labeling}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="cost_without_labeling"
                                                                value={scale.cost_without_labeling}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="additional_assembly"
                                                                value={scale.additional_assembly}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="quality_control"
                                                                value={scale.quality_control}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="dome_sticking_unit"
                                                                value={scale.dome_sticking_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="shavings_50g_unit"
                                                                value={scale.shavings_50g_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="shavings_100g_unit"
                                                                value={scale.shavings_100g_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="shavings_200g_unit"
                                                                value={scale.shavings_200g_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="bag_10x15_unit"
                                                                value={scale.bag_10x15_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="bag_20x30_unit"
                                                                value={scale.bag_20x30_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="bag_35x45_unit"
                                                                value={scale.bag_35x45_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="bubble_wrap_5x10_unit"
                                                                value={scale.bubble_wrap_5x10_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="bubble_wrap_10x15_unit"
                                                                value={scale.bubble_wrap_10x15_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="bubble_wrap_20x30_unit"
                                                                value={scale.bubble_wrap_20x30_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            <EditableCell
                                                                index={index}
                                                                field="production_time"
                                                                value={scale.production_time}
                                                                type="text"
                                                                placeholder="24 hs"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-2 py-2">
                                                            {isEditMode ? (
                                                                <Switch
                                                                    checked={scale.is_active}
                                                                    onCheckedChange={(checked) => handleCellChange(index, 'is_active', checked)}
                                                                />
                                                            ) : (
                                                                <Badge variant={scale.is_active ? 'default' : 'secondary'} className="text-xs">
                                                                    {scale.is_active ? 'Activa' : 'Inactiva'}
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        {isEditMode && (
                                                            <TableCell className="sticky right-0 bg-white px-2 py-2 text-right">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDeleteRow(index)}
                                                                    className="h-7 w-7 p-0"
                                                                >
                                                                    <Trash2 className="text-destructive h-3.5 w-3.5" />
                                                                </Button>
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                ))}

                                                {editedScales.length === 0 && (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={isEditMode ? 23 : 22}
                                                            className="text-muted-foreground py-8 text-center text-sm"
                                                        >
                                                            No hay escalas de costos registradas. Haz clic en "Agregar Fila" para crear una.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {isEditMode && hasChanges && (
                                        <div className="m-6 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500"></div>
                                                <span className="text-sm font-medium text-amber-900">Tienes cambios sin guardar</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" onClick={handleCancel}>
                                                    <X className="mr-2 h-4 w-4" />
                                                    Cancelar
                                                </Button>
                                                <Button onClick={handleSaveAll}>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Guardar Todos los Cambios
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {!isEditMode && (
                                        <div className="bg-muted/50 m-6 rounded-lg p-4">
                                            <p className="text-muted-foreground text-sm">
                                                💡 <strong>Tip:</strong> Activa el "Modo Edición" para modificar todas las celdas que necesites y
                                                guardar todos los cambios de una sola vez. Usa scroll horizontal para ver todas las columnas.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
