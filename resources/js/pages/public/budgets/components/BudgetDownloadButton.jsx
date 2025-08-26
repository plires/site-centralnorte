// resources/js/pages/public/components/BudgetDownloadButton.jsx

import { Button } from '@/components/ui/button';
import { areAllVariantsSelected, generatePdfUrl } from '@/utils/budget/budgetUtils';
import { Download } from 'lucide-react';

/**
 * Botón para descargar el PDF del presupuesto
 * @param {Object} budget - Objeto del presupuesto
 * @param {Object} selectedVariants - Variantes seleccionadas
 * @returns {JSX.Element} - Componente botón de descarga
 */
export default function BudgetDownloadButton({ budget, selectedVariants }) {
    const allVariantsSelected = areAllVariantsSelected(budget.variant_groups || [], selectedVariants);

    const handleDownload = () => {
        const pdfUrl = generatePdfUrl(budget.token, selectedVariants);
        window.location.href = pdfUrl;
    };

    return (
        <div className="text-center">
            <Button onClick={handleDownload} disabled={!allVariantsSelected} className="inline-flex items-center gap-2">
                <Download className="h-4 w-4" />
                Descargar PDF
            </Button>
        </div>
    );
}
