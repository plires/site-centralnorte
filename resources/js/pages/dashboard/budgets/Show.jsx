// resources/js/pages/dashboard/budgets/Show.jsx

import PageHeader from '@/components/PageHeader';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Componentes reutilizados y adaptados
import GlobalWarningsBanner from '@/components/GlobalWarningsBanner';
import BudgetCommentsDisplay from './components/BudgetCommentsDisplay';
import BudgetHeaderWithStatus from './components/BudgetHeaderWithStatus';
import BudgetInfoSection from './components/BudgetInfoSection';
import BudgetTotalsSection from './components/BudgetTotalsSection';
import UnifiedBudgetItemsSection from './components/UnifiedBudgetItemsSection';

// Componente específico para acciones
import BudgetActionsSection from './components/BudgetActionsSection';

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

    // Obtener configuración de IVA
    const ivaRate = businessConfig?.iva_rate ?? 0.21;
    const applyIva = businessConfig?.apply_iva ?? true;

    const { props } = usePage();

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

    // Inicializar variantes seleccionadas basado en is_selected de la base de datos
    useEffect(() => {
        if (Object.keys(variantGroups).length > 0) {
            const initialVariants = {};
            let hasChanges = false;

            Object.keys(variantGroups).forEach((group) => {
                const groupItems = variantGroups[group];
                // Buscar el item que tiene is_selected = true
                const selectedItem = groupItems.find((item) => item.is_selected === true);
                if (selectedItem) {
                    initialVariants[group] = selectedItem.id;
                } else {
                    // Fallback: si ninguno está marcado, seleccionar el primero
                    initialVariants[group] = groupItems[0]?.id;
                }

                // Verificar si hay cambios
                if (initialVariants[group] !== selectedVariants[group]) {
                    hasChanges = true;
                }
            });

            // Solo actualizar si hay cambios reales
            if (hasChanges) {
                console.log('Show: Actualizando variantes seleccionadas:', initialVariants);
                setSelectedVariants(initialVariants);
            }
        }
    }, [Object.keys(variantGroups).join(',')]); // Depender solo de las keys, no del objeto completo

    // Recalcular totales incluyendo condición de pago
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

        // Calcular ajuste por condición de pago
        let paymentConditionAmount = 0;
        if (budget.payment_condition_percentage) {
            paymentConditionAmount = newSubtotal * (parseFloat(budget.payment_condition_percentage) / 100);
        }

        // Subtotal con ajuste
        const subtotalWithPayment = newSubtotal + paymentConditionAmount;

        // Calcular IVA sobre subtotal con ajuste
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

    // Construir objeto de condición de pago para BudgetTotalsSection
    const paymentConditionInfo = budget.payment_condition_description
        ? {
              description: budget.payment_condition_description,
              percentage: budget.payment_condition_percentage,
          }
        : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Presupuesto - ${budget.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {/* Banner de Advertencias Globales */}
                        {warnings.length > 0 && (
                            <GlobalWarningsBanner
                                warnings={warnings}
                                title="Atención: Existen registros históricos eliminados."
                                subtitle="Te recomendamos editar los registros que ya no estan disponibles marcados en rojo y enviar el presupuesto
                            nuevamente."
                            />
                        )}
                        <PageHeader backRoute={route('dashboard.budgets.index')} backText="Volver" />

                        <div className="space-y-6 p-6">
                            <BudgetHeaderWithStatus budget={budget} />

                            <BudgetInfoSection budget={budget} />

                            <UnifiedBudgetItemsSection
                                regularItems={regularItems}
                                variantGroups={variantGroups}
                                selectedVariants={selectedVariants}
                                onVariantChange={handleVariantChange}
                                showActions={false}
                            />

                            <BudgetCommentsDisplay budget={budget} />

                            {/* Totales con información de condición de pago integrada */}
                            <BudgetTotalsSection
                                totals={calculatedTotals}
                                ivaRate={ivaRate}
                                showIva={applyIva}
                                warnings={warnings}
                                paymentCondition={paymentConditionInfo}
                            />

                            <BudgetActionsSection budget={budget} warnings={warnings} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
