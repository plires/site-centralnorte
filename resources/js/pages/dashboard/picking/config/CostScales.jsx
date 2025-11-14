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
import { Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CostScales({ scales: initialScales }) {
    const { handleCrudResponse } = useInertiaResponse();

    const [isEditMode, setIsEditMode] = useState(false);
    const [editedScales, setEditedScales] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);

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
                onSuccess: () => {
                    setIsEditMode(false);
                    setHasChanges(false);
                },
            },
        );
    };

    const handleCancel = () => {
        // Restaurar valores originales
        setEditedScales(initialScales.map((scale) => ({ ...scale })));
        setIsEditMode(false);
        setHasChanges(false);
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

    // Componente reutilizable para celdas editables
    const EditableCell = ({ index, field, value, type = 'text', placeholder = '', className = '' }) => {
        if (isEditMode) {
            return (
                <Input
                    type={type}
                    value={value || ''}
                    onChange={(e) => handleCellChange(index, field, e.target.value)}
                    placeholder={placeholder}
                    className={`h-9 ${className}`}
                    step={type === 'number' ? '0.01' : undefined}
                />
            );
        }
        return <span className="font-medium">{value || '-'}</span>;
    };

    return (
        <AppLayout>
            <Head title="Configuración - Escalas de Costos" />

            <div className="py-12">
                <div className="mx-auto max-w-[1800px] sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold">Configuración de Escalas de Costos</h1>
                                    <p className="text-muted-foreground mt-1">
                                        Gestiona las escalas de precios según la cantidad de kits
                                    </p>
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

                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Listado de Escalas de Costos</CardTitle>
                                    <CardDescription>
                                        {isEditMode
                                            ? '✏️ Modo edición activo: Modifica las celdas que necesites y guarda todos los cambios juntos'
                                            : '📋 Vista de solo lectura: Activa el modo edición para modificar'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="sticky left-0 z-10 bg-white">#</TableHead>
                                                    <TableHead className="min-w-[120px]">Cantidad Desde</TableHead>
                                                    <TableHead className="min-w-[120px]">Cantidad Hasta</TableHead>
                                                    <TableHead className="min-w-[140px]">Sin Armado ($)</TableHead>
                                                    <TableHead className="min-w-[140px]">Con Armado ($)</TableHead>
                                                    <TableHead className="min-w-[180px]">Pallet. Sin Pallet ($)</TableHead>
                                                    <TableHead className="min-w-[180px]">Pallet. Con Pallet ($)</TableHead>
                                                    <TableHead className="min-w-[150px]">Con Rotulado ($)</TableHead>
                                                    <TableHead className="min-w-[150px]">Sin Rotulado ($)</TableHead>
                                                    <TableHead className="min-w-[160px]">Ensamble Adic. ($)</TableHead>
                                                    <TableHead className="min-w-[160px]">Control Calidad ($)</TableHead>
                                                    <TableHead className="min-w-[120px]">Domes ($/u)</TableHead>
                                                    <TableHead className="min-w-[130px]">Viruta 50g ($/u)</TableHead>
                                                    <TableHead className="min-w-[140px]">Viruta 100g ($/u)</TableHead>
                                                    <TableHead className="min-w-[140px]">Viruta 200g ($/u)</TableHead>
                                                    <TableHead className="min-w-[130px]">Bolsa 10x15 ($/u)</TableHead>
                                                    <TableHead className="min-w-[130px]">Bolsa 20x30 ($/u)</TableHead>
                                                    <TableHead className="min-w-[130px]">Bolsa 35x45 ($/u)</TableHead>
                                                    <TableHead className="min-w-[150px]">Burb. 5x10 ($/u)</TableHead>
                                                    <TableHead className="min-w-[150px]">Burb. 10x15 ($/u)</TableHead>
                                                    <TableHead className="min-w-[150px]">Burb. 20x30 ($/u)</TableHead>
                                                    <TableHead className="min-w-[150px]">T. Producción</TableHead>
                                                    <TableHead className="min-w-[100px]">Estado</TableHead>
                                                    {isEditMode && (
                                                        <TableHead className="sticky right-0 z-10 bg-white text-right">
                                                            Acciones
                                                        </TableHead>
                                                    )}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {editedScales.map((scale, index) => (
                                                    <TableRow key={scale.id} className={scale.isNew ? 'bg-blue-50' : ''}>
                                                        <TableCell className="text-muted-foreground sticky left-0 z-10 bg-white">
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="quantity_from"
                                                                value={scale.quantity_from}
                                                                type="number"
                                                                placeholder="1"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="quantity_to"
                                                                value={scale.quantity_to}
                                                                type="number"
                                                                placeholder="o más"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="cost_without_assembly"
                                                                value={scale.cost_without_assembly}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="cost_with_assembly"
                                                                value={scale.cost_with_assembly}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="palletizing_without_pallet"
                                                                value={scale.palletizing_without_pallet}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="palletizing_with_pallet"
                                                                value={scale.palletizing_with_pallet}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="cost_with_labeling"
                                                                value={scale.cost_with_labeling}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="cost_without_labeling"
                                                                value={scale.cost_without_labeling}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="additional_assembly"
                                                                value={scale.additional_assembly}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="quality_control"
                                                                value={scale.quality_control}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="dome_sticking_unit"
                                                                value={scale.dome_sticking_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="shavings_50g_unit"
                                                                value={scale.shavings_50g_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="shavings_100g_unit"
                                                                value={scale.shavings_100g_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="shavings_200g_unit"
                                                                value={scale.shavings_200g_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="bag_10x15_unit"
                                                                value={scale.bag_10x15_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="bag_20x30_unit"
                                                                value={scale.bag_20x30_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="bag_35x45_unit"
                                                                value={scale.bag_35x45_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="bubble_wrap_5x10_unit"
                                                                value={scale.bubble_wrap_5x10_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="bubble_wrap_10x15_unit"
                                                                value={scale.bubble_wrap_10x15_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="bubble_wrap_20x30_unit"
                                                                value={scale.bubble_wrap_20x30_unit}
                                                                type="number"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <EditableCell
                                                                index={index}
                                                                field="production_time"
                                                                value={scale.production_time}
                                                                type="text"
                                                                placeholder="24 hs"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            {isEditMode ? (
                                                                <Switch
                                                                    checked={scale.is_active}
                                                                    onCheckedChange={(checked) =>
                                                                        handleCellChange(index, 'is_active', checked)
                                                                    }
                                                                />
                                                            ) : (
                                                                <Badge variant={scale.is_active ? 'default' : 'secondary'}>
                                                                    {scale.is_active ? 'Activa' : 'Inactiva'}
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        {isEditMode && (
                                                            <TableCell className="sticky right-0 z-10 bg-white text-right">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDeleteRow(index)}
                                                                >
                                                                    <Trash2 className="text-destructive h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                ))}

                                                {editedScales.length === 0 && (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={isEditMode ? 24 : 23}
                                                            className="text-muted-foreground py-8 text-center"
                                                        >
                                                            No hay escalas de costos registradas. Haz clic en "Agregar Fila" para crear
                                                            una.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {isEditMode && hasChanges && (
                                        <div className="mt-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4">
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
                                        <div className="bg-muted/50 mt-4 rounded-lg p-4">
                                            <p className="text-muted-foreground text-sm">
                                                💡 <strong>Tip:</strong> Activa el "Modo Edición" para modificar todas las celdas que
                                                necesites y guardar todos los cambios de una sola vez. Usa scroll horizontal para ver
                                                todas las columnas.
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
