// resources/js/pages/public/budgets/Budget.jsx

import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';

import BudgetNotFound from '@/pages/public/components/BudgetNotFound';
import BudgetHeader from '@/pages/public/components/BudgetHeader';
import BudgetStatusAlert from '@/pages/public/components/BudgetStatusAlert';
import ClientBudgetActions from '@/pages/public/components/ClientBudgetActions';
import Header from '@/pages/public/components/Header';

// Hooks personalizados
import { useBudgetCalculations } from '@/hooks/public/useBudgetCalculations';
import { useBudgetImageGallery } from '@/hooks/public/useBudgetImageGallery';
import { useBudgetVariants } from '@/hooks/public/useBudgetVariants';

// Componentes UI especializados
import BudgetComments from './components/BudgetComments';
import BudgetDownloadButton from './components/BudgetDownloadButton';
import BudgetInfoCard from './components/BudgetInfoCard';
import BudgetRegularItems from './components/BudgetRegularItems';
import BudgetTotalsCard from './components/BudgetTotalsCard';
import BudgetVariantGroups from './components/BudgetVariantGroups';

/**
 * Vista pública del presupuesto - Con sistema de estados unificado
 * @param {Object} budget - Objeto del presupuesto
 * @param {Object} businessConfig - Configuración de negocio
 * @returns {JSX.Element} - Componente de vista del presupuesto
 */
export default function Budget({ budget, businessConfig }) {
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

    // Hooks personalizados para manejo de estado
    const { selectedVariants, handleVariantSelection } = useBudgetVariants(budget);
    const { calculatedTotals, ivaRate, applyIva } = useBudgetCalculations(budget, selectedVariants, businessConfig);
    const { imageGalleries, currentImageIndexes, nextImage, prevImage } = useBudgetImageGallery(budget);

    // Obtener nombre de la empresa desde .env
    const appName = import.meta.env.VITE_APP_NAME || 'Central Norte';

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster richColors position="top-right" />
            <Head title={`Presupuesto - ${budget.title}`} />

            {/* Header de la empresa */}
            <Header appName={appName} title="Presupuesto de Merchandising" backgroundColor={import.meta.env.VITE_PRIMARY_COLOR} />

            {/* Header del presupuesto */}
            <BudgetHeader budget={budget} />

            <div className="mx-auto max-w-4xl px-4 py-8">
                {/* Estado del presupuesto */}
                <BudgetStatusAlert budget={budget} />

                {/* Información básica */}
                <BudgetInfoCard budget={budget} />

                {/* Items regulares */}
                <BudgetRegularItems
                    items={budget.grouped_items?.regular}
                    imageGalleries={imageGalleries}
                    currentImageIndexes={currentImageIndexes}
                    nextImage={nextImage}
                    prevImage={prevImage}
                />

                {/* Grupos de variantes */}
                <BudgetVariantGroups
                    variantGroups={budget.grouped_items?.variants}
                    selectedVariants={selectedVariants}
                    handleVariantSelection={handleVariantSelection}
                    imageGalleries={imageGalleries}
                    currentImageIndexes={currentImageIndexes}
                    nextImage={nextImage}
                    prevImage={prevImage}
                />

                {/* Totales */}
                <BudgetTotalsCard budget={budget} calculatedTotals={calculatedTotals} ivaRate={ivaRate} applyIva={applyIva} />

                {/* Comentarios del pie */}
                <BudgetComments budget={budget} />

                {/* Acciones del cliente (aprobar/rechazar) - Solo si está en estado 'sent' */}
                {budget.allows_client_action && (
                    <div className="mt-8 mb-8">
                        <ClientBudgetActions 
                            token={budget.token} 
                            approveRoute="public.budget.approve" 
                            inReviewRoute="public.budget.in_review" 
                            currentStatus={budget.status} 
                        />
                    </div>
                )}

                {selectedVariants && Object.keys(selectedVariants).length > 0 && budget.allows_client_action && (
                    <>
                        {/* Botón de descarga */}
                        <BudgetDownloadButton budget={budget} selectedVariants={selectedVariants} />
                    </>
                )}
            </div>
        </div>
    );
}
