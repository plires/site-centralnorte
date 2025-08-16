import PageHeader from '@/components/PageHeader';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

// Componentes reutilizados y adaptados
import BudgetCommentsDisplay from './components/BudgetCommentsDisplay';
import BudgetHeaderWithStatus from './components/BudgetHeaderWithStatus';
import BudgetInfoSection from './components/BudgetInfoSection';
import BudgetItemsDisplaySection from './components/BudgetItemsDisplaySection';
import BudgetTotalsSection from './components/BudgetTotalsSection';

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

export default function Show({ budget, regularItems, variantGroups, hasVariants, ivaRate }) {
    const [selectedVariants, setSelectedVariants] = useState({});
    const [calculatedTotals, setCalculatedTotals] = useState({
        subtotal: parseFloat(budget.subtotal),
        iva: 0,
        total: parseFloat(budget.total),
    });

    // Inicializar variantes seleccionadas
    useEffect(() => {
        const initialVariants = {};
        Object.keys(variantGroups).forEach((group) => {
            initialVariants[group] = variantGroups[group][0]?.id;
        });
        setSelectedVariants(initialVariants);
    }, [variantGroups]);

    // Recalcular totales
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Presupuesto - ${budget.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <PageHeader backRoute={route('dashboard.budgets.index')} backText="Volver" />

                        <div className="space-y-6 p-6">
                            <BudgetHeaderWithStatus budget={budget} />

                            <BudgetInfoSection budget={budget} />

                            <BudgetItemsDisplaySection
                                regularItems={regularItems}
                                variantGroups={variantGroups}
                                selectedVariants={selectedVariants}
                                onVariantChange={handleVariantChange}
                            />

                            <BudgetCommentsDisplay budget={budget} />

                            <BudgetTotalsSection totals={calculatedTotals} ivaRate={ivaRate} />

                            <BudgetActionsSection budget={budget} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
