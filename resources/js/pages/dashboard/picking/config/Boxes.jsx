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

export default function Boxes({ boxes: initialBoxes }) {
    const { handleCrudResponse } = useInertiaResponse();

    const [isEditMode, setIsEditMode] = useState(false);
    const [editedBoxes, setEditedBoxes] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);

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
        // Enviar todas las cajas modificadas al backend
        // router.put(
        //     route('dashboard.picking.config.boxes.update-all'),
        //     handleCrudResponse(() => {
        //         // Callback de éxito: limpiar formulario
        //         reset();
        //     }),
        // );
        router.put(
            route('dashboard.picking.config.boxes.update-all'),
            {
                boxes: editedBoxes,
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
        setEditedBoxes(initialBoxes.map((box) => ({ ...box })));
        setIsEditMode(false);
        setHasChanges(false);
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
        if (!isEditMode) {
            setIsEditMode(true);
        }
    };

    const handleDeleteRow = (index) => {
        if (confirm('¿Estás seguro de eliminar esta caja?')) {
            const newBoxes = [...editedBoxes];
            newBoxes.splice(index, 1);
            setEditedBoxes(newBoxes);
            setHasChanges(true);
        }
    };

    return (
        <AppLayout>
            <Head title="Configuración - Cajas" />

            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium">Configuración de Cajas</h3>
                                    <p className="text-muted-foreground mt-1">Gestiona las cajas disponibles para presupuestos de picking</p>
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

                            <Card>
                                <CardHeader>
                                    <CardTitle>Listado de Cajas</CardTitle>
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
                                                <TableRow>
                                                    <TableHead className="w-[5%]">#</TableHead>
                                                    <TableHead className="w-[40%]">Dimensiones (LxAxH)</TableHead>
                                                    <TableHead className="w-[25%]">Costo ($)</TableHead>
                                                    <TableHead className="w-[20%]">Estado</TableHead>
                                                    {isEditMode && <TableHead className="w-[10%] text-right">Acciones</TableHead>}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {editedBoxes.map((box, index) => (
                                                    <TableRow key={box.id} className={box.isNew ? 'bg-blue-50' : ''}>
                                                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                                        <TableCell>
                                                            {isEditMode ? (
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
                                                            {isEditMode ? (
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={box.cost}
                                                                    onChange={(e) => handleCellChange(index, 'cost', e.target.value)}
                                                                    placeholder="0.00"
                                                                    className="h-9"
                                                                />
                                                            ) : (
                                                                <span>${parseFloat(box.cost || 0).toFixed(2)}</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {isEditMode ? (
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
                                                        {isEditMode && (
                                                            <TableCell className="text-right">
                                                                <Button size="sm" variant="ghost" onClick={() => handleDeleteRow(index)}>
                                                                    <Trash2 className="text-destructive h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                ))}

                                                {editedBoxes.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={isEditMode ? 5 : 4} className="text-muted-foreground py-8 text-center">
                                                            No hay cajas registradas. Haz clic en "Agregar Fila" para crear una.
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
                                                💡 <strong>Tip:</strong> Activa el "Modo Edición" para modificar todas las celdas que necesites y
                                                guardar todos los cambios de una sola vez.
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
