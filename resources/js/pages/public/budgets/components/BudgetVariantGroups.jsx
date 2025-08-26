// resources/js/pages/public/components/BudgetVariantGroups.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/budget/budgetUtils';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente para mostrar grupos de variantes del presupuesto
 * @param {Object} variantGroups - Grupos de variantes organizados
 * @param {Object} selectedVariants - Variantes seleccionadas
 * @param {Function} handleVariantSelection - Función para seleccionar variante
 * @param {Object} imageGalleries - Galerías de imágenes
 * @param {Object} currentImageIndexes - Índices actuales de imágenes
 * @param {Function} nextImage - Función para avanzar imagen
 * @param {Function} prevImage - Función para retroceder imagen
 * @returns {JSX.Element|null} - Componente de grupos de variantes
 */
export default function BudgetVariantGroups({
    variantGroups,
    selectedVariants,
    handleVariantSelection,
    imageGalleries,
    currentImageIndexes,
    nextImage,
    prevImage,
}) {
    // No renderizar si no hay grupos de variantes
    if (!variantGroups || Object.keys(variantGroups).length === 0) {
        return null;
    }

    return (
        <>
            {Object.entries(variantGroups).map(([group, items]) => (
                <Card key={group} className="mb-6">
                    <CardHeader>
                        <CardTitle>Opciones para {group}</CardTitle>
                        <p className="text-sm text-gray-600">Selecciona una opción para continuar</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {items.map((item) => {
                                const imageKey = `variant-${group}-${item.id}`;
                                const images = imageGalleries[imageKey] || [];
                                const currentIndex = currentImageIndexes[imageKey] || 0;
                                const isSelected = selectedVariants[group] === item.id;

                                return (
                                    <div
                                        key={item.id}
                                        className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                                            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                        onClick={() => handleVariantSelection(group, item.id)}
                                    >
                                        <div className="flex gap-4">
                                            {/* Imagen del producto */}
                                            <div className="relative h-24 w-24 flex-shrink-0">
                                                {images.length > 0 ? (
                                                    <>
                                                        <img
                                                            src={images[currentIndex].full_url}
                                                            alt={item.product.name}
                                                            className="h-full w-full rounded-md object-cover"
                                                        />
                                                        {images.length > 1 && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        prevImage(imageKey);
                                                                    }}
                                                                    className="absolute top-1/2 left-0 -translate-y-1/2 rounded-r bg-black/50 p-1 text-white hover:bg-black/70"
                                                                >
                                                                    <ChevronLeft className="h-3 w-3" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        nextImage(imageKey);
                                                                    }}
                                                                    className="absolute top-1/2 right-0 -translate-y-1/2 rounded-l bg-black/50 p-1 text-white hover:bg-black/70"
                                                                >
                                                                    <ChevronRight className="h-3 w-3" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-200 text-gray-500">
                                                        Sin imagen
                                                    </div>
                                                )}
                                            </div>

                                            {/* Información del producto */}
                                            <div className="flex flex-1 justify-between">
                                                <div>
                                                    <div className="mt-2 text-sm">
                                                        <p>Cantidad: {item.quantity}</p>
                                                        <p>Precio unitario: {formatCurrency(item.unit_price)}</p>
                                                        {item.production_time_days && <p>Tiempo de producción: {item.production_time_days} días</p>}
                                                        {item.logo_printing && <p>Impresión: {item.logo_printing}</p>}
                                                    </div>
                                                </div>

                                                {/* Precio y selector */}
                                                <div className="flex items-center gap-3">
                                                    {/* Indicador de selección */}
                                                    <div
                                                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                                                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                                        }`}
                                                    >
                                                        {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
                                                    </div>

                                                    {/* Precio total */}
                                                    <p className="text-lg font-bold">{formatCurrency(item.line_total)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </>
    );
}
