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
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Box, Calendar, Copy, DollarSign, Download, Edit, Mail, Package, PackagePlus, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PickingBudgetTotalsSection from './components/PickingBudgetTotalsSection';

export default function Show({ auth, budget, businessConfig }) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showSendDialog, setShowSendDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSending, setIsSending] = useState(false);
    
    // Estado para totales calculados
    const [calculatedTotals, setCalculatedTotals] = useState({
        servicesSubtotal: 0,
        incrementAmount: 0,
        subtotalWithIncrement: 0,
        boxTotal: 0,
        paymentConditionAmount: 0,
        iva: 0,
        total: 0,
        unitPricePerKit: 0,
    });

    // Hook para manejar respuestas de Inertia
    const { handleCrudResponse } = useInertiaResponse();
    
    // Obtener props.flash para los mensajes
    const { props } = usePage();

    // Obtener configuración de IVA
    const ivaRate = businessConfig?.iva_rate ?? 0.21;
    const applyIva = businessConfig?.apply_iva ?? true;

    // Preparar información de incremento para el componente
    const incrementInfo = budget.component_increment_description
        ? {
              description: budget.component_increment_description,
              percentage: parseFloat(budget.component_increment_percentage) || 0,
          }
        : null;

    // Preparar información de payment condition para el componente
    const paymentConditionInfo = budget.payment_condition_description
        ? {
              description: budget.payment_condition_description,
              percentage: parseFloat(budget.payment_condition_percentage) || 0,
          }
        : null;

    // Interceptar flash messages en el destino de la navegación
    useEffect(() => {
        const flashSuccess = props.flash?.success;
        const flashError = props.flash?.error;
        const flashWarning = props.flash?.warning;
        const flashInfo = props.flash?.info;

        if (flashSuccess) {
            toast.success(flashSuccess);
        } else if (flashError) {
            toast.error(flashError);
        } else if (flashWarning) {
            toast.warning(flashWarning);
        } else if (flashInfo) {
            toast.info(flashInfo);
        }
    }, [props.flash]);

    // Calcular totales (incluye IVA y payment condition)
    useEffect(() => {
        // Calcular incremento por componentes
        const servicesSubtotal = parseFloat(budget.services_subtotal) || 0;
        const incrementAmount = parseFloat(budget.component_increment_amount) || 0;
        const subtotalWithIncrement = servicesSubtotal + incrementAmount;

        const boxTotal = parseFloat(budget.box_total) || 0;

        // Subtotal base (antes de payment condition e IVA)
        const subtotalBase = subtotalWithIncrement + boxTotal;

        // Calcular ajuste por condición de pago
        let paymentConditionAmount = 0;
        if (budget.payment_condition_percentage) {
            paymentConditionAmount = subtotalBase * (parseFloat(budget.payment_condition_percentage) / 100);
        }

        const subtotalWithPayment = subtotalBase + paymentConditionAmount;

        // Calcular IVA
        const ivaAmount = applyIva ? subtotalWithPayment * ivaRate : 0;
        const total = subtotalWithPayment + ivaAmount;

        // Precio unitario por kit
        const unitPricePerKit = parseFloat(budget.unit_price_per_kit) || 0;

        setCalculatedTotals({
            servicesSubtotal,
            incrementAmount,
            subtotalWithIncrement,
            boxTotal,
            paymentConditionAmount,
            iva: ivaAmount,
            total,
            unitPricePerKit,
        });
    }, [budget, ivaRate, applyIva]);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(
            route('dashboard.picking.budgets.destroy', budget.id),
            handleCrudResponse(setIsDeleting)
        );
    };

    const handleSendEmail = () => {
        setIsSending(true);
        router.post(
            route('dashboard.picking.budgets.send', budget.id),
            {},
            handleCrudResponse(setIsSending, () => {
                setShowSendDialog(false);
            })
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

    // Determinar permisos
    const canEdit = auth.user?.role === 'admin' || budget.user_id === auth.user?.id;
    const canDelete = auth.user?.role === 'admin' || budget.user_id === auth.user?.id;

    const StatusBadge = ({ status }) => {
        const statusColors = {
            draft: 'bg-gray-100 text-gray-800',
            pending: 'bg-yellow-100 text-yellow-800',
            sent: 'bg-blue-100 text-blue-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };

        const statusLabels = {
            draft: 'Borrador',
            pending: 'Pendiente',
            sent: 'Enviado',
            approved: 'Aprobado',
            rejected: 'Rechazado',
        };

        return (
            <Badge className={`${statusColors[status] || statusColors.draft} rounded-full px-3 py-1`}>
                {statusLabels[status] || status}
            </Badge>
        );
    };

    const breadcrumbs = [
        {
            title: 'Presupuestos de Picking',
            href: '/dashboard/picking',
        },
        {
            title: `Presupuesto ${budget.budget_number}`,
            href: '#',
        },
    ];

    return (
        <AppLayout user={auth.user} breadcrumbs={breadcrumbs}>
            <Head title={`Presupuesto ${budget.budget_number}`} />

            <div className="p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header con título y estado */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Presupuesto {budget.budget_number}</h1>
                            <p className="text-sm text-gray-600">Detalles del presupuesto de picking / armado de kits</p>
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

                        {budget.client.email && (
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
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                        <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Cliente</p>
                                        <p className="font-semibold">{budget.client.name}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                        <Package className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total de Kits</p>
                                        <p className="font-semibold">{budget.total_kits.toLocaleString('es-AR')}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                                        <PackagePlus className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Componentes por Kit</p>
                                        <p className="font-semibold">{budget.total_components_per_kit}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                                        <Calendar className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Fecha</p>
                                        <p className="font-semibold">{new Date(budget.created_at).toLocaleDateString('es-AR')}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Información de precio unitario */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <DollarSign className="h-8 w-8 text-green-600" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">Precio Unitario por Kit</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(budget.unit_price_per_kit)}</p>
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
                                    <Package className="h-5 w-5" />
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
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Resumen de Totales */}
                    <PickingBudgetTotalsSection
                        totals={calculatedTotals}
                        incrementInfo={incrementInfo}
                        paymentCondition={paymentConditionInfo}
                        totalKits={budget.total_kits}
                        ivaRate={ivaRate}
                        showIva={applyIva}
                    />

                    {/* Notas */}
                    {budget.notes && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Notas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-gray-700">{budget.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Dialog de confirmación de eliminación */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente el presupuesto {budget.budget_number}. Esta acción no se puede deshacer.
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
                            Se enviará el presupuesto {budget.budget_number} a {budget.client.email}. El presupuesto se marcará como enviado.
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
