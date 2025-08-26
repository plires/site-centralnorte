// resources/js/pages/public/components/BudgetRegularItems.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/budget/budgetUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente para mostrar items regulares del presupuesto
 * @param {Array} items - Items regulares del presupuesto
 * @param {Object} imageGalleries - Galerías de imágenes
 * @param {Object} currentImageIndexes - Índices actuales de imágenes
 * @param {Function} nextImage - Función para avanzar imagen
 * @param {Function} prevImage - Función para retroceder imagen
 * @returns {JSX.Element|null} - Componente de items regulares
 */
export default function BudgetRegularItems({ items, imageGalleries, currentImageIndexes, nextImage, prevImage }) {
    // No renderizar si no hay items regulares
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {items.map((item) => {
                        const imageKey = `regular-${item.id}`;
                        const images = imageGalleries[imageKey] || [];
                        const currentIndex = currentImageIndexes[imageKey] || 0;

                        return (
                            <div key={item.id} className="flex gap-4 rounded-lg border p-4">
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
                                                        onClick={() => prevImage(imageKey)}
                                                        className="absolute top-1/2 left-0 -translate-y-1/2 rounded-r bg-black/50 p-1 text-white hover:bg-black/70"
                                                    >
                                                        <ChevronLeft className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => nextImage(imageKey)}
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
                                <div className="flex-1">
                                    <h3 className="font-semibold">{item.product.name}</h3>
                                    <p className="text-sm text-gray-600">Categoría: {item.product.category?.name}</p>
                                    <div className="mt-2 text-sm">
                                        <p>Cantidad: {item.quantity}</p>
                                        <p>Precio unitario: {formatCurrency(item.unit_price)}</p>
                                        {item.production_time_days && <p>Tiempo de producción: {item.production_time_days} días</p>}
                                        {item.logo_printing && <p>Impresión: {item.logo_printing}</p>}
                                    </div>
                                </div>

                                {/* Precio total */}
                                <div className="text-right">
                                    <p className="text-lg font-bold">{formatCurrency(item.line_total)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
