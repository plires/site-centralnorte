// resources/js/pages/public/picking/PickingBudget.jsx

import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';

import BudgetNotFound from '@/pages/public/components/BudgetNotFound';
import BudgetHeader from '@/pages/public/components/BudgetHeader';
import BudgetStatusAlert from '@/pages/public/components/BudgetStatusAlert';
import BudgetUnavailableActionsBlock from '@/pages/public/components/BudgetUnavailableActionsBlock';
import ClientBudgetActions from '@/pages/public/components/ClientBudgetActions';
import Header from '@/pages/public/components/Header';

// Componentes UI especializados
import PickingBudgetBoxesCard from './components/PickingBudgetBoxesCard';
import PickingBudgetComments from './components/PickingBudgetComments';
import PickingBudgetInfoCard from './components/PickingBudgetInfoCard';
import PickingBudgetServicesCard from './components/PickingBudgetServicesCard';
import PickingBudgetTotalsCard from './components/PickingBudgetTotalsCard';

/**
 * Vista pública del presupuesto de picking
 * @param {Object} budget - Objeto del presupuesto de picking
 * @param {Object} businessConfig - Configuración de negocio (IVA, etc)
 * @returns {JSX.Element} - Componente de vista del presupuesto
 */
export default function PickingBudget({ budget, businessConfig }) {
    const { props } = usePage();

    // Mostrar flash messages
    useEffect(() => {
        const flashSuccess = props.flash?.success;
        const flashError = props.flash?.error;

        if (flashSuccess) {
            toast.success(flashSuccess);
        } else if (flashError) {
            toast.error(flashError);
        }
    }, [props.flash]);

    const allowsAction = budget.allows_client_action === true || budget.allows_client_action === 1;
    const isSent = budget.status === 'sent';

    // Detectar entidades críticas faltantes
    const criticalIssueReasons = [];
    if (!budget.client) {
        criticalIssueReasons.push('Los datos del cliente ya no están disponibles en el sistema.');
    }
    if (budget.payment_condition_deleted) {
        criticalIssueReasons.push('La condición de pago aplicada ya no se encuentra disponible en el sistema.');
    }
    const hasCriticalIssues = criticalIssueReasons.length > 0;

    // Verificación de seguridad - El presupuesto debe estar visible públicamente
    const isPubliclyVisible = budget.is_publicly_visible === true || budget.is_publicly_visible === 1;

    if (!isPubliclyVisible) {
        let message = 'Este presupuesto no está disponible para visualización.';
        let reason = 'not_visible';

        switch (budget.status) {
            case 'unsent':
            case 'draft':
                message = 'Este presupuesto aún no ha sido enviado.';
                reason = 'not_sent';
                break;
            case 'expired':
                message = 'Este presupuesto ha vencido y ya no está disponible.';
                reason = 'expired';
                break;
        }

        return <BudgetNotFound message={message} reason={reason} />;
    }

    const ivaRate = businessConfig?.iva_rate || 0.21;
    const applyIva = businessConfig?.apply_iva ?? true;

    const appName = import.meta.env.VITE_APP_NAME || 'Central Norte';

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster richColors position="top-right" />
            <Head title={`Presupuesto de Picking #${budget.budget_number}`} />

            {/* Header visual con logo */}
            <Header appName={appName} title="Presupuesto de Picking/Armado de Kit" backgroundColor={import.meta.env.VITE_PRIMARY_COLOR} />

            {/* Header del presupuesto */}
            <BudgetHeader budget={budget} />

            <div className="mx-auto max-w-4xl px-4 py-8">
                {/* Estado del presupuesto */}
                <BudgetStatusAlert budget={budget} />

                {/* Información básica */}
                <PickingBudgetInfoCard budget={budget} />

                {/* Servicios */}
                <PickingBudgetServicesCard services={budget.services} />

                {/* Cajas */}
                <PickingBudgetBoxesCard boxes={budget.boxes} />

                {/* Totales */}
                <PickingBudgetTotalsCard budget={budget} ivaRate={ivaRate} applyIva={applyIva} businessConfig={businessConfig} />

                {/* Comentarios/Notas */}
                <PickingBudgetComments budget={budget} />

                {/* Acciones del cliente o bloque de contacto si hay entidades críticas faltantes */}
                {(allowsAction || isSent) && (
                    hasCriticalIssues ? (
                        <BudgetUnavailableActionsBlock
                            vendor={budget.vendor}
                            businessConfig={businessConfig}
                            reasons={criticalIssueReasons}
                        />
                    ) : (
                        <div className="mt-8 mb-8">
                            <ClientBudgetActions
                                token={budget.token}
                                approveRoute="public.picking.budget.approve"
                                inReviewRoute="public.picking.budget.in_review"
                                currentStatus={budget.status}
                            />
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
