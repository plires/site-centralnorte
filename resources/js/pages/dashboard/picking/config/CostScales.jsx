import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { useCostAdjustmentConfirmation } from '@/components/CostAdjustmentConfirmationDialog';
import { useDeleteConfirmation } from '@/components/DeleteConfirmationDialog';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Percent, Plus, Save, Trash2, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CostScales({ scales: initialScales }) {
    const { handleResponse } = useInertiaResponse();
    const { confirmAdjustment, CostAdjustmentConfirmationDialog } = useCostAdjustmentConfirmation();
    const { confirmDelete, DeleteConfirmationDialog } = useDeleteConfirmation();

    const [isMassEditMode, setIsMassEditMode] = useState(false);
    const [isIndividualEditMode, setIsIndividualEditMode] = useState(false);
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
                ...handleResponse(),
                onFinish: () => {
                    // Se ejecuta SIEMPRE (éxito o error)
                    setIsIndividualEditMode(false);
                    setHasChanges(false);
                    setPercentageValue('');
                },
            },
        );
    };

    const handleCancel = () => {
        // Restaurar valores originales
        setEditedScales(initialScales.map((scale) => ({ ...scale })));
        setIsIndividualEditMode(false);
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

        // Agregar la nueva fila AL PRINCIPIO del array
        setEditedScales([newScale, ...editedScales]);
        setHasChanges(true);

        // Activar automáticamente el modo edición individual
        if (!isIndividualEditMode) {
            setIsIndividualEditMode(true);
        }
    };

    const handleDeleteRow = async (index, scale) => {
        const rangeText =
            scale.quantity_from && scale.quantity_to
                ? `Rango de kits desde ${scale.quantity_from} a ${scale.quantity_to}`
                : scale.quantity_from
                  ? `${scale.quantity_from} o más`
                  : 'Sin rango definido';

        const confirmed = await confirmDelete({
            title: 'Eliminar Rango',
            description: `Esta acción eliminará el rango que contiene los rangos de kits desde ${scale.quantity_from} a ${scale.quantity_to} de la base de datos. Esta acción no se puede deshacer.`,
            itemName: rangeText,
        });

        if (!confirmed) return;

        router.delete(route('dashboard.picking.config.cost-scales.destroy', scale.id), {
            preserveScroll: true,
            ...handleResponse(() => {
                // Callback de éxito
                const newScales = [...editedScales];
                newScales.splice(index, 1);
                setEditedScales(newScales);
                setHasChanges(true);
                setEditedScales(newScales);
            }),
        });
    };

    // Función para aplicar incremento/decremento porcentual masivo
    const applyPercentageChange = async (isIncrease) => {
        const percentage = parseFloat(percentageValue);

        if (isNaN(percentage) || percentage <= 0) {
            alert('Por favor ingresa un porcentaje válido mayor a 0');
            return;
        }

        if (percentage > 100) {
            alert('El porcentaje no puede ser mayor a 100%');
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

        // Mostrar modal de confirmación
        const confirmed = await confirmAdjustment({
            title: `${isIncrease ? 'Incrementar' : 'Decrementar'} Valores`,
            description: `Esta acción ${isIncrease ? 'incrementará' : 'decrementará'} todos los valores numéricos de las escalas de costos en ${percentage}% y guardará los cambios automáticamente.`,
            percentage: percentage,
            affectedItems: `${editedScales.length} ${editedScales.length === 1 ? 'escala' : 'escalas'} (${numericFields.length} campos por escala)`,
            isIncrease: isIncrease,
        });

        // Si el usuario cancela, no hacer nada
        if (!confirmed) return;

        // Aplicar el cambio porcentual
        const multiplier = isIncrease ? 1 + percentage / 100 : 1 - percentage / 100;

        const newScales = editedScales.map((scale) => {
            const updatedScale = { ...scale };

            numericFields.forEach((field) => {
                const currentValue = parseFloat(updatedScale[field]);
                if (!isNaN(currentValue) && currentValue > 0) {
                    const newValue = currentValue * multiplier;
                    updatedScale[field] = Math.round(newValue * 100) / 100;
                }
            });

            return updatedScale;
        });

        // Guardar inmediatamente después de aplicar cambios
        router.put(
            route('dashboard.picking.config.cost-scales.update-all'),
            {
                scales: newScales,
            },
            {
                preserveScroll: true,
                ...handleResponse(),
                onFinish: () => {
                    // Se ejecuta SIEMPRE
                    setIsMassEditMode(false);
                    setHasChanges(false);
                    setPercentageValue('');
                },
            },
        );
    };

    // Verificar si hay nuevas filas sin guardar
    const hasNewRows = editedScales.some((scale) => scale.isNew);

    // Determinar si un campo debe estar deshabilitado
    const isFieldDisabled = (scale) => {
        // Si hay nuevas filas y esta NO es nueva, deshabilitar
        return hasNewRows && !scale.isNew;
    };

    // Componente reutilizable para celdas editables
    const EditableCell = ({ index, field, value, type = 'text', placeholder = '', className = '', scale }) => {
        const [localValue, setLocalValue] = useState(value || '');
        const disabled = isFieldDisabled(scale);

        // Sincronizar con el valor externo solo cuando cambia desde fuera
        useEffect(() => {
            setLocalValue(value || '');
        }, [value]);

        if (isIndividualEditMode) {
            const inputType = type === 'number' ? 'text' : type;

            return (
                <Input
                    type={inputType}
                    value={localValue}
                    onChange={(e) => {
                        const inputValue = e.target.value;
                        setLocalValue(inputValue);
                    }}
                    onBlur={() => {
                        let finalValue = localValue;

                        if (type === 'number' && finalValue) {
                            finalValue = String(finalValue).replace(/,/g, '.');
                        }

                        handleCellChange(index, field, finalValue);
                    }}
                    placeholder={placeholder}
                    className={`h-7 px-2 ${className}`}
                    inputMode={type === 'number' ? 'decimal' : undefined}
                    disabled={disabled}
                    style={{
                        fontSize: 12,
                    }}
                />
            );
        }

        // Modo solo lectura
        if (type === 'number' && field !== 'production_time') {
            const numValue = parseFloat(value);
            return <span className="text-xs">{!isNaN(numValue) ? `$${numValue.toFixed(2)}` : '-'}</span>;
        }

        return <span className="text-xs">{value || '-'}</span>;
    };

    return (
        <AppLayout>
            <Head title="Configuración - Escalas de Costos" />

            <div className="py-12">
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-lg font-medium">Configuración de Escalas de Costos</h3>
                                    <p className="text-muted-foreground mt-1 text-sm">Gestiona las escalas de costos para presupuestos de picking</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="mass-edit-mode"
                                            checked={isMassEditMode}
                                            onCheckedChange={(checked) => {
                                                setIsMassEditMode(checked);
                                                if (checked) setIsIndividualEditMode(false);
                                            }}
                                            disabled={hasNewRows}
                                        />
                                        <Label htmlFor="mass-edit-mode" className="cursor-pointer whitespace-nowrap">
                                            Modificación Masiva
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="individual-edit-mode"
                                            checked={isIndividualEditMode}
                                            onCheckedChange={(checked) => {
                                                setIsIndividualEditMode(checked);
                                                if (checked) setIsMassEditMode(false);
                                            }}
                                            disabled={hasNewRows}
                                        />
                                        <Label htmlFor="individual-edit-mode" className="cursor-pointer whitespace-nowrap">
                                            Modificación Individual
                                        </Label>
                                    </div>
                                    {!isIndividualEditMode && !isMassEditMode && (
                                        <Button onClick={handleAddRow}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Agregar Fila
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {isIndividualEditMode && hasChanges && (
                                <div className="mt-4 mb-5 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4">
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

                            {/* Banner informativo cuando hay filas nuevas */}
                            {hasNewRows && (
                                <div className="mt-4 mb-5 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <p className="text-sm text-blue-900">
                                        <strong>✨ Nueva fila agregada:</strong> Completa los datos de la nueva escala y presiona "Guardar Todos los
                                        Cambios" cuando termines. Las filas existentes están bloqueadas mientras agregas nuevas escalas.
                                    </p>
                                </div>
                            )}

                            {!isIndividualEditMode && !isMassEditMode && !hasNewRows && (
                                <div className="bg-muted/50 mt-4 mb-5 rounded-lg p-4">
                                    <p className="text-muted-foreground text-sm">
                                        💡 <strong>Tip:</strong> Activa <strong>Modificación Individual</strong> para editar celdas una por una, o{' '}
                                        <strong>Modificación Masiva</strong> para ajustar todos los valores con un porcentaje. Usa scroll horizontal
                                        para ver todas las columnas.
                                    </p>
                                </div>
                            )}

                            {/* Panel de incremento/decremento porcentual masivo */}
                            {isMassEditMode && (
                                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <Percent className="h-5 w-5 text-blue-600" />
                                        <h4 className="font-semibold text-blue-900">Ajuste Masivo de Valores</h4>
                                    </div>
                                    <p className="text-muted-foreground mb-4 text-sm">
                                        Incrementa o decrementa todos los valores numéricos de todas las filas en un porcentaje específico. Los
                                        cambios se guardarán automáticamente al confirmar.
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
                                        ⚠️ <strong>Nota:</strong> Al confirmar el ajuste, los cambios se aplicarán y guardarán automáticamente.
                                    </p>
                                </div>
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle>Listado de Escalas de Costos</CardTitle>
                                    <CardDescription>
                                        {isMassEditMode
                                            ? '📊 Modificación Masiva: Usa los controles para ajustar todos los valores'
                                            : isIndividualEditMode
                                              ? '✏️ Modificación Individual: Edita cada celda según necesites'
                                              : '📋 Vista de solo lectura: Activa un modo de edición para modificar'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    {isIndividualEditMode ? (
                                                        <>
                                                            <TableHead className="sticky left-0 z-10 bg-white px-2 py-2 text-xs">Desde</TableHead>
                                                            <TableHead className="px-2 py-2 text-xs">Hasta</TableHead>
                                                        </>
                                                    ) : (
                                                        <TableHead className="sticky left-0 z-10 bg-white px-2 py-2 text-xs">Rango</TableHead>
                                                    )}
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Sin
                                                        <br /> Armado
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Con
                                                        <br /> Armado
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Pal.
                                                        <br /> Sin P.
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Pal.
                                                        <br /> Con P.
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Con
                                                        <br /> Etiq.
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Sin
                                                        <br /> Etiq.
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Arm.
                                                        <br /> Adic.
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Ctrl.
                                                        <br /> Cal.
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Peg.
                                                        <br /> Domo
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Virutas
                                                        <br /> 50g
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Virutas
                                                        <br /> 100g
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Virutas
                                                        <br /> 200g
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Bolsa
                                                        <br /> 10x15
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Bolsa
                                                        <br /> 20x30
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Bolsa
                                                        <br /> 35x45
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Plub
                                                        <br /> 5x10
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Plub
                                                        <br /> 10x15
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Plub
                                                        <br /> 20x30
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        T.
                                                        <br /> Produc.
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">Estado</TableHead>
                                                    <TableHead className="sticky right-0 z-10 bg-white px-2 py-2 text-right text-xs">Acc.</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {editedScales.map((scale, index) => {
                                                    const disabled = isFieldDisabled(scale);

                                                    return (
                                                        <TableRow
                                                            key={scale.id}
                                                            className={`${scale.isNew ? 'border-l-4 border-green-500 bg-green-50' : ''} ${disabled ? 'opacity-50' : ''}`}
                                                        >
                                                            {isIndividualEditMode ? (
                                                                <>
                                                                    <TableCell className="sticky left-0 z-10 bg-white px-2 py-2">
                                                                        <EditableCell
                                                                            index={index}
                                                                            field="quantity_from"
                                                                            value={scale.quantity_from}
                                                                            type="number"
                                                                            placeholder="1"
                                                                            scale={scale}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="px-2 py-2">
                                                                        <EditableCell
                                                                            index={index}
                                                                            field="quantity_to"
                                                                            value={scale.quantity_to}
                                                                            type="number"
                                                                            placeholder="o más"
                                                                            scale={scale}
                                                                        />
                                                                    </TableCell>
                                                                </>
                                                            ) : (
                                                                <TableCell className="sticky left-0 z-10 bg-white px-2 py-2">
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
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                <EditableCell
                                                                    index={index}
                                                                    field="cost_with_assembly"
                                                                    value={scale.cost_with_assembly}
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                <EditableCell
                                                                    index={index}
                                                                    field="palletizing_without_pallet"
                                                                    value={scale.palletizing_without_pallet}
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                <EditableCell
                                                                    index={index}
                                                                    field="palletizing_with_pallet"
                                                                    value={scale.palletizing_with_pallet}
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                <EditableCell
                                                                    index={index}
                                                                    field="cost_with_labeling"
                                                                    value={scale.cost_with_labeling}
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                <EditableCell
                                                                    index={index}
                                                                    field="cost_without_labeling"
                                                                    value={scale.cost_without_labeling}
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                <EditableCell
                                                                    index={index}
                                                                    field="additional_assembly"
                                                                    value={scale.additional_assembly}
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                <EditableCell
                                                                    index={index}
                                                                    field="quality_control"
                                                                    value={scale.quality_control}
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                <EditableCell
                                                                    index={index}
                                                                    field="dome_sticking_unit"
                                                                    value={scale.dome_sticking_unit}
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                <EditableCell
                                                                    index={index}
                                                                    field="shavings_50g_unit"
                                                                    value={scale.shavings_50g_unit}
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                <EditableCell
                                                                    index={index}
                                                                    field="shavings_100g_unit"
                                                                    value={scale.shavings_100g_unit}
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                <EditableCell
                                                                    index={index}
                                                                    field="shavings_200g_unit"
                                                                    value={scale.shavings_200g_unit}
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                <EditableCell
                                                                    index={index}
                                                                    field="bag_10x15_unit"
                                                                    value={scale.bag_10x15_unit}
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                <EditableCell
                                                                    index={index}
                                                                    field="bag_20x30_unit"
                                                                    value={scale.bag_20x30_unit}
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                <EditableCell
                                                                    index={index}
                                                                    field="bag_35x45_unit"
                                                                    value={scale.bag_35x45_unit}
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                <EditableCell
                                                                    index={index}
                                                                    field="bubble_wrap_5x10_unit"
                                                                    value={scale.bubble_wrap_5x10_unit}
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                <EditableCell
                                                                    index={index}
                                                                    field="bubble_wrap_10x15_unit"
                                                                    value={scale.bubble_wrap_10x15_unit}
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                <EditableCell
                                                                    index={index}
                                                                    field="bubble_wrap_20x30_unit"
                                                                    value={scale.bubble_wrap_20x30_unit}
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                <EditableCell
                                                                    index={index}
                                                                    field="production_time"
                                                                    value={scale.production_time}
                                                                    type="number"
                                                                    placeholder="0"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2">
                                                                {isIndividualEditMode ? (
                                                                    <Switch
                                                                        checked={scale.is_active}
                                                                        onCheckedChange={(checked) => handleCellChange(index, 'is_active', checked)}
                                                                        disabled={disabled}
                                                                    />
                                                                ) : (
                                                                    <Badge variant={scale.is_active ? 'default' : 'secondary'} className="text-xs">
                                                                        {scale.is_active ? 'Activa' : 'Inactiva'}
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="sticky right-0 z-10 bg-white px-2 py-2 text-right">
                                                                {!isIndividualEditMode && !isMassEditMode && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => handleDeleteRow(index, scale)}
                                                                        className="h-7 w-7 p-0 hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="text-destructive h-3.5 w-3.5" />
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}

                                                {editedScales.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={22} className="text-muted-foreground py-8 text-center text-sm">
                                                            No hay escalas de costos registradas. Haz clic en "Agregar Fila" para crear una.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modales de confirmación */}
            <CostAdjustmentConfirmationDialog />
            <DeleteConfirmationDialog />
        </AppLayout>
    );
}
