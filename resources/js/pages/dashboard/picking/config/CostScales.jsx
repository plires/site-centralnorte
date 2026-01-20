import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import ButtonCustom from '@/components/ButtonCustom';
import { useCostAdjustmentConfirmation } from '@/components/CostAdjustmentConfirmationDialog';
import { useExcelExport } from '@/hooks/use-excel-export';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertCircle, FileDown, Percent, Plus, Save, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs = [
    {
        title: 'Configuración - Escalas de Costos',
        href: '/dashboard/picking/config/cost-scales',
    },
];

export default function CostScales({ auth, scales: initialScales }) {
    const { props } = usePage();
    const serverErrors = props.errors || {};

    const { handleResponse } = useInertiaResponse();
    const { confirmAdjustment, CostAdjustmentConfirmationDialog } = useCostAdjustmentConfirmation();

    const [isMassEditMode, setIsMassEditMode] = useState(false);
    const [isIndividualEditMode, setIsIndividualEditMode] = useState(false);
    const [editedScales, setEditedScales] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [percentageValue, setPercentageValue] = useState('');
    const [localErrors, setLocalErrors] = useState({});
    const [pendingNewScales, setPendingNewScales] = useState([]); // Guardar filas nuevas
    const lastServerErrorsRef = useRef('');

    const { handleExport, isExporting } = useExcelExport();

    // Verificar si el usuario es admin
    const isAdmin = auth.user.role?.name === 'admin';

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

    // Inicializar editedScales cuando cambian las escalas
    // IMPORTANTE: Preservar filas nuevas (isNew) cuando hay errores de validación
    useEffect(() => {
        setEditedScales((prevScales) => {
            // Si hay errores, significa que hubo una validación fallida
            const hasValidationErrors = Object.keys(localErrors).length > 0;

            // Si hay errores, restaurar las filas nuevas que guardamos
            if (hasValidationErrors && pendingNewScales.length > 0) {
                const existingScales = initialScales.map((scale) => ({ ...scale }));
                // Mantener las nuevas filas al principio
                return [...pendingNewScales, ...existingScales];
            }

            // Si no hay errores, resetear completamente
            return initialScales.map((scale) => ({ ...scale }));
        });
    }, [initialScales, localErrors, pendingNewScales]);

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
        // Guardar las filas nuevas ANTES de hacer el submit
        const newScales = editedScales.filter((scale) => scale.isNew);
        setPendingNewScales(newScales);

        router.put(
            route('dashboard.picking.config.cost-scales.update-all'),
            {
                scales: editedScales,
            },
            {
                preserveScroll: true,
                ...handleResponse(
                    () => {
                        // Callback de ÉXITO: resetear estados y limpiar pending
                        setPendingNewScales([]);
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
        setEditedScales(initialScales.map((scale) => ({ ...scale })));
        setIsIndividualEditMode(false);
        setHasChanges(false);
        setPercentageValue('');

        // Limpiar errores locales y filas pendientes
        setLocalErrors({});
        setPendingNewScales([]);

        // Actualizar la ref para que no se vuelvan a sincronizar los mismos errores
        lastServerErrorsRef.current = JSON.stringify({});
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
    const hasNewRows = editedScales.some((scale) => scale.isNew);

    // Determinar si un campo debe estar deshabilitado
    const isFieldDisabled = (scale) => {
        // Si hay nuevas filas y esta NO es nueva, deshabilitar
        return hasNewRows && !scale.isNew;
    };

    /**
     * Helper para verificar si una fila tiene errores
     */
    const hasRowError = (index) => {
        const rowPrefix = `scales.${index}.`;
        return Object.keys(localErrors).some((key) => key.startsWith(rowPrefix));
    };

    /**
     * Helper para obtener todos los errores de una fila específica
     */
    const getRowErrors = (index) => {
        const rowPrefix = `scales.${index}.`;
        const errors = [];

        Object.entries(localErrors).forEach(([key, message]) => {
            if (key.startsWith(rowPrefix)) {
                const fieldName = key.replace(rowPrefix, '');
                const errorMessage = Array.isArray(message) ? message[0] : message;
                errors.push({ field: fieldName, message: errorMessage });
            }
        });

        return errors;
    };

    // Componente reutilizable para celdas editables
    const EditableCell = ({ index, field, value, type = 'text', placeholder = '', className = '', scale }) => {
        const [localValue, setLocalValue] = useState(value || '');
        const disabled = isFieldDisabled(scale);
        const inputRef = useRef(null); // Referencia al input

        // Sincronizar con el valor externo solo cuando cambia desde fuera
        useEffect(() => {
            setLocalValue(value || '');
        }, [value]);

        // Manejar la navegación con TAB y Enter
        const handleKeyDown = (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();

                // Guardar el valor actual antes de mover el foco
                if (localValue !== value) {
                    handleCellChange(index, field, localValue);
                }

                // Encontrar todos los inputs habilitados (no disabled)
                const allInputs = Array.from(document.querySelectorAll('input[type="number"]:not([disabled]), input[type="text"]:not([disabled])'));
                const currentIndex = allInputs.indexOf(inputRef.current);

                if (e.shiftKey) {
                    // Retroceder con Shift+Tab
                    const prevIndex = currentIndex - 1;
                    if (prevIndex >= 0) {
                        allInputs[prevIndex].focus();
                        allInputs[prevIndex].select();
                    }
                } else {
                    // Avanzar con Tab
                    const nextIndex = currentIndex + 1;
                    if (nextIndex < allInputs.length) {
                        allInputs[nextIndex].focus();
                        allInputs[nextIndex].select();
                    }
                }
            }

            // Permitir Enter para guardar y moverse al siguiente input
            if (e.key === 'Enter') {
                e.preventDefault();
                if (localValue !== value) {
                    handleCellChange(index, field, localValue);
                }

                // Simular un Tab para moverse al siguiente input
                const allInputs = Array.from(document.querySelectorAll('input[type="number"]:not([disabled]), input[type="text"]:not([disabled])'));
                const currentIndex = allInputs.indexOf(inputRef.current);
                const nextIndex = currentIndex + 1;
                if (nextIndex < allInputs.length) {
                    allInputs[nextIndex].focus();
                    allInputs[nextIndex].select();
                }
            }
        };

        if (isIndividualEditMode) {
            const inputType = type === 'number' ? 'text' : 'text';

            return (
                <Input
                    ref={inputRef}
                    type={inputType}
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={() => {
                        // Actualizar el valor cuando el input pierde el foco
                        if (localValue !== value) {
                            handleCellChange(index, field, localValue);
                        }
                    }}
                    onKeyDown={handleKeyDown} // Agregar handler de teclado
                    placeholder={placeholder}
                    step={type === 'number' ? '0.01' : undefined}
                    className={`h-9 text-center ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
                    style={{
                        fontSize: 12,
                        padding: 0,
                    }}
                    disabled={disabled}
                    tabIndex={disabled ? -1 : 0} // Excluir inputs disabled del tab order
                />
            );
        }

        // Vista de solo lectura
        return <span className="text-xs">{value || '-'}</span>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración - Escalas de Costos" />

            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-lg font-medium">Configuración de Escalas de Costos</h3>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        Gestiona las escalas de costos para presupuestos de picking según cantidad de kits
                                    </p>
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
                                                        handleExport(
                                                            route('dashboard.picking.config.cost-scales.export'),
                                                            'picking_cost_scales_export.xlsx',
                                                        )
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

                            {/* Banner informativo cuando hay filas nuevas */}
                            {hasNewRows && (
                                <div className="mt-4 mb-5 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <p className="mb-3 text-sm text-blue-900">
                                        <strong>✨ Nueva fila agregada:</strong> Completa los datos de la nueva escala y presiona "Guardar Todos los
                                        Cambios" cuando termines. Las filas existentes están bloqueadas mientras agregas nuevas escalas.
                                    </p>
                                    <p className="text-sm text-red-900">
                                        <strong>✨ Tené especial cuidado cuando agregues "Rangos de kits":</strong> si el rango se superpone con uno
                                        existente, o si el valor "Desde" es mayor que "Hasta", podrían generarse errores en el sistema. El sistema no
                                        valida ni compara con otros registros ingresados, por lo tanto ingresá los valores con responsabilidad.
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

                            {/* Bloque de errores - Mostrar si hay errores */}
                            {Object.keys(localErrors).length > 0 && (
                                <div className="mt-4 mb-5 rounded-lg border-2 border-red-200 bg-red-50 p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                        <h4 className="font-semibold text-red-900">Errores de Validación</h4>
                                    </div>
                                    <p className="mb-3 text-sm text-red-700">
                                        Se encontraron errores en los siguientes campos. Las filas con errores están resaltadas en rojo:
                                    </p>
                                    <div className="max-h-60 overflow-y-auto">
                                        <ul className="space-y-2">
                                            {editedScales.map((scale, index) => {
                                                const errors = getRowErrors(index);
                                                if (errors.length === 0) return null;

                                                return (
                                                    <li key={index} className="rounded border border-red-300 bg-white p-3">
                                                        <p className="mb-1 text-sm font-semibold text-red-800">
                                                            Fila #{index + 1} {scale.isNew && '(Nueva fila)'}
                                                        </p>
                                                        <ul className="ml-4 list-disc space-y-1">
                                                            {errors.map((error, idx) => (
                                                                <li key={idx} className="text-xs text-red-600">
                                                                    {error.message}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
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
                                    <CardTitle className="mb-3">Listado de Escalas de Costos</CardTitle>
                                    <CardDescription>
                                        {isMassEditMode ? (
                                            '📊 Modificación Masiva: Usa los controles para ajustar todos los valores'
                                        ) : isIndividualEditMode ? (
                                            <>
                                                <p className="-900 mb-1 text-sm">✏️ Modificación Individual: Edita cada celda según necesites</p>

                                                <p className="text-sm text-red-900">
                                                    <strong>✨ Tené especial cuidado cuando agregues "Rangos de kits":</strong> si el rango se
                                                    superpone con uno existente, o si el valor "Desde" es mayor que "Hasta", podrían generarse errores
                                                    en el sistema. El sistema no valida ni compara con otros registros ingresados, por lo tanto
                                                    ingresá los valores con responsabilidad.
                                                </p>
                                            </>
                                        ) : (
                                            '📋 Vista de solo lectura: Activa un modo de edición para modificar'
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="sticky left-0 z-20 bg-white px-2 py-2 text-xs">Rango de Kits</TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Sin
                                                        <br />
                                                        Armado
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Con <br />
                                                        Armado
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Pal.
                                                        <br /> S/P
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Pal.
                                                        <br /> C/P
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Con
                                                        <br /> Rot.
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Sin
                                                        <br /> Rot.
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Arm.
                                                        <br /> Adic.
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Ctrl
                                                        <br /> Cal.
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">Domes</TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Viruta
                                                        <br /> 50g
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Viruta
                                                        <br /> 100g
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Viruta
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
                                                        Plur.
                                                        <br /> 5x10
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Plur.
                                                        <br /> 10x15
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        Plur.
                                                        <br /> 20x30
                                                    </TableHead>
                                                    <TableHead className="px-2 py-2 text-xs">
                                                        T.
                                                        <br /> Prod.
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {editedScales.map((scale, index) => {
                                                    const disabled = isFieldDisabled(scale);
                                                    const rowHasError = hasRowError(index);

                                                    return (
                                                        <TableRow
                                                            key={scale.id}
                                                            className={` ${scale.isNew ? 'border-l-4 border-green-500 bg-green-50' : ''} ${disabled ? 'opacity-50' : ''} ${rowHasError ? 'border-l-4 border-red-500 bg-red-50' : ''} `}
                                                        >
                                                            {isIndividualEditMode ? (
                                                                <>
                                                                    <TableCell className="sticky left-0 z-10 bg-white px-2 py-2">
                                                                        <div className="flex gap-1">
                                                                            <EditableCell
                                                                                index={index}
                                                                                field="quantity_from"
                                                                                value={scale.quantity_from}
                                                                                type="number"
                                                                                placeholder="Desde"
                                                                                scale={scale}
                                                                                className={`w-16 ${isIndividualEditMode ? 'bg-orange-300' : ''}`}
                                                                            />
                                                                            <span className="self-center text-xs">-</span>
                                                                            <EditableCell
                                                                                index={index}
                                                                                field="quantity_to"
                                                                                value={scale.quantity_to}
                                                                                type="number"
                                                                                placeholder="Hasta"
                                                                                scale={scale}
                                                                                className={`w-16 ${isIndividualEditMode ? 'bg-orange-300' : ''}`}
                                                                            />
                                                                        </div>
                                                                    </TableCell>
                                                                </>
                                                            ) : (
                                                                <TableCell className="sticky left-0 z-10 bg-white px-2 py-2">
                                                                    <span className="text-xs font-medium">
                                                                        {scale.quantity_from && scale.quantity_to
                                                                            ? `${scale.quantity_from} - ${scale.quantity_to}`
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
                                                                    type="text"
                                                                    placeholder="Ej: 5-7 días"
                                                                    scale={scale}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}

                                                {editedScales.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={20} className="text-muted-foreground py-8 text-center text-sm">
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
        </AppLayout>
    );
}
