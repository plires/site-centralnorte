// resources/js/pages/public/components/BudgetRegularItems.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/budget/budgetUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente para mostrar items regulares del presupuesto - Versión Responsiva
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
                            <div key={item.id} className="rounded-lg border p-4">
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
                                                <span className="text-center text-xs">Sin imagen</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Información del producto - Layout responsivo */}
                                    <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:justify-between">
                                        {/* Detalles del producto */}
                                        <div className="flex-1">
                                            <h3 className="mb-2 font-semibold text-gray-900">{item.product.name}</h3>
                                            <div className="grid grid-cols-1 gap-1 text-sm text-gray-600">
                                                <p>
                                                    <span className="font-medium">Cantidad:</span> {item.quantity}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Precio unitario:</span> {formatCurrency(item.unit_price)}
                                                </p>
                                                {item.production_time_days && (
                                                    <p>
                                                        <span className="font-medium">Tiempo de producción:</span> {item.production_time_days} días
                                                    </p>
                                                )}
                                                {item.logo_printing && (
                                                    <p>
                                                        <span className="font-medium">Impresión:</span> {item.logo_printing}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Precio total - Centrado en móvil, derecha en desktop */}
                                        <div className="text-center sm:self-center sm:text-right">
                                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                                <p className="text-sm font-medium text-gray-500">Total Línea</p>
                                                <p className="text-lg font-bold text-gray-500 sm:text-xl">{formatCurrency(item.line_total)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
