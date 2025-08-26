// resources/js/hooks/useBudgetImageGallery.js

import { organizeImages } from '@/utils/budget/budgetUtils';
import { useEffect, useState } from 'react';

/**
 * Hook para manejar las galerías de imágenes de productos
 * @param {Object} budget - Objeto del presupuesto
 * @returns {Object} - Estado y funciones para manejo de galerías
 */
export const useBudgetImageGallery = (budget) => {
    const [imageGalleries, setImageGalleries] = useState({});
    const [currentImageIndexes, setCurrentImageIndexes] = useState({});

    // Configurar galerías de imágenes e índices iniciales
    useEffect(() => {
        const galleries = {};
        const initialIndexes = {};

        // Procesar items regulares
        budget.grouped_items?.regular?.forEach((item) => {
            const key = `regular-${item.id}`;
            galleries[key] = organizeImages(item.product?.images);
            initialIndexes[key] = 0; // Siempre empezar por la primera (que será la destacada)
        });

        // Procesar grupos de variantes
        Object.entries(budget.grouped_items?.variants || {}).forEach(([group, items]) => {
            items.forEach((item) => {
                const key = `variant-${group}-${item.id}`;
                galleries[key] = organizeImages(item.product?.images);
                initialIndexes[key] = 0; // Siempre empezar por la primera (que será la destacada)
            });
        });

        setImageGalleries(galleries);
        setCurrentImageIndexes(initialIndexes);
    }, [budget]);

    /**
     * Avanza a la siguiente imagen en la galería
     * @param {string} key - Clave de la galería
     */
    const nextImage = (key) => {
        setCurrentImageIndexes((prev) => ({
            ...prev,
            [key]: (prev[key] + 1) % imageGalleries[key].length,
        }));
    };

    /**
     * Retrocede a la imagen anterior en la galería
     * @param {string} key - Clave de la galería
     */
    const prevImage = (key) => {
        setCurrentImageIndexes((prev) => ({
            ...prev,
            [key]: prev[key] === 0 ? imageGalleries[key].length - 1 : prev[key] - 1,
        }));
    };

    /**
     * Obtiene la imagen actual para una clave específica
     * @param {string} key - Clave de la galería
     * @returns {Object|null} - Objeto de imagen actual o null
     */
    const getCurrentImage = (key) => {
        const gallery = imageGalleries[key];
        const index = currentImageIndexes[key];
        return gallery && gallery[index] ? gallery[index] : null;
    };

    /**
     * Verifica si hay múltiples imágenes en una galería
     * @param {string} key - Clave de la galería
     * @returns {boolean} - true si hay más de una imagen
     */
    const hasMultipleImages = (key) => {
        const gallery = imageGalleries[key];
        return gallery && gallery.length > 1;
    };

    return {
        imageGalleries,
        currentImageIndexes,
        nextImage,
        prevImage,
        getCurrentImage,
        hasMultipleImages,
    };
};
