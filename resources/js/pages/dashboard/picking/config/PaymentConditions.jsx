import { useDeleteConfirmation } from '@/components/DeleteConfirmationDialog';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Save, Trash2, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Configuración - Condiciones de Pago',
        href: '/dashboard/picking/config/payment-conditions',
    },
];

export default function PaymentConditions({ paymentConditions }) {
    const { props } = usePage();
    const errors = props.errors || {};

    const { handleResponse } = useInertiaResponse();

    const [editingId, setEditingId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const { confirmDelete, DeleteConfirmationDialog } = useDeleteConfirmation();

    const {
        data,
        setData,
        put,
        post,
        delete: destroy,
        processing,
        reset,
    } = useForm({
        description: '',
        percentage: '',
        is_active: true,
    });

    const startEdit = (condition) => {
        setEditingId(condition.id);
        setData({
            description: condition.description,
            percentage: parseFloat(condition.percentage).toFixed(2),
            is_active: condition.is_active,
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
        const dataToSend = {
            ...data,
            percentage: parseFloat(data.percentage),
        };

        router.put(route('dashboard.picking.config.payment-conditions.update', id), dataToSend, {
            preserveScroll: true,
            ...handleResponse(
                () => {
                    setEditingId(null);
                    reset();
                },
                () => {},
            ),
        });
    };

    const handleCreate = () => {
        const dataToSend = {
            ...data,
            percentage: parseFloat(data.percentage),
        };

        router.post(route('dashboard.picking.config.payment-conditions.store'), dataToSend, {
            preserveScroll: true,
            ...handleResponse(
                () => {
                    setIsAdding(false);
                    reset();
                },
                () => {},
            ),
        });
    };

    const handleDelete = async (condition) => {
        const confirmed = await confirmDelete({
            title: `Borrar condición de pago`,
            description: `Esta acción eliminará la condición "${condition.description}" de la base de datos.`,
        });

        if (!confirmed) return;

        router.delete(route('dashboard.picking.config.payment-conditions.destroy', condition.id), {
            preserveScroll: true,
            ...handleResponse(),
        });
    };

    const formatPercentage = (percentage) => {
        const value = parseFloat(percentage);
        if (value === 0) return '0%';
        if (value > 0) return `+${value.toFixed(2)}%`;
        return `${value.toFixed(2)}%`;
    };

    const getPercentageBadge = (percentage) => {
        const value = parseFloat(percentage);
        if (value === 0) {
            return (
                <Badge variant="outline" className="font-mono">
                    {formatPercentage(percentage)}
                </Badge>
            );
        }
        if (value > 0) {
            return (
                <Badge variant="destructive" className="bg-red-600 font-mono text-white hover:bg-red-700">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {formatPercentage(percentage)}
                </Badge>
            );
        }
        return (
            <Badge variant="default" className="bg-green-600 font-mono hover:bg-green-700">
                <TrendingDown className="mr-1 h-3 w-3" />
                {formatPercentage(percentage)}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Condiciones de Pago" />

            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex items-center justify-between">
                                <div className="mb-5">
                                    <h3 className="text-lg font-medium">Condiciones de Pago</h3>
                                    <p className="text-muted-foreground mt-1">
                                        Configura las modalidades de pago y sus ajustes porcentuales aplicables a los presupuestos.
                                    </p>
                                </div>
                                {!isAdding && !editingId && (
                                    <Button onClick={startAdd}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Nueva Condición
                                    </Button>
                                )}
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Listado de Condiciones de Pago</CardTitle>
                                    <CardDescription>
                                        Define ajustes porcentuales positivos (recargos) o negativos (descuentos) según la forma de pago seleccionada.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50%]">Descripción</TableHead>
                                                <TableHead className="w-[35%]">Ajuste Porcentual</TableHead>
                                                <TableHead className="w-[15%] text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isAdding && (
                                                <TableRow className="bg-muted/50">
                                                    <TableCell>
                                                        <Input
                                                            type="text"
                                                            placeholder="Ej: Contado, 30 días, etc."
                                                            value={data.description}
                                                            onChange={(e) => setData('description', e.target.value)}
                                                            disabled={processing}
                                                            autoFocus
                                                        />
                                                        {errors.description && <p className="text-destructive mt-1 text-sm">{errors.description}</p>}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                placeholder="0.00"
                                                                step="0.01"
                                                                value={data.percentage}
                                                                onChange={(e) => setData('percentage', e.target.value)}
                                                                disabled={processing}
                                                                className="font-mono"
                                                            />
                                                            <span className="text-muted-foreground text-sm">%</span>
                                                        </div>
                                                        {errors.percentage && <p className="text-destructive mt-1 text-sm">{errors.percentage}</p>}
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

                                            {paymentConditions.map((condition) => (
                                                <TableRow key={condition.id}>
                                                    <TableCell>
                                                        {editingId === condition.id ? (
                                                            <>
                                                                <Input
                                                                    type="text"
                                                                    value={data.description}
                                                                    onChange={(e) => setData('description', e.target.value)}
                                                                    disabled={processing}
                                                                />
                                                                {errors.description && (
                                                                    <p className="text-destructive mt-1 text-sm">{errors.description}</p>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="font-medium">{condition.description}</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {editingId === condition.id ? (
                                                            <>
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={data.percentage}
                                                                        onChange={(e) => setData('percentage', e.target.value)}
                                                                        disabled={processing}
                                                                        className="font-mono"
                                                                    />
                                                                    <span className="text-muted-foreground text-sm">%</span>
                                                                </div>
                                                                {errors.percentage && (
                                                                    <p className="text-destructive mt-1 text-sm">{errors.percentage}</p>
                                                                )}
                                                            </>
                                                        ) : (
                                                            getPercentageBadge(condition.percentage)
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {editingId === condition.id ? (
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="sm" onClick={() => handleSave(condition.id)} disabled={processing}>
                                                                    <Save className="mr-1 h-3 w-3" />
                                                                    Actualizar
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
                                                                    variant="ghost"
                                                                    onClick={() => startEdit(condition)}
                                                                    disabled={isAdding || editingId !== null}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDelete(condition)}
                                                                    disabled={isAdding || editingId !== null}
                                                                >
                                                                    <Trash2 className="text-destructive h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {paymentConditions.length === 0 && !isAdding && (
                                        <div className="text-muted-foreground py-8 text-center">
                                            No hay condiciones de pago configuradas. Haz clic en "Nueva Condición" para comenzar.
                                        </div>
                                    )}

                                    <div className="bg-muted mt-4 rounded-lg p-4">
                                        <h4 className="mb-2 font-semibold">💡 Información</h4>
                                        <p className="text-muted-foreground text-sm">
                                            <strong>Porcentaje positivo (+):</strong> Aplica un recargo al total del presupuesto. Por ejemplo, +10%
                                            incrementa el total en un 10%.
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            <strong>Porcentaje negativo (-):</strong> Aplica un descuento al total del presupuesto. Por ejemplo, -5%
                                            reduce el total en un 5%.
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            <strong>Porcentaje cero (0):</strong> No se aplica ningún ajuste al presupuesto.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteConfirmationDialog />
        </AppLayout>
    );
}
