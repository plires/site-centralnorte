// resources/js/utils/budget/budgetUtils.js

import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

/**
 * Formatea un monto de dinero al formato argentino
 * @param {number} amount - El monto a formatear
 * @returns {string} - El monto formateado (ej: "$1.234,56")
 */
export const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

/**
 * Organiza las imágenes de productos poniendo la destacada primero
 * @param {Array} images - Array de imágenes del producto
 * @returns {Array} - Array ordenado con imagen destacada primero
 */
export const organizeImages = (images) => {
    if (!images || images.length === 0) return [];

    // Separar imagen destacada y otras imágenes
    const featured = images.find((img) => img.is_featured);
    const others = images.filter((img) => !img.is_featured);

    // Retornar con imagen destacada primero (si existe)
    return featured ? [featured, ...others] : others;
};

/**
 * Obtiene la información del estado del presupuesto
 * @param {Object} budget - Objeto del presupuesto
 * @returns {Object} - Objeto con variant, icon y text para el estado
 */
export const getStatusInfo = (budget) => {
    if (budget.is_expired) {
        return {
            variant: 'destructive',
            icon: AlertTriangle,
            text: 'Presupuesto vencido',
        };
    }

    if (budget.days_until_expiry <= 3) {
        return {
            variant: 'secondary',
            icon: Clock,
            text: `Vence en ${budget.days_until_expiry} día${budget.days_until_expiry !== 1 ? 's' : ''}`,
        };
    }

    return {
        variant: 'default',
        icon: CheckCircle,
        text: 'Presupuesto vigente',
    };
};

/**
 * Genera la URL para descargar el PDF con las variantes seleccionadas
 * @param {string} token - Token del presupuesto
 * @param {Object} selectedVariants - Objeto con variantes seleccionadas
 * @returns {string} - URL completa para descarga del PDF
 */
export const generatePdfUrl = (token, selectedVariants) => {
    const baseUrl = `/presupuesto/${token}/pdf`;

    // Si hay variantes seleccionadas, agregar como parámetros de consulta
    if (Object.keys(selectedVariants).length > 0) {
        const params = new URLSearchParams();

        // Formato: grupo:itemId
        Object.entries(selectedVariants).forEach(([group, itemId]) => {
            params.append('variants[]', `${group}:${itemId}`);
        });

        return `${baseUrl}?${params.toString()}`;
    }

    return baseUrl;
};

/**
 * Verifica si todas las variantes han sido seleccionadas
 * @param {Array} variantGroups - Array de grupos de variantes
 * @param {Object} selectedVariants - Objeto con variantes seleccionadas
 * @returns {boolean} - true si todas las variantes están seleccionadas
 */
export const areAllVariantsSelected = (variantGroups, selectedVariants) => {
    return variantGroups.length === 0 || variantGroups.every((group) => selectedVariants[group]);
};
