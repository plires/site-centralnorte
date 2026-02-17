// resources/js/pages/dashboard/budgets/Show.jsx

import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import ContextualInformationOfTheState from '@/components/budgets/ContextualInformationOfTheState';
import StatusBudget from '@/components/budgets/StatusBudget';
import { budgetStatusOptions, canSendStatus, isEditableStatus, isPubliclyVisibleStatus } from '@/components/BudgetStatusBadge';
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
import BudgetActionButtons from '@/components/budgets/BudgetActionButtons';
import { Button } from '@/components/ui/button';
import BudgetCommentsDisplay from './components/BudgetCommentsDisplay';
import BudgetInfoSection from './components/BudgetInfoSection';
import BudgetTotalsSection from './components/BudgetTotalsSection';
import UnifiedBudgetItemsSection from './components/UnifiedBudgetItemsSection';

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

export default function Show({ budget, warnings, regularItems, variantGroups, hasVariants, businessConfig }) {
    const [selectedVariants, setSelectedVariants] = useState({});
    const [calculatedTotals, setCalculatedTotals] = useState({
        subtotal: parseFloat(budget.subtotal),
        paymentConditionAmount: 0,
        subtotalWithPayment: 0,
        iva: 0,
        total: parseFloat(budget.total),
    });

    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
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

    // Obtener configuración de IVA
    const ivaRate = businessConfig?.iva_rate ?? 0.21;
    const applyIva = businessConfig?.apply_iva ?? true;

    const { props } = usePage();

    // Interceptar flash messages
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

    // Inicializar variantes seleccionadas basado en is_selected de la base de datos
    useEffect(() => {
        if (Object.keys(variantGroups).length > 0) {
            const initialVariants = {};
            let hasChanges = false;

            Object.keys(variantGroups).forEach((group) => {
                const groupItems = variantGroups[group];
                const selectedItem = groupItems.find((item) => item.is_selected === true);
                if (selectedItem) {
                    initialVariants[group] = selectedItem.id;
                } else {
                    initialVariants[group] = groupItems[0]?.id;
                }

                if (initialVariants[group] !== selectedVariants[group]) {
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                setSelectedVariants(initialVariants);
            }
        }
    }, [Object.keys(variantGroups).join(',')]);

    // Recalcular totales
    useEffect(() => {
        let newSubtotal = 0;

        regularItems.forEach((item) => {
            newSubtotal += parseFloat(item.line_total);
        });

        Object.keys(variantGroups).forEach((group) => {
            const selectedItemId = selectedVariants[group];
            const selectedItem = variantGroups[group].find((item) => item.id === selectedItemId);
            if (selectedItem) {
                newSubtotal += parseFloat(selectedItem.line_total);
            }
        });

        let paymentConditionAmount = 0;
        if (budget.payment_condition_percentage) {
            paymentConditionAmount = newSubtotal * (parseFloat(budget.payment_condition_percentage) / 100);
        }

        const subtotalWithPayment = newSubtotal + paymentConditionAmount;
        const ivaAmount = applyIva ? subtotalWithPayment * ivaRate : 0;
        const totalWithIva = subtotalWithPayment + ivaAmount;

        setCalculatedTotals({
            subtotal: newSubtotal,
            paymentConditionAmount,
            subtotalWithPayment,
            iva: ivaAmount,
            total: totalWithIva,
        });
    }, [selectedVariants, regularItems, Object.keys(variantGroups).join(','), ivaRate, applyIva, budget.payment_condition_percentage]);

    const handleVariantChange = (group, itemId) => {
        setSelectedVariants((prev) => ({
            ...prev,
            [group]: itemId,
        }));
    };

    const paymentConditionInfo = budget.payment_condition_description
        ? {
              description: budget.payment_condition_description,
              percentage: budget.payment_condition_percentage,
          }
        : null;

    // Handlers de acciones
    const handleEdit = () => {
        router.visit(route('dashboard.budgets.edit', budget.id));
    };

    const handleDuplicate = () => {
        router.visit(route('dashboard.budgets.duplicate', budget.id));
    };

    const handleSendEmailConfirm = () => {
        setIsEmailDialogOpen(false);
        router.post(route('dashboard.budgets.send-email', budget.id), {}, { preserveScroll: true });
    };

    const handleDownload = () => {
        window.location.href = route('dashboard.budgets.pdf', budget.id);
    };

    const handleViewPublic = () => {
        const publicUrl = route('public.budget.show', budget.token);
        window.open(publicUrl, '_blank');
    };

    const handleStatusChange = (newStatus) => {
        if (newStatus === budget.status) return;
        setPendingStatus(newStatus);
        setShowStatusConfirm(true);
    };

    const confirmStatusChange = () => {
        setIsUpdatingStatus(true);
        setShowStatusConfirm(false);

        router.patch(
            route('dashboard.budgets.update-status', budget.id),
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Presupuesto - ${budget.title}`} />

            <div className="p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header con título y número */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="border-l-4 pl-4" style={{ borderColor: '#3B5093' }}>
                            <h1 className="mb-3 text-2xl font-bold text-gray-900">{budget.title}</h1>
                            <h2 className="text-1xl font-bold text-gray-600">Presupuesto {budget.budget_merch_number}</h2>
                            <p className="text-sm text-gray-600">Detalles del presupuesto de merchandising</p>
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

                    {/* Control de estado */}
                    <div className="space-y-4">
                        {/* Estado */}
                        <StatusBudget budget={budget} handleStatusChange={handleStatusChange} isUpdatingStatus={isUpdatingStatus} />

                        {/* Información contextual del estado */}
                        <ContextualInformationOfTheState budget={budget} />
                    </div>

                    {/* Warning inline de registros eliminados */}
                    {warnings.length > 0 && (
                        <div className="mb-2 border-l-4 border-red-500 bg-red-50 p-4">
                            <span className="text-sm font-medium text-orange-800">
                                Si el presupuesto se encuentra vigente, te recomendamos editar los registros que ya no están disponibles marcados en
                                rojo y enviar el presupuesto nuevamente.
                            </span>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <BudgetActionButtons
                        isEditable={isEditable}
                        canSendEmail={canSendEmail}
                        isPubliclyVisible={isPubliclyVisible}
                        hasWarnings={warnings.length > 0}
                        emailSent={budget.email_sent}
                        onEdit={handleEdit}
                        onDownload={handleDownload}
                        onSendEmail={() => setIsEmailDialogOpen(true)}
                        onDuplicate={handleDuplicate}
                        onViewPublic={handleViewPublic}
                    />

                    {/* Grid de info cards */}
                    <BudgetInfoSection budget={budget} />

                    {/* Items del presupuesto */}
                    <div className="mb-6">
                        <UnifiedBudgetItemsSection
                            regularItems={regularItems}
                            variantGroups={variantGroups}
                            selectedVariants={selectedVariants}
                            onVariantChange={handleVariantChange}
                            showActions={false}
                        />
                    </div>

                    {/* Comentarios */}
                    <BudgetCommentsDisplay budget={budget} />

                    {/* Totales */}
                    <BudgetTotalsSection
                        totals={calculatedTotals}
                        ivaRate={ivaRate}
                        showIva={applyIva}
                        warnings={warnings}
                        paymentCondition={paymentConditionInfo}
                    />
                </div>
            </div>

            {/* Dialog de envío de email */}
            <AlertDialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{budget.email_sent ? 'Reenviar presupuesto' : 'Enviar presupuesto'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {budget.email_sent ? (
                                <>
                                    Este presupuesto ya fue enviado previamente el{' '}
                                    <strong>
                                        {new Date(budget.email_sent_at).toLocaleString('es-AR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </strong>
                                    . ¿Deseas reenviar a <strong>{budget.client?.email}</strong>?
                                </>
                            ) : (
                                <>
                                    ¿Estás seguro de que quieres enviar el email del presupuesto a <strong>{budget.client?.email}</strong>?
                                    <br />
                                    <br />
                                    El cliente recibirá un link para visualizar el presupuesto online.
                                    {budget.status !== 'sent' && (
                                        <span className="mt-2 block text-blue-600">El estado del presupuesto cambiará a "Enviado".</span>
                                    )}
                                </>
                            )}
                            {!budget.client?.email && (
                                <div className="mt-3 flex items-center gap-2 text-amber-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    El cliente no tiene email configurado.
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSendEmailConfirm} disabled={!budget.client?.email}>
                            {budget.email_sent ? 'Reenviar' : 'Enviar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog de confirmación de cambio de estado */}
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
