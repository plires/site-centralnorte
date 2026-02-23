// resources/js/pages/public/components/BudgetRegularItems.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/budget/budgetUtils';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { useState } from 'react';
import ImageGalleryModal from './ImageGalleryModal';

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
    // Estado para controlar el modal
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImageKey, setSelectedImageKey] = useState(null);

    // No renderizar si no hay items regulares
    if (!items || items.length === 0) {
        return null;
    }

    // Función para abrir el modal con una galería específica
    const openModal = (imageKey) => {
        setSelectedImageKey(imageKey);
        setModalOpen(true);
    };

    // Obtener datos del modal actual
    const modalImages = selectedImageKey ? imageGalleries[selectedImageKey] || [] : [];
    const modalCurrentIndex = selectedImageKey ? currentImageIndexes[selectedImageKey] || 0 : 0;
    const modalProductName = selectedImageKey ? (items.find((item) => `regular-${item.id}` === selectedImageKey)?.product?.name ?? 'Producto eliminado') : '';

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Productos
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {items.map((item) => {
                        const imageKey = `regular-${item.id}`;
                        const images = imageGalleries[imageKey] || [];
                        const currentIndex = currentImageIndexes[imageKey] || 0;

                        return (
                            <div key={item.id} className={`rounded-lg border p-4 ${!item.product ? 'border-red-200 bg-red-50' : ''}`}>
                                {/* Aviso si el producto fue eliminado */}
                                {!item.product && (
                                    <div className="mb-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-100 px-3 py-2 text-sm text-red-700">
                                        <span className="mt-0.5 flex-shrink-0">⚠️</span>
                                        <span>
                                            <strong>Producto no disponible.</strong> Este artículo ya no se encuentra en nuestro catálogo. Contactanos para más información.
                                        </span>
                                    </div>
                                )}
                                {/* Layout responsivo: flex-col en móvil, flex-row en desktop */}
                                <div className="flex flex-col items-center gap-4 sm:flex-row">
                                    {/* Imagen del producto */}
                                    <div className="relative mx-auto h-32 w-32 flex-shrink-0 sm:mx-0 sm:h-24 sm:w-24">
                                        {images.length > 0 ? (
                                            <>
                                                <div onClick={() => openModal(imageKey)} className="group relative h-full w-full cursor-pointer">
                                                    <img
                                                        src={images[currentIndex].full_url}
                                                        alt={item.product?.name ?? 'Producto eliminado'}
                                                        className="h-full w-full rounded-md object-cover transition-opacity group-hover:opacity-75"
                                                    />
                                                    {/* Overlay de zoom al hacer hover */}
                                                    <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/0 transition-all group-hover:bg-black/20">
                                                        <svg
                                                            className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>
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
                                            <div className="mb-2 border-b-1">
                                                <h3 className={`mb-1 font-semibold ${item.product ? 'text-gray-900' : 'text-red-500 italic'}`}>
                                                    {item.product?.name ?? 'Producto eliminado'}
                                                </h3>
                                                {item.product?.description && (
                                                    <p className="mb-2 text-sm text-gray-700">Descripción: {item.product.description}</p>
                                                )}
                                            </div>
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

            {/* Modal de galería de imágenes */}
            <ImageGalleryModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                images={modalImages}
                currentIndex={modalCurrentIndex}
                onNext={() => selectedImageKey && nextImage(selectedImageKey)}
                onPrev={() => selectedImageKey && prevImage(selectedImageKey)}
                productName={modalProductName}
            />
        </Card>
    );
}
