/**
 * Formatea una fecha a formato largo en español.
 * Ej: 10 de agosto de 2025, 14:35
 */
export const formatLongDate = (dateString) => {
    if (!dateString) return 'No verificado';
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Formatea solo la fecha (sin hora).
 * Ej: 10/08/2025
 */
export const formatShortDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
};

/**
 * Devuelve la hora en formato 24h.
 * Ej: 14:35
 */
export const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Devuelve texto relativo.
 * Ej: "hace 5 minutos", "hace 2 días"
 */
export const timeAgo = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // segundos

    if (diff < 60) return `hace ${diff} segundo${diff !== 1 ? 's' : ''}`;
    if (diff < 3600) {
        const mins = Math.floor(diff / 60);
        return `hace ${mins} minuto${mins !== 1 ? 's' : ''}`;
    }
    if (diff < 86400) {
        const hrs = Math.floor(diff / 3600);
        return `hace ${hrs} hora${hrs !== 1 ? 's' : ''}`;
    }
    const days = Math.floor(diff / 86400);
    return `hace ${days} día${days !== 1 ? 's' : ''}`;
};

/**
 * Convierte a formato ISO (útil para enviar a API o DB).
 */
export const toISO = (date) => {
    if (!date) return null;
    return new Date(date).toISOString();
};
