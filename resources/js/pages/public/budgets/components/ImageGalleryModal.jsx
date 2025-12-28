// resources/js/pages/public/budgets/components/ImageGalleryModal.jsx

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Modal para mostrar el carrusel de imágenes en tamaño grande
 * @param {boolean} open - Estado del modal (abierto/cerrado)
 * @param {Function} onOpenChange - Función para cambiar el estado del modal
 * @param {Array} images - Array de imágenes
 * @param {number} currentIndex - Índice de la imagen actual
 * @param {Function} onNext - Función para avanzar a la siguiente imagen
 * @param {Function} onPrev - Función para retroceder a la imagen anterior
 * @param {string} productName - Nombre del producto
 * @returns {JSX.Element} - Componente modal de galería
 */
export default function ImageGalleryModal({ open, onOpenChange, images, currentIndex, onNext, onPrev, productName }) {
    if (!images || images.length === 0) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <DialogTitle>{productName}</DialogTitle>

                {/* Imagen principal */}
                <div className="relative overflow-hidden rounded-lg bg-gray-100">
                    <img
                        src={images[currentIndex].full_url}
                        alt={productName || 'Imagen del producto'}
                        className="mx-auto max-h-[80vh] w-full rounded-md object-contain"
                    />

                    {/* Botones de navegación - Solo si hay más de una imagen */}
                    {images.length > 1 && (
                        <>
                            {/* Botón anterior */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPrev();
                                }}
                                className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
                                aria-label="Imagen anterior"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>

                            {/* Botón siguiente */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNext();
                                }}
                                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
                                aria-label="Imagen siguiente"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>

                            {/* Indicador de posición */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                                {currentIndex + 1} / {images.length}
                            </div>
                        </>
                    )}
                </div>

                {/* Miniaturas - Solo si hay más de una imagen */}
                {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto p-2 sm:p-4">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    // Simular navegación al índice específico
                                    const diff = index - currentIndex;
                                    if (diff > 0) {
                                        for (let i = 0; i < diff; i++) {
                                            onNext();
                                        }
                                    } else if (diff < 0) {
                                        for (let i = 0; i < Math.abs(diff); i++) {
                                            onPrev();
                                        }
                                    }
                                }}
                                className={`h-10 w-10 flex-shrink-0 overflow-hidden rounded border-2 transition-all sm:h-16 sm:w-16 ${
                                    index === currentIndex ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300 hover:border-blue-300'
                                }`}
                            >
                                <img src={image.full_url} alt={`Miniatura ${index + 1}`} className="h-full w-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
