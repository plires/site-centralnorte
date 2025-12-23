// resources/js/pages/public/picking/PickingBudget.jsx

import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import PickingBudgetNotFound from './PickingBudgetNotFound';

// Componentes UI especializados
import ClientBudgetActions from '@/pages/public/budgets/components/ClientBudgetActions';
import PickingBudgetBoxesCard from './components/PickingBudgetBoxesCard';
import PickingBudgetComments from './components/PickingBudgetComments';
import PickingBudgetHeader from './components/PickingBudgetHeader';
import PickingBudgetInfoCard from './components/PickingBudgetInfoCard';
import PickingBudgetServicesCard from './components/PickingBudgetServicesCard';
import PickingBudgetStatusAlert from './components/PickingBudgetStatusAlert';
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

    // Verificación de seguridad - El presupuesto debe estar visible públicamente
    // Solo renderizar la vista completa si el estado es 'sent' o si permite acciones del cliente
    const allowsAction = budget.allows_client_action === true || budget.allows_client_action === 1;
    const isSent = budget.status === 'sent';

    if (!allowsAction && !isSent) {
        let message = 'Este presupuesto no está disponible para visualización.';
        let reason = 'not_visible';

        switch (budget.status) {
            case 'unsent':
            case 'draft':
                message = 'Este presupuesto aún no ha sido enviado.';
                reason = 'not_sent';
                break;
            case 'approved':
                message = 'Este presupuesto ya fue aprobado. Gracias por tu confianza.';
                reason = 'approved';
                break;
            case 'rejected':
                message = 'Este presupuesto fue rechazado.';
                reason = 'rejected';
                break;
            case 'expired':
                message = 'Este presupuesto ha vencido y ya no está disponible.';
                reason = 'expired';
                break;
        }

        return <PickingBudgetNotFound message={message} reason={reason} />;
    }

    const ivaRate = businessConfig?.iva_rate || 0.21;
    const applyIva = businessConfig?.apply_iva ?? true;

    const appName = import.meta.env.VITE_APP_NAME || 'Central Norte';

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={`Presupuesto de Picking #${budget.budget_number}`} />

            {/* Header visual con logo */}
            <div className="border-b bg-gradient-to-r from-blue-600 to-blue-700">
                <div className="mx-auto max-w-4xl px-4 py-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        {/* Logo y título */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-white backdrop-blur-sm">
                                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        fillRule="evenodd"
                                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="text-center sm:text-left">
                                <h1 className="text-xl font-bold text-white sm:text-2xl">{appName}</h1>
                                <p className="text-sm text-blue-100">Presupuesto de Picking/Armado de Kit</p>
                            </div>
                        </div>

                        {/* Información adicional */}
                        <div className="text-center sm:text-right">
                            <p className="text-sm text-blue-100">Fecha: {new Date().toLocaleDateString('es-AR')}</p>
                            <p className="text-xs text-blue-200">Documento generado automáticamente</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header del presupuesto */}
            <PickingBudgetHeader budget={budget} />

            <div className="mx-auto max-w-4xl px-4 py-8">
                {/* Estado del presupuesto */}
                <PickingBudgetStatusAlert budget={budget} />

                {/* Información básica */}
                <PickingBudgetInfoCard budget={budget} />

                {/* Servicios */}
                <PickingBudgetServicesCard services={budget.services} />

                {/* Cajas */}
                <PickingBudgetBoxesCard boxes={budget.boxes} />

                {/* Totales */}
                <PickingBudgetTotalsCard budget={budget} ivaRate={ivaRate} applyIva={applyIva} />

                {/* Comentarios/Notas */}
                <PickingBudgetComments budget={budget} />

                {/* Acciones del cliente (aprobar/rechazar) - Solo si está en estado 'sent' */}
                {(allowsAction || isSent) && (
                    <div className="mt-8 mb-8">
                        <ClientBudgetActions
                            token={budget.token}
                            approveRoute="public.picking.budget.approve"
                            rejectRoute="public.picking.budget.reject"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
