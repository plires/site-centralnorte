import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Costos Cajas',
        href: '/dashboard/picking/config/boxes',
    },
];

export default function Boxes({ boxes }) {
    const { handleCrudResponse } = useInertiaResponse();

    const [editingId, setEditingId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    const {
        data,
        setData,
        put,
        post,
        delete: destroy,
        processing,
        reset,
    } = useForm({
        dimensions: '',
        cost: '',
        is_active: true,
    });

    const startEdit = (box) => {
        setEditingId(box.id);
        setData({
            dimensions: box.dimensions,
            cost: box.cost,
            is_active: box.is_active,
        });
        setIsAdding(false);
    };

    const startAdd = () => {
        setIsAdding(true);
        setEditingId(null);
        reset();
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsAdding(false);
        reset();
    };

    const handleSave = (id) => {
        put(route('picking.config.boxes.update', id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
                reset();
            },
        });
    };

    const handleCreate = () => {
        post(route('picking.config.boxes.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsAdding(false);
                reset();
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de desactivar esta caja?')) {
            destroy(route('picking.config.boxes.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración - Cajas" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Configuración de Cajas</h1>
                        <p className="text-muted-foreground mt-1">Gestiona las cajas disponibles para presupuestos de picking</p>
                    </div>
                    {!isAdding && (
                        <Button onClick={startAdd}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Caja
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Cajas</CardTitle>
                        <CardDescription>
                            Haz clic en el botón editar para modificar una caja. Los cambios se guardan individualmente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40%]">Dimensiones (LxAxH)</TableHead>
                                        <TableHead className="w-[25%]">Costo</TableHead>
                                        <TableHead className="w-[20%]">Estado</TableHead>
                                        <TableHead className="w-[15%] text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isAdding && (
                                        <TableRow className="bg-muted/50">
                                            <TableCell>
                                                <Input
                                                    type="text"
                                                    placeholder="200 x 200 x 100"
                                                    value={data.dimensions}
                                                    onChange={(e) => setData('dimensions', e.target.value)}
                                                    disabled={processing}
                                                    autoFocus
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={data.cost}
                                                    onChange={(e) => setData('cost', e.target.value)}
                                                    disabled={processing}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="default">Activa</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" onClick={handleCreate} disabled={processing}>
                                                        <Save className="mr-1 h-3 w-3" />
                                                        Guardar
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={processing}>
                                                        <X className="mr-1 h-3 w-3" />
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {boxes.map((box) => (
                                        <TableRow key={box.id}>
                                            <TableCell>
                                                {editingId === box.id ? (
                                                    <Input
                                                        type="text"
                                                        value={data.dimensions}
                                                        onChange={(e) => setData('dimensions', e.target.value)}
                                                        disabled={processing}
                                                    />
                                                ) : (
                                                    <span className="font-medium">{box.dimensions}</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {editingId === box.id ? (
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={data.cost}
                                                        onChange={(e) => setData('cost', e.target.value)}
                                                        disabled={processing}
                                                    />
                                                ) : (
                                                    <span>${parseFloat(box.cost).toFixed(2)}</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={box.is_active ? 'default' : 'secondary'}>
                                                    {box.is_active ? 'Activa' : 'Inactiva'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {editingId === box.id ? (
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" onClick={() => handleSave(box.id)} disabled={processing}>
                                                            <Save className="mr-1 h-3 w-3" />
                                                            Guardar
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={processing}>
                                                            <X className="mr-1 h-3 w-3" />
                                                            Cancelar
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => startEdit(box)} disabled={isAdding}>
                                                            <Pencil className="mr-1 h-3 w-3" />
                                                            Editar
                                                        </Button>
                                                        {box.is_active && (
                                                            <Button size="sm" variant="ghost" onClick={() => handleDelete(box.id)}>
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {boxes.length === 0 && !isAdding && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
                                                No hay cajas registradas. Haz clic en "Nueva Caja" para agregar una.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
