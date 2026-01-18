import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import ButtonCustom from '@/components/ButtonCustom';
import { useCostAdjustmentConfirmation } from '@/components/CostAdjustmentConfirmationDialog';
import { useDeleteConfirmation } from '@/components/DeleteConfirmationDialog';
import { useExcelExport } from '@/hooks/use-excel-export';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { FileDown, Percent, Plus, Save, Trash2, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Boxes({ auth, boxes: initialBoxes }) {
    const { props } = usePage();
    const serverErrors = props.errors || {};

    const { handleResponse } = useInertiaResponse();
    const { confirmAdjustment, CostAdjustmentConfirmationDialog } = useCostAdjustmentConfirmation();
    const { confirmDelete, DeleteConfirmationDialog } = useDeleteConfirmation();

    const { handleExport, isExporting } = useExcelExport();

    // Verificar si el usuario es admin
    const isAdmin = auth.user.role?.name === 'admin';

    const [isMassEditMode, setIsMassEditMode] = useState(false);
    const [isIndividualEditMode, setIsIndividualEditMode] = useState(false);
    const [editedBoxes, setEditedBoxes] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [percentageValue, setPercentageValue] = useState('');
    const [localErrors, setLocalErrors] = useState({});
    const [pendingNewBoxes, setPendingNewBoxes] = useState([]); // Guardar filas nuevas
    const lastServerErrorsRef = useRef('');

    // Sincronizar errores del servidor con el estado local
    // Solo actualizar cuando los serverErrors realmente cambien (no cuando sean los mismos)
    useEffect(() => {
        const currentErrorsKey = JSON.stringify(serverErrors);

        // Solo actualizar si los errores del servidor han cambiado
        if (currentErrorsKey !== lastServerErrorsRef.current) {
            lastServerErrorsRef.current = currentErrorsKey;
            setLocalErrors(serverErrors);
        }
    }, [serverErrors]);

    // Inicializar editedBoxes cuando cambian las cajas
    // IMPORTANTE: Preservar filas nuevas (isNew) cuando hay errores de validación
    useEffect(() => {
        setEditedBoxes((prevBoxes) => {
            // Si hay errores, significa que hubo una validación fallida
            const hasValidationErrors = Object.keys(localErrors).length > 0;

            // Si hay errores, restaurar las filas nuevas que guardamos
            if (hasValidationErrors && pendingNewBoxes.length > 0) {
                const existingBoxes = initialBoxes.map((box) => ({ ...box }));
                // Mantener las nuevas filas al principio
                return [...pendingNewBoxes, ...existingBoxes];
            }

            // Si no hay errores, resetear completamente
            return initialBoxes.map((box) => ({ ...box }));
        });
    }, [initialBoxes, localErrors, pendingNewBoxes]);

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
        // Guardar las filas nuevas ANTES de hacer el submit
        const newBoxes = editedBoxes.filter((box) => box.isNew);
        setPendingNewBoxes(newBoxes);

        router.put(
            route('dashboard.picking.config.boxes.update-all'),
            {
                boxes: editedBoxes,
            },
            {
                preserveScroll: true,
                ...handleResponse(
                    () => {
                        // Callback de ÉXITO: resetear estados y limpiar pending
                        setPendingNewBoxes([]);
                        setIsIndividualEditMode(false);
                        setHasChanges(false);
                        setPercentageValue('');
                    },
                    () => {
                        // Callback de ERROR: las filas se restaurarán por el useEffect
                    },
                ),
            },
        );
    };

    const handleCancel = () => {
        // Restaurar valores originales
        setEditedBoxes(initialBoxes.map((box) => ({ ...box })));
        setIsIndividualEditMode(false);
        setHasChanges(false);
        setPercentageValue('');

        // Limpiar errores locales y filas pendientes
        setLocalErrors({});
        setPendingNewBoxes([]);

        // Actualizar la ref para que no se vuelvan a sincronizar los mismos errores
        lastServerErrorsRef.current = JSON.stringify({});
    };

    const handleAddRow = () => {
        const newBox = {
            id: `new-${Date.now()}`,
            dimensions: '',
            cost: '',
            is_active: true,
            isNew: true,
        };

        // Agregar la nueva fila AL PRINCIPIO del array
        setEditedBoxes([newBox, ...editedBoxes]);
        setHasChanges(true);

        // Activar automáticamente el modo edición individual
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

    // Verificar si hay nuevas filas sin guardar
    const hasNewRows = editedBoxes.some((box) => box.isNew);

    // Determinar si un campo debe estar deshabilitado
    const isFieldDisabled = (box) => {
        // Si hay nuevas filas y esta NO es nueva, deshabilitar
        return hasNewRows && !box.isNew;
    };

    /**
     * Helper para obtener el mensaje de error de un campo específico
     * Los errores vienen con la estructura: boxes.0.dimensions, boxes.1.cost, etc.
     */
    const getFieldError = (index, field) => {
        const errorKey = `boxes.${index}.${field}`;
        const errorMessage = localErrors[errorKey];

        if (!errorMessage) return null;

        // Laravel puede devolver el error como string o como array
        return Array.isArray(errorMessage) ? errorMessage[0] : errorMessage;
    };

    /**
     * Verifica si una fila tiene algún error
     */
    const hasRowError = (index) => {
        return ['dimensions', 'cost', 'is_active'].some((field) => getFieldError(index, field));
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
                                        <>
                                            {isAdmin && (
                                                <ButtonCustom
                                                    onClick={() =>
                                                        handleExport(route('dashboard.picking.config.boxes.export'), 'picking_boxes_export.xlsx')
                                                    }
                                                    disabled={isExporting}
                                                    variant="outline"
                                                    size="md"
                                                    className="flex items-center gap-2"
                                                >
                                                    <FileDown className={`h-4 w-4 ${isExporting ? 'animate-bounce' : ''}`} />
                                                    {isExporting ? 'Exportando...' : 'Exportar Excel'}
                                                </ButtonCustom>
                                            )}
                                            <Button onClick={handleAddRow}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Agregar Fila
                                            </Button>
                                        </>
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

                            {/* Banner informativo cuando hay filas nuevas - SIEMPRE visible mientras exista una fila nueva */}
                            {hasNewRows && (
                                <div className="mt-4 mb-5 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <p className="text-sm text-blue-900">
                                        <strong>✨ Nueva fila agregada:</strong> Completa los datos de la nueva caja y presiona "Guardar Todos los
                                        Cambios" cuando termines. Las filas existentes están bloqueadas mientras agregas nuevas cajas.
                                    </p>
                                </div>
                            )}

                            {!isIndividualEditMode && !isMassEditMode && !hasNewRows && (
                                <div className="bg-muted/50 mt-4 mb-5 rounded-lg p-4">
                                    <p className="text-muted-foreground text-sm">
                                        💡 <strong>Tip:</strong> Activa <strong>Modificación Individual</strong> para editar celdas una por una, o{' '}
                                        <strong>Modificación Masiva</strong> para ajustar todos los costos con un porcentaje.
                                    </p>
                                </div>
                            )}

                            {isMassEditMode && (
                                <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                        <div className="flex-1">
                                            <Label htmlFor="percentage" className="mb-2 block text-sm font-medium">
                                                Porcentaje de Ajuste
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Percent className="text-muted-foreground h-4 w-4" />
                                                <Input
                                                    id="percentage"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    placeholder="Ej: 10"
                                                    value={percentageValue}
                                                    onChange={(e) => setPercentageValue(e.target.value)}
                                                    className="max-w-xs"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => applyPercentageChange(false)} className="whitespace-nowrap">
                                                <TrendingDown className="mr-2 h-4 w-4" />
                                                Decrementar
                                            </Button>
                                            <Button onClick={() => applyPercentageChange(true)} className="whitespace-nowrap">
                                                <TrendingUp className="mr-2 h-4 w-4" />
                                                Incrementar
                                            </Button>
                                        </div>
                                    </div>
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
                                                    <TableHead className="w-[45%]">Dimensiones (LxAxH)</TableHead>
                                                    <TableHead className="w-[30%]">Costo ($)</TableHead>
                                                    <TableHead className="w-[20%] text-right">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {editedBoxes.map((box, index) => {
                                                    const disabled = isFieldDisabled(box);
                                                    const rowHasError = hasRowError(index);

                                                    return (
                                                        <TableRow
                                                            key={box.id}
                                                            className={`${box.isNew ? 'border-l-4 border-green-500 bg-green-50' : ''} ${disabled ? 'opacity-50' : ''}`}
                                                        >
                                                            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                                            <TableCell>
                                                                {isIndividualEditMode ? (
                                                                    <>
                                                                        <Input
                                                                            type="text"
                                                                            value={box.dimensions}
                                                                            onChange={(e) => handleCellChange(index, 'dimensions', e.target.value)}
                                                                            placeholder="200 x 200 x 100"
                                                                            className={`h-9 ${getFieldError(index, 'dimensions') ? 'border-red-500' : ''}`}
                                                                            disabled={disabled}
                                                                        />
                                                                        {getFieldError(index, 'dimensions') && (
                                                                            <p className="mt-1 text-xs text-red-600">
                                                                                {getFieldError(index, 'dimensions')}
                                                                            </p>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <span className="font-medium">{box.dimensions}</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {isIndividualEditMode ? (
                                                                    <>
                                                                        <Input
                                                                            type="number"
                                                                            value={box.cost}
                                                                            onChange={(e) => handleCellChange(index, 'cost', e.target.value)}
                                                                            placeholder="0.00"
                                                                            step="0.01"
                                                                            className={`h-9 ${getFieldError(index, 'cost') ? 'border-red-500' : ''}`}
                                                                            disabled={disabled}
                                                                        />
                                                                        {getFieldError(index, 'cost') && (
                                                                            <p className="mt-1 text-xs text-red-600">
                                                                                {getFieldError(index, 'cost')}
                                                                            </p>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <span className="font-medium">${parseFloat(box.cost || 0).toFixed(2)}</span>
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
                                                    );
                                                })}

                                                {editedBoxes.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
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
