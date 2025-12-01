// resources/js/pages/dashboard/picking/Show.jsx
import ButtonCustom from '@/components/ButtonCustom';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Box, Calendar, Copy, Download, Edit, Mail, Package, PackagePlus, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Show({ auth, budget }) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showSendDialog, setShowSendDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Mostrar toast si hay mensaje flash
    useEffect(() => {
        if (window.history.state?.flash?.success) {
            toast.success(window.history.state.flash.success);
        }
        if (window.history.state?.flash?.error) {
            toast.error(window.history.state.flash.error);
        }
    }, []);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('dashboard.picking.budgets.destroy', budget.id), {
            onSuccess: () => {
                toast.success('Presupuesto eliminado correctamente');
            },
            onError: () => {
                toast.error('Error al eliminar el presupuesto');
                setIsDeleting(false);
            },
        });
    };

    const handleSendEmail = () => {
        setIsSending(true);
        router.post(
            route('dashboard.picking.budgets.send', budget.id),
            {},
            {
                onSuccess: () => {
                    toast.success('Presupuesto enviado por email correctamente');
                    setShowSendDialog(false);
                    setIsSending(false);
                },
                onError: () => {
                    toast.error('Error al enviar el presupuesto');
                    setIsSending(false);
                },
            },
        );
    };

    const handleDownloadPdf = () => {
        window.open(route('dashboard.picking.budgets.pdf', budget.id), '_blank');
    };

    const handleDownload = () => {
        window.location.href = route('dashboard.picking.budgets.pdf', budget.id);
    };

    const handleDuplicate = () => {
        router.post(route('dashboard.picking.budgets.duplicate', budget.id));
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(value);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'America/Argentina/Buenos_Aires',
        });
    };

    const StatusBadge = ({ status }) => {
        const variants = {
            draft: 'bg-gray-100 text-gray-800',
            sent: 'bg-blue-100 text-blue-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            expired: 'bg-orange-100 text-orange-800',
        };

        const labels = {
            draft: 'Borrador',
            sent: 'Enviado',
            approved: 'Aprobado',
            rejected: 'Rechazado',
            expired: 'Vencido',
        };

        return <Badge className={variants[status] || variants.draft}>{labels[status] || status}</Badge>;
    };

    const breadcrumbs = [
        {
            title: 'Presupuestos de Picking',
            href: '/dashboard/picking',
        },
        {
            title: 'Detalles del Presupuesto',
            href: '#',
        },
    ];

    const canEdit = budget.status === 'draft';
    const canDelete = budget.status === 'draft';
    const canSendEmail = budget.client_email;

    return (
        <AppLayout user={auth.user} breadcrumbs={breadcrumbs}>
            <Head title={`Presupuesto ${budget.budget_number}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header con acciones */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Presupuesto {budget.budget_number}</h2>
                            <p className="mt-1 text-sm text-gray-600">Detalles del presupuesto de picking / armado de kits</p>
                        </div>
                        <StatusBadge status={budget.status} />
                    </div>

                    {/* Botones de acción */}
                    <div className="mb-6 flex flex-wrap gap-2">
                        {canEdit && (
                            <ButtonCustom
                                variant="primary"
                                size="sm"
                                onClick={() => router.visit(route('dashboard.picking.budgets.edit', budget.id))}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </ButtonCustom>
                        )}

                        <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar PDF
                        </Button>

                        {budget.client_email && (
                            <Button variant="outline" size="sm" onClick={() => setShowSendDialog(true)}>
                                <Mail className="mr-2 h-4 w-4" />
                                Enviar por Email
                            </Button>
                        )}

                        <Button variant="outline" size="sm" onClick={handleDuplicate}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                        </Button>

                        {canDelete && (
                            <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </Button>
                        )}
                    </div>

                    {/* Grid de información */}
                    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Información del Cliente */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Información del Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Nombre</p>
                                    <p className="text-base text-gray-900">{budget.client.name}</p>
                                </div>
                                {budget.client.company && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Empresa</p>
                                        <p className="text-base text-gray-900">{budget.client.company}</p>
                                    </div>
                                )}
                                {budget.client.email && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email</p>
                                        <p className="text-base text-gray-900">{budget.client.email}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm font-medium text-gray-500">Vendedor</p>
                                    <p className="text-base text-gray-900">{budget.vendor.name}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Información del Presupuesto */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Información del Presupuesto
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Fecha de creación</p>
                                    <p className="text-base text-gray-900">{formatDate(budget.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Válido hasta</p>
                                    <p className="text-base text-gray-900">{formatDate(budget.valid_until)}</p>
                                </div>
                                {budget.production_time && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Tiempo de producción</p>
                                        <p className="text-base text-gray-900">{budget.production_time}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Cantidades */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Cantidades
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded-lg bg-blue-50 p-4">
                                    <p className="text-sm font-medium text-blue-900">Total de Kits</p>
                                    <p className="mt-1 text-2xl font-bold text-blue-600">{budget.total_kits.toLocaleString('es-AR')}</p>
                                </div>
                                <div className="rounded-lg bg-purple-50 p-4">
                                    <p className="text-sm font-medium text-purple-900">Componentes por Kit</p>
                                    <p className="mt-1 text-2xl font-bold text-purple-600">{budget.total_components_per_kit}</p>
                                </div>
                                <div className="rounded-lg bg-green-50 p-4">
                                    <p className="text-sm font-medium text-green-900">Precio Unitario por Kit</p>
                                    <p className="mt-1 text-2xl font-bold text-green-600">{formatCurrency(budget.unit_price_per_kit)}</p>
                                </div>
                            </div>
                            {budget.component_increment_description && (
                                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                    <p className="text-sm text-amber-900">
                                        <span className="font-medium">Incremento por cantidad de componentes:</span>{' '}
                                        {budget.component_increment_description} ({(budget.component_increment_percentage * 100).toFixed(0)}%)
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Cajas Seleccionadas */}
                    {budget.boxes && budget.boxes.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Box className="h-5 w-5" />
                                    Cajas Seleccionadas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Dimensiones</th>
                                                <th className="px-3 py-2 text-right text-sm font-medium text-gray-700">Cantidad</th>
                                                <th className="px-3 py-2 text-right text-sm font-medium text-gray-700">Costo Unitario</th>
                                                <th className="px-3 py-2 text-right text-sm font-medium text-gray-700">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {budget.boxes.map((box, index) => (
                                                <tr key={index} className="border-b last:border-0">
                                                    <td className="px-3 py-3 text-sm text-gray-900">{box.box_dimensions}</td>
                                                    <td className="px-3 py-3 text-right text-sm text-gray-900">
                                                        {box.quantity.toLocaleString('es-AR')}
                                                    </td>
                                                    <td className="px-3 py-3 text-right text-sm text-gray-900">
                                                        {formatCurrency(box.box_unit_cost)}
                                                    </td>
                                                    <td className="px-3 py-3 text-right text-sm font-medium text-gray-900">
                                                        {formatCurrency(box.subtotal)}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-50">
                                                <td colSpan="3" className="px-3 py-3 text-right text-sm font-medium text-gray-700">
                                                    Total Cajas:
                                                </td>
                                                <td className="px-3 py-3 text-right text-sm font-bold text-gray-900">
                                                    {formatCurrency(budget.box_total)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Servicios Incluidos */}
                    {budget.services && budget.services.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PackagePlus className="h-5 w-5" />
                                    Servicios Incluidos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Servicio</th>
                                                <th className="px-3 py-2 text-right text-sm font-medium text-gray-700">Cantidad</th>
                                                <th className="px-3 py-2 text-right text-sm font-medium text-gray-700">Costo Unitario</th>
                                                <th className="px-3 py-2 text-right text-sm font-medium text-gray-700">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {budget.services.map((service, index) => (
                                                <tr key={index} className="border-b last:border-0">
                                                    <td className="px-3 py-3 text-sm text-gray-900">{service.service_description}</td>
                                                    <td className="px-3 py-3 text-right text-sm text-gray-900">
                                                        {service.quantity.toLocaleString('es-AR')}
                                                    </td>
                                                    <td className="px-3 py-3 text-right text-sm text-gray-900">
                                                        {formatCurrency(service.unit_cost)}
                                                    </td>
                                                    <td className="px-3 py-3 text-right text-sm font-medium text-gray-900">
                                                        {formatCurrency(service.subtotal)}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-50">
                                                <td colSpan="3" className="px-3 py-3 text-right text-sm font-medium text-gray-700">
                                                    Total Servicios:
                                                </td>
                                                <td className="px-3 py-3 text-right text-sm font-bold text-gray-900">
                                                    {formatCurrency(budget.services_subtotal)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Totales */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Totales del Presupuesto</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-600">Subtotal servicios</span>
                                    <span className="text-base font-medium">{formatCurrency(budget.services_subtotal)}</span>
                                </div>
                                {budget.component_increment_amount > 0 && (
                                    <div className="flex items-center justify-between border-t py-2">
                                        <span className="text-sm text-gray-600">
                                            Incremento por cantidad de componentes ({(budget.component_increment_percentage * 100).toFixed(0)}%)
                                        </span>
                                        <span className="text-base font-medium">{formatCurrency(budget.component_increment_amount)}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between border-t py-2">
                                    <span className="text-sm text-gray-600">Subtotal con incremento</span>
                                    <span className="text-base font-medium">{formatCurrency(budget.subtotal_with_increment)}</span>
                                </div>
                                <div className="flex items-center justify-between border-t py-2">
                                    <span className="text-sm text-gray-600">Subtotal cajas</span>
                                    <span className="text-base font-medium">{formatCurrency(budget.box_total)}</span>
                                </div>
                                <div className="flex items-center justify-between border-t-2 border-gray-300 py-3">
                                    <span className="text-lg font-bold text-gray-900">TOTAL</span>
                                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(budget.total)}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                                    <span className="text-sm font-medium text-green-900">Precio unitario por kit</span>
                                    <span className="text-lg font-bold text-green-600">{formatCurrency(budget.unit_price_per_kit)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notas */}
                    {budget.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm whitespace-pre-wrap text-gray-700">{budget.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Dialog de confirmación de eliminación */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar presupuesto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará el presupuesto {budget.budget_number} de forma permanente. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog de confirmación de envío de email */}
            <AlertDialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Enviar presupuesto por email?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se enviará el presupuesto {budget.budget_number} a {budget.client_email}. El presupuesto se marcará como enviado.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSendEmail} disabled={isSending}>
                            {isSending ? 'Enviando...' : 'Enviar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
