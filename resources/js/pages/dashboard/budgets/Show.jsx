import PageHeader from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Building2, CalendarDays, Clock, Copy, DollarSign, Edit, ExternalLink, Mail, Package, Send, Trash2, User } from 'lucide-react';
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

export default function Show({ budget, regularItems, variantGroups, hasVariants, ivaRate }) {
    const [selectedVariants, setSelectedVariants] = useState({});
    const [calculatedTotals, setCalculatedTotals] = useState({
        subtotal: parseFloat(budget.subtotal),
        iva: 0,
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

        // Calcular IVA usando la configuración del backend
        const ivaAmount = newSubtotal * ivaRate;
        const totalWithIva = newSubtotal + ivaAmount;

        setCalculatedTotals({
            subtotal: newSubtotal,
            iva: ivaAmount,
            total: totalWithIva,
        });
    }, [selectedVariants, regularItems, variantGroups, ivaRate]);

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
        return new Intl.DateTimeFormat('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date));
    };

    const formatDateShort = (date) => {
        return new Intl.DateTimeFormat('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(new Date(date));
    };

    const getStatusBadge = () => {
        const days = Math.abs(budget.days_until_expiry);

        // Caso 1: Vence hoy
        if (budget.is_expiring_today) {
            return (
                <Badge variant="warning" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Vence Hoy
                </Badge>
            );
        }

        // Caso 2: Ya vencido
        if (budget.is_expired) {
            if (days === 1) {
                return (
                    <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Vencido hace 1 día
                    </Badge>
                );
            } else {
                return (
                    <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Vencido
                    </Badge>
                );
            }
        }

        // Caso 3: Por vencer (próximos 3 días)
        if (days <= 3 && days > 0) {
            const dayText = days === 1 ? 'día' : 'días';
            return (
                <Badge variant="warning" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Vence en {days} {dayText}
                </Badge>
            );
        }

        // Caso 4: Activo con tiempo suficiente
        const dayText = days === 1 ? 'día' : 'días';
        return (
            <Badge variant="success" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Activo ({days} {dayText} restantes)
            </Badge>
        );
    };

    const handleEdit = () => {
        router.visit(route('dashboard.budgets.edit', budget.id));
    };

    const handleDuplicate = () => {
        router.visit(route('dashboard.budgets.duplicate', budget.id));
    };

    const handleSendEmail = () => {
        if (confirm('¿Estás seguro de que quieres enviar este presupuesto por email al cliente?')) {
            router.post(
                route('dashboard.budgets.send-email', budget.id),
                {},
                {
                    onSuccess: () => {
                        alert('Email enviado exitosamente');
                    },
                    onError: (errors) => {
                        alert('Error al enviar el email: ' + (errors.message || 'Error desconocido'));
                    },
                },
            );
        }
    };

    const handleDelete = () => {
        if (confirm('¿Estás seguro de que quieres eliminar este presupuesto? Esta acción no se puede deshacer.')) {
            router.delete(route('dashboard.budgets.destroy', budget.id), {
                onSuccess: () => {
                    router.visit(route('dashboard.budgets.index'));
                },
            });
        }
    };

    const handleViewPublic = () => {
        // Usamos el ID en lugar del token para la vista pública
        const publicUrl = route('public.budget.show', budget.id);
        window.open(publicUrl, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Presupuesto - ${budget.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <PageHeader backRoute={route('dashboard.budgets.index')} backText="Volver" />

                        <div className="space-y-6 p-6">
                            {/* Header del presupuesto */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{budget.title}</h1>
                                    <p className="mt-1 text-sm text-gray-500">Presupuesto #{budget.id}</p>
                                </div>
                                <div className="flex items-center gap-2">{getStatusBadge()}</div>
                            </div>

                            {/* Información básica del presupuesto */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Información del Cliente
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                                            <dd className="text-sm text-gray-900">{budget.client.name}</dd>
                                        </div>
                                        {budget.client.company && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Empresa</dt>
                                                <dd className="text-sm text-gray-900">{budget.client.company}</dd>
                                            </div>
                                        )}
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                                            <dd className="text-sm text-gray-900">{budget.client.email || 'No configurado'}</dd>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CalendarDays className="h-5 w-5" />
                                            Fechas
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Fecha de emisión</dt>
                                            <dd className="text-sm text-gray-900">{formatDateShort(budget.issue_date)}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Fecha de vencimiento</dt>
                                            <dd className="text-sm text-gray-900">{formatDateShort(budget.expiry_date)}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Última modificación</dt>
                                            <dd className="text-sm text-gray-900">{formatDate(budget.updated_at)}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Vencimiento del presupuesto</dt>
                                            <dd className="text-sm text-gray-900">
                                                {budget.is_expiring_today ? (
                                                    <span className="font-medium text-orange-600">Vence Hoy</span>
                                                ) : budget.is_expired ? (
                                                    <span className="font-medium text-red-600">
                                                        {Math.abs(budget.days_until_expiry) === 1 ? 'Vencido hace 1 día' : 'Vencido'}
                                                    </span>
                                                ) : (
                                                    <span className="font-medium text-green-600">
                                                        {budget.days_until_expiry === 1
                                                            ? '1 día restante'
                                                            : `${budget.days_until_expiry} días restantes`}
                                                    </span>
                                                )}
                                            </dd>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Vendedor */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Vendedor Asignado
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                                        <dd className="text-sm text-gray-900">{budget.user.name}</dd>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Items del presupuesto */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Items del Presupuesto
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Items regulares */}
                                    {regularItems.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-gray-900">Items Principales</h4>
                                            <div className="space-y-3">
                                                {regularItems.map((item) => (
                                                    <div key={item.id} className="flex justify-between rounded-lg border p-4">
                                                        <div className="flex gap-4">
                                                            {item.product.images?.[0] && (
                                                                <img
                                                                    src={item.product.images[0].full_url || item.product.images[0].url}
                                                                    alt={item.product.name}
                                                                    className="h-16 w-16 rounded object-cover"
                                                                />
                                                            )}
                                                            <div>
                                                                <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                                                                {item.product.description && (
                                                                    <p className="text-sm text-gray-500">{item.product.description}</p>
                                                                )}
                                                                <p className="text-sm text-gray-600">
                                                                    Cantidad: {item.quantity} | Precio unit: {formatCurrency(item.unit_price)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium text-gray-900">{formatCurrency(item.line_total)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Grupos de variantes - Nueva estructura */}
                                    {Object.keys(variantGroups).map((group) => {
                                        const variants = variantGroups[group];
                                        const firstVariant = variants[0];
                                        const productImage = firstVariant?.product?.images?.[0];

                                        return (
                                            <div key={group} className="mt-6">
                                                <Card className="p-4 shadow-none">
                                                    <CardHeader className="p-0 pb-3">
                                                        <CardTitle className="flex items-center gap-3 text-lg">
                                                            {productImage && (
                                                                <img
                                                                    src={productImage.full_url || productImage.url}
                                                                    alt={firstVariant.product.name}
                                                                    className="h-16 w-16 rounded object-cover"
                                                                />
                                                            )}
                                                            <div>
                                                                <div className="font-medium text-gray-900">{firstVariant.product.name}</div>
                                                                <div className="text-sm font-normal text-gray-500">Selecciona una opción</div>
                                                            </div>
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-0">
                                                        <div className="ml-0 space-y-2">
                                                            {variants.map((item, index) => (
                                                                <div
                                                                    key={item.id}
                                                                    className={`flex cursor-pointer justify-between rounded-lg border p-3 transition-all duration-200 ${
                                                                        selectedVariants[group] === item.id
                                                                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                                    }`}
                                                                    onClick={() => handleVariantChange(group, item.id)}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div
                                                                            className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                                                                                selectedVariants[group] === item.id
                                                                                    ? 'border-blue-500 bg-blue-500'
                                                                                    : 'border-gray-300'
                                                                            }`}
                                                                        >
                                                                            {selectedVariants[group] === item.id && (
                                                                                <div className="h-2 w-2 rounded-full bg-white"></div>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm text-gray-600">
                                                                                <strong>Cantidad:</strong> {item.quantity} |{' '}
                                                                                <strong>Precio unit:</strong> {formatCurrency(item.unit_price)} |{' '}
                                                                                <strong>Logo:</strong> {item.logo_printing ? item.logo_printing : '-'}{' '}
                                                                                | <strong>Días Prod:</strong>{' '}
                                                                                {item.production_time_days ? item.production_time_days : '-'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-medium text-gray-900">{formatCurrency(item.line_total)}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* Comentarios del footer */}
                            {budget.footer_comments && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Comentarios Adicionales</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-line text-gray-700">{budget.footer_comments}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Totales */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Totales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-medium">{formatCurrency(calculatedTotals.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">IVA ({Math.round(ivaRate * 100)}%)</span>
                                            <span className="font-medium">{formatCurrency(calculatedTotals.iva)}</span>
                                        </div>
                                        <div className="border-t pt-2">
                                            <div className="flex justify-between">
                                                <span className="text-lg font-semibold">Total</span>
                                                <span className="text-lg font-semibold text-green-600">{formatCurrency(calculatedTotals.total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sección de acciones */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Acciones
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-3">
                                        <Button onClick={handleEdit} variant="outline" size="sm">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Editar
                                        </Button>

                                        <Button onClick={handleDuplicate} variant="outline" size="sm">
                                            <Copy className="mr-2 h-4 w-4" />
                                            Duplicar
                                        </Button>

                                        <Button onClick={handleSendEmail} variant="outline" size="sm" disabled={!budget.client?.email}>
                                            <Send className="mr-2 h-4 w-4" />
                                            {budget.email_sent ? 'Reenviar Email' : 'Enviar Email'}
                                        </Button>

                                        <Button onClick={handleViewPublic} variant="outline" size="sm">
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Ver Vista Pública
                                        </Button>

                                        <Button onClick={handleDelete} variant="destructive" size="sm">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar
                                        </Button>
                                    </div>

                                    {budget.email_sent && (
                                        <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3">
                                            <p className="text-sm text-green-800">
                                                <Mail className="mr-1 inline h-4 w-4" />
                                                Email enviado el {formatDate(budget.email_sent_at)}
                                            </p>
                                        </div>
                                    )}

                                    {!budget.client?.email && (
                                        <div className="mt-3 rounded-md border border-yellow-200 bg-yellow-50 p-3">
                                            <p className="text-sm text-yellow-800">
                                                <AlertTriangle className="mr-1 inline h-4 w-4" />
                                                El cliente no tiene email configurado
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
