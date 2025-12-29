// resources/js/pages/dashboard/picking/Show.jsx
import BudgetStatusBadge, { budgetStatusOptions, canSendStatus, isEditableStatus, isPubliclyVisibleStatus } from '@/components/BudgetStatusBadge';
import GlobalWarningsBanner from '@/components/GlobalWarningsBanner';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Box,
    Calendar,
    CheckCircle,
    Clock,
    Copy,
    DollarSign,
    Download,
    Edit,
    ExternalLink,
    FileEdit,
    FileText,
    Loader2,
    Mail,
    Package,
    PackagePlus,
    Send,
    User,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PickingBudgetTotalsSection from './components/PickingBudgetTotalsSection';

export default function Show({ auth, budget, warnings, businessConfig }) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showSendDialog, setShowSendDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);

    // Determinar permisos
    const canSendEmail = canSendStatus(budget.status) || budget.status === 'sent';
    const isEditable = isEditableStatus(budget.status);
    const isPubliclyVisible = isPubliclyVisibleStatus(budget.status);

    // Obtener etiqueta del estado
    const getStatusLabel = (status) => {
        const option = budgetStatusOptions.find((o) => o.value === status);
        return option?.label || status;
    };

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

    const handleStatusChange = (newStatus) => {
        if (newStatus === budget.status) return;
        setPendingStatus(newStatus);
        setShowStatusConfirm(true);
    };

    const confirmStatusChange = () => {
        setIsUpdatingStatus(true);
        setShowStatusConfirm(false);

        router.patch(
            route('dashboard.picking.budgets.update-status', budget.id),
            { status: pendingStatus },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsUpdatingStatus(false);
                    setPendingStatus(null);
                },
            },
        );
    };

    const handleViewPublic = () => {
        const publicUrl = route('public.budget.show', budget.token);
        window.open(publicUrl, '_blank');
    };

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

    // Calcular totales desde los servicios y cajas
    useEffect(() => {
        // 1. Calcular subtotal de servicios desde el array
        const servicesSubtotal =
            budget.services?.reduce((sum, service) => {
                return sum + (parseFloat(service.subtotal) || 0);
            }, 0) || 0;

        // 2. Incremento por componentes
        const incrementPercentage = parseFloat(budget.component_increment_percentage) || 0;
        const incrementAmount = servicesSubtotal * incrementPercentage;
        const subtotalWithIncrement = servicesSubtotal + incrementAmount;

        // 3. Total de cajas
        const boxTotal =
            budget.boxes?.reduce((sum, box) => {
                return sum + (parseFloat(box.subtotal) || 0);
            }, 0) || 0;

        // 4. Subtotal base (antes de payment condition e IVA)
        const subtotal = subtotalWithIncrement + boxTotal;

        // 5. Calcular ajuste por condición de pago
        let paymentConditionAmount = 0;
        if (budget.payment_condition_percentage) {
            paymentConditionAmount = subtotal * (parseFloat(budget.payment_condition_percentage) / 100);
        }

        const subtotalWithPayment = subtotal + paymentConditionAmount;

        // 6. Calcular IVA
        const ivaAmount = applyIva ? subtotalWithPayment * ivaRate : 0;
        const total = subtotalWithPayment + ivaAmount;

        // 7. Precio unitario por kit
        const unitPricePerKit = budget.total_kits > 0 ? total / budget.total_kits : 0;

        setCalculatedTotals({
            servicesSubtotal,
            incrementAmount,
            subtotalWithIncrement,
            boxTotal,
            subtotal, // ← FALTABA ESTE
            paymentConditionAmount,
            iva: ivaAmount,
            total,
            unitPricePerKit,
        });
    }, [budget, ivaRate, applyIva]);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('dashboard.picking.budgets.destroy', budget.id), handleCrudResponse(setIsDeleting));
    };

    const handleSendEmail = () => {
        setIsSending(true);
        router.post(
            route('dashboard.picking.budgets.send', budget.id),
            {},
            handleCrudResponse(setIsSending, () => {
                setShowSendDialog(false);
            }),
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
                            <h1 className="mb-3 text-2xl font-bold text-gray-900">Título {budget.title}</h1>
                            <h2 className="text-1xl font-bold text-gray-600">Presupuesto {budget.budget_number}</h2>
                            <p className="text-sm text-gray-600">Detalles del presupuesto de picking / armado de kits</p>
                        </div>
                    </div>

                    {/* Banner de Advertencias Globales */}
                    {warnings && warnings.length > 0 && (
                        <div className="mb-6">
                            <GlobalWarningsBanner
                                warnings={warnings}
                                title="Atención: Existen registros históricos eliminados."
                                subtitle="Te recomendamos editar los registros que ya no están disponibles y enviar el presupuesto nuevamente."
                            />
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-sm font-medium">Estado del Presupuesto</Label>
                                <p className="text-muted-foreground text-sm">Cambia el estado para controlar la visibilidad y acciones disponibles</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Select value={budget.status} onValueChange={handleStatusChange} disabled={isUpdatingStatus}>
                                    <SelectTrigger className="w-[180px]">
                                        {isUpdatingStatus ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Actualizando...</span>
                                            </div>
                                        ) : (
                                            <SelectValue>
                                                <BudgetStatusBadge status={budget.status} size="sm" />
                                            </SelectValue>
                                        )}
                                    </SelectTrigger>
                                    <SelectContent>
                                        {budgetStatusOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                <BudgetStatusBadge status={option.value} size="sm" />
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Información contextual según el estado */}
                        <div className="rounded-lg bg-gray-50 p-3 text-sm">
                            {budget.status === 'unsent' && (
                                <p className="text-gray-600">
                                    <FileEdit className="mr-1 inline h-4 w-4" />
                                    El presupuesto aún no ha sido enviado al cliente. Puedes editarlo libremente.
                                </p>
                            )}
                            {budget.status === 'draft' && (
                                <p className="text-gray-600">
                                    <FileText className="mr-1 inline h-4 w-4" />
                                    Este es un borrador (copia de otro presupuesto). Puedes editarlo antes de enviarlo.
                                </p>
                            )}
                            {budget.status === 'sent' && (
                                <p className="text-blue-600">
                                    <Send className="mr-1 inline h-4 w-4" />
                                    El presupuesto está visible para el cliente. Puede aprobarlo o rechazarlo.
                                </p>
                            )}
                            {budget.status === 'approved' && (
                                <p className="text-green-600">
                                    <CheckCircle className="mr-1 inline h-4 w-4" />
                                    ¡El cliente aprobó este presupuesto! Coordina los siguientes pasos.
                                </p>
                            )}
                            {budget.status === 'rejected' && (
                                <div className="space-y-2">
                                    <p className="text-red-600">
                                        <XCircle className="mr-1 inline h-4 w-4" />
                                        El cliente rechazó este presupuesto. Puedes duplicarlo y hacer una nueva propuesta.
                                    </p>
                                    {budget.rejection_comments && (
                                        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-4">
                                            <p className="mb-1 text-sm font-medium text-red-800">Motivo del rechazo:</p>
                                            <p className="text-sm whitespace-pre-wrap text-red-700">{budget.rejection_comments}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {budget.status === 'expired' && (
                                <p className="text-orange-600">
                                    <Clock className="mr-1 inline h-4 w-4" />
                                    Este presupuesto venció. Puedes duplicarlo para crear uno nuevo con fechas actualizadas.
                                </p>
                            )}
                        </div>
                    </div>

                    {warnings.length > 0 && (
                        <div className="mb-2 border-l-4 border-red-500 bg-red-50 p-4">
                            <span className="text-sm font-medium text-orange-800">
                                Si el presupuesto se encuentra vigente, te recomendamos editar los registros que ya no estan disponibles marcados en
                                rojo y enviar el presupuesto nuevamente.
                            </span>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="mb-6 flex flex-wrap gap-2">
                        {(warnings.length > 0 || isEditable) && (
                            <Button
                                variant={warnings.length > 0 ? 'destructive' : 'outline'}
                                size="sm"
                                onClick={() => router.visit(route('dashboard.picking.budgets.edit', budget.id))}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        )}

                        <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar PDF
                        </Button>

                        {canSendEmail && warnings.length === 0 && (
                            <Button variant="outline" size="sm" onClick={() => setShowSendDialog(true)}>
                                <Mail className="mr-2 h-4 w-4" />
                                Enviar por Email
                            </Button>
                        )}

                        {warnings.length === 0 && (
                            <Button variant="outline" size="sm" onClick={handleDuplicate}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicar
                            </Button>
                        )}

                        {/* Ver público - Solo si está enviado */}
                        {isPubliclyVisible && (
                            <Button
                                onClick={handleViewPublic}
                                variant="outline"
                                size="sm"
                                disabled={!isPubliclyVisible}
                                title={!isPubliclyVisible ? 'El presupuesto debe estar enviado para ser visible públicamente' : ''}
                            >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Ver Público
                            </Button>
                        )}
                    </div>

                    {/* Grid de información */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <Card className={`${budget?.vendor?.deleted_at ? 'border-2 border-red-800' : ''}`}>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                        <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Vendedor</p>
                                        <p className={`font-semibold ${budget?.vendor?.deleted_at ? 'text-red-800' : ''}`}>
                                            {budget?.vendor?.deleted_at ? budget.vendor.name + ' - No disponible' : budget.vendor.name}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className={`${budget?.client?.deleted_at ? 'border-2 border-red-800' : ''}`}>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                        <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Cliente</p>
                                        <p className={`font-semibold ${budget?.client?.deleted_at ? 'text-red-800' : ''}`}>
                                            {budget?.client?.deleted_at ? budget.client.name + ' - No disponible' : budget.client.name}
                                        </p>
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

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                        <Package className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Tipo de Armado</p>
                                        {budget.services &&
                                            budget.services.length > 0 &&
                                            (() => {
                                                const assemblyService = budget.services.find((s) => s.service_type === 'assembly');
                                                if (assemblyService) {
                                                    return <p className="font-semibold">{assemblyService.service_description}</p>;
                                                }
                                                return <p className="text-sm text-gray-500">No especificado</p>;
                                            })()}
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
                        warnings={warnings}
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

            <AlertDialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Cambiar estado del presupuesto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás por cambiar el estado de <strong>{getStatusLabel(budget.status)}</strong> a{' '}
                            <strong>{getStatusLabel(pendingStatus)}</strong>.
                            {pendingStatus === 'sent' && (
                                <span className="mt-2 block text-blue-600">Esto hará el presupuesto visible para el cliente.</span>
                            )}
                            {pendingStatus === 'expired' && (
                                <span className="mt-2 block text-orange-600">El cliente ya no podrá ver el presupuesto.</span>
                            )}
                            {pendingStatus === 'approved' && (
                                <span className="mt-2 block text-green-600">Esto marcará el presupuesto como aprobado manualmente.</span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUpdatingStatus}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmStatusChange} disabled={isUpdatingStatus}>
                            {isUpdatingStatus ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Actualizando...
                                </>
                            ) : (
                                'Confirmar cambio'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
