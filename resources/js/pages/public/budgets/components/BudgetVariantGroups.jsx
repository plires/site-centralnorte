// resources/js/pages/public/budgets/components/BudgetVariantGroups.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/budget/budgetUtils';
import { ChartBarStacked, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import ImageGalleryModal from './ImageGalleryModal';

/**
 * Componente para mostrar grupos de variantes del presupuesto - Imagen única por producto
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
    // Estado para controlar el modal
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImageKey, setSelectedImageKey] = useState(null);

    // No renderizar si no hay grupos de variantes
    if (!variantGroups || Object.keys(variantGroups).length === 0) {
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

    // Encontrar el nombre del producto para el modal
    let modalProductName = '';
    if (selectedImageKey && variantGroups) {
        for (const [group, items] of Object.entries(variantGroups)) {
            const item = items.find((item) => `variant-${group}-${item.id}` === selectedImageKey);
            if (item) {
                modalProductName = item.product.name;
                break;
            }
        }
    }

    return (
        <>
            {Object.entries(variantGroups).map(([group, items]) => {
                // Usar la primera variante para obtener información del producto e imágenes
                const firstItem = items[0];
                const productImageKey = `variant-${group}-${firstItem.id}`;
                const images = imageGalleries[productImageKey] || [];
                const currentIndex = currentImageIndexes[productImageKey] || 0;

                return (
                    <Card key={group} className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ChartBarStacked className="h-5 w-5 text-blue-600" />
                                Opciones para {firstItem.product.name}
                            </CardTitle>
                            {/* Imagen del producto - Una sola vez, mismo layout que productos regulares */}
                            <div className="mb-4 rounded-lg p-4">
                                <div className="flex flex-col items-center gap-4 sm:flex-row">
                                    {/* Imagen del producto - mismo tamaño y ubicación que productos regulares */}
                                    <div className="relative mx-auto h-32 w-32 flex-shrink-0 sm:mx-0 sm:h-24 sm:w-24">
                                        {images.length > 0 ? (
                                            <>
                                                <div
                                                    onClick={() => openModal(productImageKey)}
                                                    className="group relative h-full w-full cursor-pointer"
                                                >
                                                    <img
                                                        src={images[currentIndex].full_url}
                                                        alt={firstItem.product.name}
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
                                                                prevImage(productImageKey);
                                                            }}
                                                            className="absolute top-1/2 left-0 -translate-y-1/2 rounded-r bg-black/50 p-1 text-white hover:bg-black/70"
                                                        >
                                                            <ChevronLeft className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                nextImage(productImageKey);
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

                                    {/* Información básica del producto */}
                                    <div className="flex-1 text-center sm:text-left">
                                        <h3 className="text-lg font-semibold text-gray-900">{firstItem.product.name}</h3>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">Selecciona una opción para continuar</p>
                        </CardHeader>
                        <CardContent>
                            {/* Lista de variantes - Sin imágenes, estética original mantenida */}
                            <div className="space-y-4">
                                {items.map((item) => {
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
                                            {/* Layout responsivo original: flex-col en móvil, flex-row en desktop */}
                                            <div className="flex flex-col items-center gap-4 sm:flex-row">
                                                {/* Sin imagen del producto para variantes */}

                                                {/* Información del producto - Layout responsivo original */}
                                                <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:justify-between">
                                                    {/* Detalles del producto */}
                                                    <div className="flex-1">
                                                        <div className="grid grid-cols-1 gap-1 text-sm text-gray-600">
                                                            <p>
                                                                <span className="font-medium">Cantidad:</span> {item.quantity}
                                                            </p>
                                                            <p>
                                                                <span className="font-medium">Precio unitario:</span>{' '}
                                                                {formatCurrency(item.unit_price)}
                                                            </p>
                                                            {item.production_time_days && (
                                                                <p>
                                                                    <span className="font-medium">Tiempo de producción:</span>{' '}
                                                                    {item.production_time_days} días
                                                                </p>
                                                            )}
                                                            {item.logo_printing && (
                                                                <p>
                                                                    <span className="font-medium">Impresión:</span> {item.logo_printing}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Precio total - Background gris solo cuando está seleccionado */}
                                                    <div className="text-center sm:self-center sm:text-right">
                                                        <div className={`${isSelected ? 'rounded-lg border border-gray-200 bg-gray-50 p-3' : 'p-3'}`}>
                                                            <div className="flex items-center justify-center gap-2 sm:justify-end">
                                                                {/* Radio button - arriba en desktop, centrado en móvil */}
                                                                <div
                                                                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                                                                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                                                                    }`}
                                                                >
                                                                    {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                                                                </div>
                                                            </div>
                                                            <p className="mt-1 text-sm font-medium text-gray-500">Total Línea</p>
                                                            <p className="text-lg font-bold text-gray-500 sm:text-xl">
                                                                {formatCurrency(item.line_total)}
                                                            </p>
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
            })}

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
        </>
    );
}
