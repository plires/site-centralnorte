// resources/js/pages/public/components/BudgetVariantGroups.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/budget/budgetUtils';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente para mostrar grupos de variantes del presupuesto - Versión Responsiva
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
                        <CardTitle className="text-lg sm:text-xl">Opciones para {items[0].product.name}</CardTitle>
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
                                        className={`cursor-pointer rounded-lg border p-4 transition-all duration-200 ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                                                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                        }`}
                                        onClick={() => handleVariantSelection(group, item.id)}
                                    >
                                        {/* Layout responsivo: flex-col en móvil, flex-row en desktop */}
                                        <div className="flex flex-col items-center gap-4 sm:flex-row">
                                            {/* Imagen del producto */}
                                            <div className="relative mx-auto h-32 w-32 flex-shrink-0 sm:mx-0 sm:h-24 sm:w-24">
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
                                                        <span className="text-center text-xs">Sin imagen</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Información del producto - Layout responsivo */}
                                            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:justify-between">
                                                {/* Detalles del producto */}
                                                <div className="flex-1">
                                                    <div className="grid grid-cols-1 gap-1 text-sm text-gray-600">
                                                        <p>
                                                            <span className="font-medium">Cantidad:</span> {item.quantity}
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">Precio unitario:</span> {formatCurrency(item.unit_price)}
                                                        </p>
                                                        {item.production_time_days && (
                                                            <p>
                                                                <span className="font-medium">Tiempo de producción:</span> {item.production_time_days}{' '}
                                                                días
                                                            </p>
                                                        )}
                                                        {item.logo_printing && (
                                                            <p>
                                                                <span className="font-medium">Impresión:</span> {item.logo_printing}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Precio y selector - Layout responsivo */}
                                                <div className="flex flex-col justify-center gap-3 sm:items-end">
                                                    {/* Indicador de selección - Arriba en desktop, centrado en móvil */}
                                                    <div className="flex justify-center sm:justify-end">
                                                        <div
                                                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors sm:h-6 sm:w-6 ${
                                                                isSelected
                                                                    ? 'border-blue-500 bg-blue-500 text-white'
                                                                    : 'border-gray-300 bg-white text-gray-400'
                                                            }`}
                                                        >
                                                            {isSelected && <CheckCircle className="h-5 w-5 sm:h-4 sm:w-4" />}
                                                        </div>
                                                    </div>

                                                    {/* Precio total - Estilo consistente cuando está seleccionado */}
                                                    <div className={`text-center sm:text-right ${isSelected ? 'w-full sm:w-auto' : ''}`}>
                                                        {isSelected ? (
                                                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:min-w-[120px]">
                                                                <p className="text-sm font-medium text-gray-600">Total Línea</p>
                                                                <p className="text-lg font-bold text-gray-900 sm:text-xl">
                                                                    {formatCurrency(item.line_total)}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-lg font-bold text-gray-900 sm:text-xl">
                                                                {formatCurrency(item.line_total)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Indicador visual adicional para móvil */}
                                        {isSelected && (
                                            <div className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 sm:hidden">
                                                <CheckCircle className="h-4 w-4" />
                                                <span>Opción seleccionada</span>
                                            </div>
                                        )}
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
