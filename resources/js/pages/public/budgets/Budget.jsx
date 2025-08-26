// resources/js/pages/public/Budget.jsx

import { Head } from '@inertiajs/react';
import BudgetNotFound from './BudgetNotFound';

// Hooks personalizados
import { useBudgetCalculations } from '@/hooks/public/useBudgetCalculations';
import { useBudgetImageGallery } from '@/hooks/public/useBudgetImageGallery';
import { useBudgetVariants } from '@/hooks/public/useBudgetVariants';

// Componentes UI especializados
import BudgetComments from './components/BudgetComments';
import BudgetDownloadButton from './components/BudgetDownloadButton';
import BudgetHeader from './components/BudgetHeader';
import BudgetInfoCard from './components/BudgetInfoCard';
import BudgetRegularItems from './components/BudgetRegularItems';
import BudgetStatusAlert from './components/BudgetStatusAlert';
import BudgetTotalsCard from './components/BudgetTotalsCard';
import BudgetVariantGroups from './components/BudgetVariantGroups';

/**
 * Vista pública del presupuesto - Refactorizada
 * @param {Object} budget - Objeto del presupuesto
 * @param {Object} businessConfig - Configuración de negocio
 * @returns {JSX.Element} - Componente de vista del presupuesto
 */
export default function Budget({ budget, businessConfig }) {
    // Verificación de seguridad
    if (!budget.is_active) {
        return (
            <BudgetNotFound message="Este presupuesto ha sido desactivado temporalmente y no está disponible para visualización." reason="inactive" />
        );
    }

    // Hooks personalizados para manejo de estado
    const { selectedVariants, handleVariantSelection } = useBudgetVariants(budget);
    const { calculatedTotals, ivaRate, applyIva } = useBudgetCalculations(budget, selectedVariants, businessConfig);
    const { imageGalleries, currentImageIndexes, nextImage, prevImage } = useBudgetImageGallery(budget);

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={`Presupuesto - ${budget.title}`} />

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
                <BudgetTotalsCard calculatedTotals={calculatedTotals} ivaRate={ivaRate} applyIva={applyIva} />

                {/* Comentarios del pie */}
                <BudgetComments budget={budget} />

                {/* Botón de descarga */}
                <BudgetDownloadButton budget={budget} selectedVariants={selectedVariants} />
            </div>
        </div>
    );
}
