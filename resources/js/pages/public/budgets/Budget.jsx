// resources/js/pages/public/budgets/Budget.jsx

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
 * Vista pública del presupuesto - Refactorizada con header de empresa
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

    // Obtener nombre de la empresa desde .env
    const appName = import.meta.env.VITE_APP_NAME || 'Central Norte';

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={`Presupuesto - ${budget.title}`} />

            {/* Header de la empresa */}
            <div className="border-b-2 bg-white shadow-sm">
                <div className="mx-auto max-w-4xl px-4 py-6">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                        {/* Logo y nombre de la empresa */}
                        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
                            {/* Placeholder para logo - puedes reemplazar con la ruta real del logo */}
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 sm:h-12 sm:w-12">
                                <svg className="h-8 w-8 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="text-center sm:text-left">
                                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{appName}</h1>
                                <p className="text-sm text-gray-600">Presupuesto Empresarial</p>
                            </div>
                        </div>

                        {/* Información adicional */}
                        <div className="text-center sm:text-right">
                            <p className="text-sm text-gray-600">Fecha: {new Date().toLocaleDateString('es-AR')}</p>
                            <p className="text-xs text-gray-500">Documento generado automáticamente</p>
                        </div>
                    </div>
                </div>
            </div>

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

                {/* Botón de descarga */}
                <BudgetDownloadButton budget={budget} selectedVariants={selectedVariants} />
            </div>
        </div>
    );
}
