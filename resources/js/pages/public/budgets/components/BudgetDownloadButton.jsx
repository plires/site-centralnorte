// resources/js/pages/public/components/BudgetDownloadButton.jsx

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { areAllVariantsSelected, generatePdfUrl } from '@/utils/budget/budgetUtils';
import { Download, Loader2, MessageSquare } from 'lucide-react';
import { useState } from 'react';

/**
 * Botón para descargar el PDF del presupuesto con estado de carga
 * @param {Object} budget - Objeto del presupuesto
 * @param {Object} selectedVariants - Variantes seleccionadas
 * @returns {JSX.Element} - Componente botón de descarga
 */
export default function BudgetDownloadButton({ budget, selectedVariants }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const allVariantsSelected = areAllVariantsSelected(budget.variant_groups || [], selectedVariants);

    const handleDownload = async () => {
        setIsGenerating(true);

        try {
            const pdfUrl = generatePdfUrl(budget.token, selectedVariants);

            // Crear un enlace temporal para la descarga
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.style.display = 'none';
            document.body.appendChild(link);

            // Simular el tiempo de generación del PDF y manejar la descarga
            await new Promise((resolve) => {
                // Escuchar cuando la ventana recupera el foco (indica que el PDF se descargó o se abrió)
                const handleFocus = () => {
                    window.removeEventListener('focus', handleFocus);
                    // Dar un pequeño delay para asegurar que la descarga comenzó
                    setTimeout(resolve, 1000);
                };

                // Escuchar el evento focus
                window.addEventListener('focus', handleFocus);

                // Iniciar la descarga
                link.click();

                // Fallback: resolver después de 3 segundos si no se detecta el focus
                setTimeout(() => {
                    window.removeEventListener('focus', handleFocus);
                    resolve();
                }, 3000);
            });

            // Limpiar el enlace temporal
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error al generar PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="border-2 border-blue-100 bg-blue-50/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    ¿Preferís descargar tu presupuesto?
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4 text-sm text-gray-600">
                    Tu vendedor te preparo algunos items para este presupuesto, si necesitas cambiarlo o agregarle cantidad descargá tu PDF y
                    envíaselo a tu vendedor. ¡Que con gusto podrá editarlo para vos!
                </p>

                <div className="text-center">
                    <Button
                        onClick={handleDownload}
                        disabled={!allVariantsSelected || isGenerating}
                        className="inline-flex min-w-[140px] items-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generando PDF
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Descargar PDF
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
