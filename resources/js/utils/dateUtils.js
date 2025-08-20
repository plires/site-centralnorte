/**
 * Utilidades centralizadas para manejo de fechas
 *
 * IMPORTANTE: Todas las funciones que generan fechas para formularios
 * deben usar la zona horaria local de Argentina para evitar problemas
 * cuando es tarde en el día (22:00+ hora local = siguiente día en UTC)
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
 * Función CORREGIDA para obtener la fecha actual en formato YYYY-MM-DD
 * Usa la zona horaria local de Argentina (NO UTC) para evitar problemas
 * cuando es tarde en el día local
 */
export const getTodayISO = () => {
    const now = new Date();

    // Obtener año, mes y día EN LA ZONA HORARIA LOCAL
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // +1 porque getMonth() es 0-indexed
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * Función CORREGIDA para obtener mañana en formato YYYY-MM-DD
 * Usa la zona horaria local de Argentina (NO UTC)
 */
export const getTomorrowISO = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Esto suma 1 día EN LA ZONA HORARIA LOCAL

    // Obtener año, mes y día EN LA ZONA HORARIA LOCAL
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * Nueva función: obtener fecha local formateada para inputs HTML
 * Útil para inicializar formularios con la fecha actual local
 */
export const getTodayForInput = () => {
    return getTodayISO();
};

/**
 * Nueva función: obtener fecha + N días en formato YYYY-MM-DD
 * Usa zona horaria local
 */
export const getDatePlusDaysISO = (days = 0) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};
