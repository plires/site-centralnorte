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

export default function Boxes({ boxes: initialBoxes }) {
    const { handleResponse } = useInertiaResponse();
    const { confirmAdjustment, CostAdjustmentConfirmationDialog } = useCostAdjustmentConfirmation();
    const { confirmDelete, DeleteConfirmationDialog } = useDeleteConfirmation();

    const [isMassEditMode, setIsMassEditMode] = useState(false);
    const [isIndividualEditMode, setIsIndividualEditMode] = useState(false);
    const [editedBoxes, setEditedBoxes] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [percentageValue, setPercentageValue] = useState('');

    // Inicializar editedBoxes cuando cambian las cajas
    useEffect(() => {
        setEditedBoxes(initialBoxes.map((box) => ({ ...box })));
    }, [initialBoxes]);

    const handleCellChange = (index, field, value) => {
        const newBoxes = [...editedBoxes];
        newBoxes[index] = {
            ...newBoxes[index],
            [field]: value,
        };
        setEditedBoxes(newBoxes);
        setHasChanges(true);
    };

    const handleSaveAll = () => {
        router.put(
            route('dashboard.picking.config.boxes.update-all'),
            {
                boxes: editedBoxes,
            },
            {
                preserveScroll: true,
                ...handleResponse(() => {
                    // Callback de éxito
                    setIsIndividualEditMode(false);
                    setHasChanges(false);
                    setPercentageValue('');
                }),
            },
        );
    };

    const handleCancel = () => {
        // Restaurar valores originales
        setEditedBoxes(initialBoxes.map((box) => ({ ...box })));
        setIsIndividualEditMode(false);
        setHasChanges(false);
        setPercentageValue('');
    };

    const handleAddRow = () => {
        const newBox = {
            id: `new-${Date.now()}`,
            dimensions: '',
            cost: '',
            is_active: true,
            isNew: true,
        };
        setEditedBoxes([...editedBoxes, newBox]);
        setHasChanges(true);
        if (!isIndividualEditMode) {
            setIsIndividualEditMode(true);
        }
    };

    const handleDeleteRow = async (index, box) => {
        const confirmed = await confirmDelete({
            title: 'Eliminar Caja',
            description: 'Esta acción eliminará la caja de la base de datos. Si está en uso, será desactivada.',
            itemName: box.dimensions || 'Sin dimensiones',
        });

        if (!confirmed) return;

        router.delete(route('dashboard.picking.config.boxes.destroy', box.id), {
            preserveScroll: true,
            ...handleResponse(() => {
                // Callback de éxito
                const newBoxes = [...editedBoxes];
                newBoxes.splice(index, 1);
                setEditedBoxes(newBoxes);
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

        // Mostrar modal de confirmación
        const confirmed = await confirmAdjustment({
            title: `${isIncrease ? 'Incrementar' : 'Decrementar'} Costos`,
            description: `Esta acción ${isIncrease ? 'incrementará' : 'decrementará'} todos los costos de las cajas en ${percentage}% y guardará los cambios automáticamente.`,
            percentage: percentage,
            affectedItems: `${editedBoxes.length} ${editedBoxes.length === 1 ? 'caja' : 'cajas'}`,
            isIncrease: isIncrease,
        });

        // Si el usuario cancela, no hacer nada
        if (!confirmed) return;

        // Aplicar el cambio porcentual
        const multiplier = isIncrease ? 1 + percentage / 100 : 1 - percentage / 100;

        const newBoxes = editedBoxes.map((box) => {
            const currentCost = parseFloat(box.cost);

            if (!isNaN(currentCost) && currentCost > 0) {
                return {
                    ...box,
                    cost: Math.round(currentCost * multiplier * 100) / 100,
                };
            }

            return box;
        });

        // Guardar inmediatamente después de aplicar cambios
        router.put(
            route('dashboard.picking.config.boxes.update-all'),
            {
                boxes: newBoxes,
            },
            {
                preserveScroll: true,
                ...handleResponse(() => {
                    // Callback de éxito: salir del modo edición
                    setIsMassEditMode(false);
                    setHasChanges(false);
                    setPercentageValue('');
                }),
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Configuración - Cajas" />

            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-lg font-medium">Configuración de Cajas</h3>
                                    <p className="text-muted-foreground mt-1 text-sm">Gestiona las cajas disponibles para presupuestos de picking</p>
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

                            {!isIndividualEditMode && !isMassEditMode && (
                                <div className="bg-muted/50 mt-4 mb-5 rounded-lg p-4">
                                    <p className="text-muted-foreground text-sm">
                                        💡 <strong>Tip:</strong> Activa <strong>Modificación Individual</strong> para editar celdas una por una, o{' '}
                                        <strong>Modificación Masiva</strong> para ajustar todos los costos con un porcentaje.
                                    </p>
                                </div>
                            )}

                            {/* Panel de incremento/decremento porcentual masivo */}
                            {isMassEditMode && (
                                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <Percent className="h-5 w-5 text-blue-600" />
                                        <h4 className="font-semibold text-blue-900">Ajuste Masivo de Costos</h4>
                                    </div>
                                    <p className="text-muted-foreground mb-4 text-sm">
                                        Incrementa o decrementa todos los costos de todas las cajas en un porcentaje específico. Los cambios se
                                        guardarán automáticamente al confirmar.
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
                                    <CardTitle>Listado de Cajas</CardTitle>
                                    <CardDescription>
                                        {isMassEditMode
                                            ? '📊 Modificación Masiva: Usa los controles para ajustar todos los costos'
                                            : isIndividualEditMode
                                              ? '✏️ Modificación Individual: Edita cada celda según necesites'
                                              : '📋 Vista de solo lectura: Activa un modo de edición para modificar'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[5%]">#</TableHead>
                                                    <TableHead className="w-[35%]">Dimensiones (LxAxH)</TableHead>
                                                    <TableHead className="w-[20%]">Costo ($)</TableHead>
                                                    <TableHead className="w-[20%]">Estado</TableHead>
                                                    <TableHead className="w-[20%] text-right">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {editedBoxes.map((box, index) => (
                                                    <TableRow key={box.id} className={box.isNew ? 'bg-blue-50' : ''}>
                                                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                                        <TableCell>
                                                            {isIndividualEditMode ? (
                                                                <Input
                                                                    type="text"
                                                                    value={box.dimensions}
                                                                    onChange={(e) => handleCellChange(index, 'dimensions', e.target.value)}
                                                                    placeholder="200 x 200 x 100"
                                                                    className="h-9"
                                                                />
                                                            ) : (
                                                                <span className="font-medium">{box.dimensions}</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {isIndividualEditMode ? (
                                                                <Input
                                                                    type="number"
                                                                    value={box.cost}
                                                                    onChange={(e) => handleCellChange(index, 'cost', e.target.value)}
                                                                    placeholder="0.00"
                                                                    step="0.01"
                                                                    className="h-9"
                                                                />
                                                            ) : (
                                                                <span className="font-medium">${parseFloat(box.cost || 0).toFixed(2)}</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {isIndividualEditMode ? (
                                                                <Switch
                                                                    checked={box.is_active}
                                                                    onCheckedChange={(checked) => handleCellChange(index, 'is_active', checked)}
                                                                />
                                                            ) : (
                                                                <Badge variant={box.is_active ? 'default' : 'secondary'}>
                                                                    {box.is_active ? 'Activa' : 'Inactiva'}
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {!isIndividualEditMode && !isMassEditMode && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDeleteRow(index, box)}
                                                                    className="hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="text-destructive h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}

                                                {editedBoxes.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                                                            No hay cajas registradas. Haz clic en "Agregar Fila" para crear una.
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
