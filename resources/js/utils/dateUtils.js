/**
 * Utilidades centralizadas para manejo de fechas
 *
 * IMPORTANTE: Ya no es necesario parsear fechas manualmente desde el frontend
 * porque ahora el backend envía las fechas ya formateadas usando accessors del modelo.
 *
 * Este archivo se puede usar para formateos adicionales si es necesario.
 */

/**
 * Función legacy para parsear fechas localmente (ya no debería ser necesaria)
 * Se mantiene por compatibilidad si algún componente aún la necesita
 */
export const parseLocalDate = (dateString) => {
    if (!dateString) return null;

    // Si la fecha viene en formato YYYY-MM-DD, parseamos localmente
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day); // month - 1 porque Date usa 0-indexed months
    }

    // Para otros formatos, usar Date normal
    return new Date(dateString);
};

/**
 * Función legacy de formateo corto (ya no debería ser necesaria)
 * El modelo Budget ya envía issue_date_short y expiry_date_short
 */
export const formatDateShort = (date) => {
    const parsedDate = parseLocalDate(date);
    if (!parsedDate) return '';

    return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(parsedDate);
};

/**
 * Función legacy de formateo largo (ya no debería ser necesaria)
 * El modelo Budget ya envía issue_date_formatted y expiry_date_formatted
 */
export const formatDateLong = (date) => {
    const parsedDate = parseLocalDate(date);
    if (!parsedDate) return '';

    return parsedDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

/**
 * Formateo para datetime con hora (para updated_at, email_sent_at, etc.)
 */
export const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';

    return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateTimeString));
};

/**
 * Formateo para inputs HTML de tipo date
 * Convierte cualquier fecha a formato YYYY-MM-DD
 */
export const formatForDateInput = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    return date.toISOString().split('T')[0];
};

/**
 * Función para obtener la fecha actual en formato YYYY-MM-DD
 * Útil para atributos min/max de inputs date
 */
export const getTodayISO = () => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Función para obtener mañana en formato YYYY-MM-DD
 */
export const getTomorrowISO = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
};
