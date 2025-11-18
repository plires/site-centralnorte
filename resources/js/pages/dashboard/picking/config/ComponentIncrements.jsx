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
        title: 'Configuración - Incrementos por Componentes',
        href: '/dashboard/picking/config/component-increments',
    },
];

export default function ComponentIncrements({ increments }) {
    useInertiaResponse();

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
        components_from: '',
        components_to: '',
        description: '',
        percentage: '',
        is_active: true,
    });

    const startEdit = (increment) => {
        setEditingId(increment.id);
        setData({
            components_from: increment.components_from,
            components_to: increment.components_to || '',
            description: increment.description,
            percentage: (increment.percentage * 100).toFixed(0), // Convertir a porcentaje
            is_active: increment.is_active,
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
        // Convertir porcentaje a decimal
        const dataToSend = {
            ...data,
            percentage: parseFloat(data.percentage) / 100,
        };

        put(route('dashboard.picking.config.component-increments.update', id), {
            data: dataToSend,
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
                reset();
            },
        });
    };

    const handleCreate = () => {
        // Convertir porcentaje a decimal
        const dataToSend = {
            ...data,
            percentage: parseFloat(data.percentage) / 100,
        };

        post(route('dashboard.picking.config.component-increments.store'), {
            data: dataToSend,
            preserveScroll: true,
            onSuccess: () => {
                setIsAdding(false);
                reset();
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de desactivar este incremento?')) {
            destroy(route('picking.config.component-increments.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const formatRange = (increment) => {
        if (!increment.components_to) return `${increment.components_from}+`;
        return `${increment.components_from} - ${increment.components_to}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración - Incrementos por Componentes" />

            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex items-center justify-between">
                                <div className="mb-5">
                                    <h3 className="text-lg font-medium">Incrementos por Componentes</h3>
                                    <p className="text-muted-foreground mt-1">
                                        Gestiona los porcentajes de incremento según cantidad de componentes por kit
                                    </p>
                                </div>
                                {!isAdding && (
                                    <Button onClick={startAdd}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Nuevo Incremento
                                    </Button>
                                )}
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Listado de Incrementos</CardTitle>
                                    <CardDescription>
                                        Los incrementos se aplican al subtotal de servicios según la cantidad de componentes en cada kit.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[15%]">Desde</TableHead>
                                                    <TableHead className="w-[15%]">Hasta</TableHead>
                                                    <TableHead className="w-[30%]">Descripción</TableHead>
                                                    <TableHead className="w-[15%]">Porcentaje</TableHead>
                                                    <TableHead className="w-[15%]">Estado</TableHead>
                                                    <TableHead className="w-[10%] text-right">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {isAdding && (
                                                    <TableRow className="bg-muted/50">
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                placeholder="1"
                                                                value={data.components_from}
                                                                onChange={(e) => setData('components_from', e.target.value)}
                                                                disabled={processing}
                                                                autoFocus
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                placeholder="Vacío = ilimitado"
                                                                value={data.components_to}
                                                                onChange={(e) => setData('components_to', e.target.value)}
                                                                disabled={processing}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="text"
                                                                placeholder="1 A 3 componentes"
                                                                value={data.description}
                                                                onChange={(e) => setData('description', e.target.value)}
                                                                disabled={processing}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    type="number"
                                                                    step="1"
                                                                    placeholder="0"
                                                                    value={data.percentage}
                                                                    onChange={(e) => setData('percentage', e.target.value)}
                                                                    disabled={processing}
                                                                    className="w-20"
                                                                />
                                                                <span className="text-muted-foreground">%</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="default">Activo</Badge>
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

                                                {increments.map((increment) => (
                                                    <TableRow key={increment.id}>
                                                        <TableCell>
                                                            {editingId === increment.id ? (
                                                                <Input
                                                                    type="number"
                                                                    value={data.components_from}
                                                                    onChange={(e) => setData('components_from', e.target.value)}
                                                                    disabled={processing}
                                                                />
                                                            ) : (
                                                                <span className="font-medium">{increment.components_from}</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {editingId === increment.id ? (
                                                                <Input
                                                                    type="number"
                                                                    value={data.components_to}
                                                                    onChange={(e) => setData('components_to', e.target.value)}
                                                                    disabled={processing}
                                                                    placeholder="Ilimitado"
                                                                />
                                                            ) : (
                                                                <span>{increment.components_to || '∞'}</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {editingId === increment.id ? (
                                                                <Input
                                                                    type="text"
                                                                    value={data.description}
                                                                    onChange={(e) => setData('description', e.target.value)}
                                                                    disabled={processing}
                                                                />
                                                            ) : (
                                                                <span>{increment.description}</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {editingId === increment.id ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        type="number"
                                                                        step="1"
                                                                        value={data.percentage}
                                                                        onChange={(e) => setData('percentage', e.target.value)}
                                                                        disabled={processing}
                                                                        className="w-20"
                                                                    />
                                                                    <span className="text-muted-foreground">%</span>
                                                                </div>
                                                            ) : (
                                                                <span className="font-medium">{(increment.percentage * 100).toFixed(0)}%</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={increment.is_active ? 'default' : 'secondary'}>
                                                                {increment.is_active ? 'Activo' : 'Inactivo'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {editingId === increment.id ? (
                                                                <div className="flex justify-end gap-2">
                                                                    <Button size="sm" onClick={() => handleSave(increment.id)} disabled={processing}>
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
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => startEdit(increment)}
                                                                        disabled={isAdding}
                                                                    >
                                                                        <Pencil className="mr-1 h-3 w-3" />
                                                                        Editar
                                                                    </Button>
                                                                    {increment.is_active && (
                                                                        <Button size="sm" variant="ghost" onClick={() => handleDelete(increment.id)}>
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}

                                                {increments.length === 0 && !isAdding && (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                                                            No hay incrementos registrados. Haz clic en "Nuevo Incremento" para agregar uno.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="bg-muted mt-4 rounded-lg p-4">
                                        <h4 className="mb-2 font-semibold">💡 Información</h4>
                                        <p className="text-muted-foreground text-sm">
                                            El porcentaje de incremento se aplica sobre el subtotal de servicios seleccionados. Por ejemplo, un 20%
                                            significa que se suma un 20% adicional al costo de los servicios.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
