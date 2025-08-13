import PageHeader from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Building2, CalendarDays, Clock, Copy, DollarSign, Edit, Eye, Package, Send, User } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs = [
    {
        title: 'Presupuestos',
        href: '/dashboard/budgets',
    },
    {
        title: 'Detalles del Presupuesto',
        href: '#',
    },
];

export default function Show({ budget, regularItems, variantGroups, hasVariants }) {
    const [selectedVariants, setSelectedVariants] = useState({});
    const [calculatedTotals, setCalculatedTotals] = useState({
        subtotal: parseFloat(budget.subtotal),
        total: parseFloat(budget.total),
    });

    // Inicializar variantes seleccionadas (primera opción por defecto)
    useEffect(() => {
        const initialVariants = {};
        Object.keys(variantGroups).forEach((group) => {
            initialVariants[group] = variantGroups[group][0]?.id;
        });
        setSelectedVariants(initialVariants);
    }, [variantGroups]);

    // Recalcular totales cuando cambian las variantes seleccionadas
    useEffect(() => {
        let newSubtotal = 0;

        // Sumar items regulares
        regularItems.forEach((item) => {
            newSubtotal += parseFloat(item.line_total);
        });

        // Sumar variantes seleccionadas
        Object.keys(variantGroups).forEach((group) => {
            const selectedItemId = selectedVariants[group];
            const selectedItem = variantGroups[group].find((item) => item.id === selectedItemId);
            if (selectedItem) {
                newSubtotal += parseFloat(selectedItem.line_total);
            }
        });

        setCalculatedTotals({
            subtotal: newSubtotal,
            total: newSubtotal,
        });
    }, [selectedVariants, regularItems, variantGroups]);

    const handleVariantChange = (group, itemId) => {
        setSelectedVariants((prev) => ({
            ...prev,
            [group]: itemId,
        }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    const formatDate = (date) => {
        return format(new Date(date), 'dd/MM/yyyy', { locale: es });
    };

    const getStatusBadge = () => {
        if (budget.is_expired) {
            return <Badge variant="destructive">Vencido</Badge>;
        }
        if (budget.days_until_expiry <= 3) {
            return <Badge variant="warning">Por vencer</Badge>;
        }
        return <Badge variant="success">Activo</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Presupuesto - ${budget.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <PageHeader backRoute={route('dashboard.budgets.index')} backText="Volver" />

                        <div className="space-y-6 p-6">
                            {/* Información general del presupuesto */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                            <Package className="h-4 w-4" />
                                            Información General
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <p className="font-semibold">{budget.title}</p>
                                            <p className="text-muted-foreground text-sm">Token: {budget.token}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Estado:</span>
                                            {getStatusBadge()}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                            <Building2 className="h-4 w-4" />
                                            Cliente
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <p className="font-semibold">{budget.client.name}</p>
                                            <p className="text-muted-foreground text-sm">{budget.client.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="h-4 w-4" />
                                            <span>Vendedor: {budget.user.name}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                            <CalendarDays className="h-4 w-4" />
                                            Fechas
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <span className="text-muted-foreground text-sm">Emisión:</span>
                                            <p className="font-medium">{formatDate(budget.issue_date)}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground text-sm">Vencimiento:</span>
                                            <p className="font-medium">{formatDate(budget.expiry_date)}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4" />
                                            <span>{budget.days_until_expiry} días restantes</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Items del presupuesto */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Items del Presupuesto
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {/* Items regulares */}
                                        {regularItems.length > 0 && (
                                            <div className="space-y-3">
                                                {regularItems.map((item) => (
                                                    <div key={item.id} className="rounded-lg border p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1 space-y-2">
                                                                <h4 className="font-semibold">{item.product.name}</h4>
                                                                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                                                                    <div>
                                                                        <span className="text-muted-foreground">Cantidad:</span>
                                                                        <p className="font-medium">{item.quantity}</p>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-muted-foreground">Precio unit.:</span>
                                                                        <p className="font-medium">{formatCurrency(item.unit_price)}</p>
                                                                    </div>
                                                                    {item.production_time_days && (
                                                                        <div>
                                                                            <span className="text-muted-foreground">Producción:</span>
                                                                            <p className="font-medium">{item.production_time_days} días</p>
                                                                        </div>
                                                                    )}
                                                                    {item.logo_printing && (
                                                                        <div>
                                                                            <span className="text-muted-foreground">Logo:</span>
                                                                            <p className="font-medium">{item.logo_printing}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="ml-4 text-right">
                                                                <p className="text-lg font-bold">{formatCurrency(item.line_total)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Grupos de variantes */}
                                        {Object.keys(variantGroups).length > 0 && (
                                            <div className="space-y-6">
                                                {Object.entries(variantGroups).map(([group, items]) => (
                                                    <div key={group} className="rounded-lg border p-4">
                                                        <h4 className="mb-4 font-semibold">{items[0].product.name} - Opciones de cantidad</h4>
                                                        <div className="space-y-3">
                                                            {items.map((item) => (
                                                                <label
                                                                    key={item.id}
                                                                    className="flex cursor-pointer items-center space-x-3 rounded border-2 p-3 transition-colors hover:bg-gray-50"
                                                                    style={{
                                                                        borderColor: selectedVariants[group] === item.id ? '#3b82f6' : '#e5e7eb',
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name={`variant_${group}`}
                                                                        value={item.id}
                                                                        checked={selectedVariants[group] === item.id}
                                                                        onChange={() => handleVariantChange(group, item.id)}
                                                                        className="text-blue-600"
                                                                    />
                                                                    <div className="flex flex-1 items-center justify-between">
                                                                        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                                                                            <div>
                                                                                <span className="text-muted-foreground">Cantidad:</span>
                                                                                <p className="font-medium">{item.quantity}</p>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-muted-foreground">Precio unit.:</span>
                                                                                <p className="font-medium">{formatCurrency(item.unit_price)}</p>
                                                                            </div>
                                                                            {item.production_time_days && (
                                                                                <div>
                                                                                    <span className="text-muted-foreground">Producción:</span>
                                                                                    <p className="font-medium">{item.production_time_days} días</p>
                                                                                </div>
                                                                            )}
                                                                            {item.logo_printing && (
                                                                                <div>
                                                                                    <span className="text-muted-foreground">Logo:</span>
                                                                                    <p className="font-medium">{item.logo_printing}</p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-lg font-bold">{formatCurrency(item.line_total)}</p>
                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Totales y comentarios */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5" />
                                            Totales
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span className="font-semibold">{formatCurrency(calculatedTotals.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                            <span>Total:</span>
                                            <span>{formatCurrency(calculatedTotals.total)}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {budget.footer_comments && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Comentarios</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm whitespace-pre-wrap">{budget.footer_comments}</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Acciones */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Acciones</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-3">
                                        <Button variant="outline" className="flex items-center gap-2">
                                            <Edit className="h-4 w-4" />
                                            Editar
                                        </Button>
                                        <Button variant="outline" className="flex items-center gap-2">
                                            <Copy className="h-4 w-4" />
                                            Duplicar
                                        </Button>
                                        <Button variant="outline" className="flex items-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            Vista Pública
                                        </Button>
                                        <Button variant="outline" className="flex items-center gap-2">
                                            <Send className="h-4 w-4" />
                                            Enviar por Email
                                        </Button>
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
