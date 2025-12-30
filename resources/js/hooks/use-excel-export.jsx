import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook para manejar exportaciones a Excel con feedback del servidor
 * 
 * @returns {Object} - { handleExport, isExporting }
 * 
 * @example
 * const { handleExport, isExporting } = useExcelExport();
 * 
 * <Button onClick={() => handleExport(route('dashboard.clients.export'))} disabled={isExporting}>
 *     {isExporting ? 'Exportando...' : 'Exportar Excel'}
 * </Button>
 */
export function useExcelExport() {
    const [isExporting, setIsExporting] = useState(false);

    /**
     * Maneja la descarga de archivos Excel desde el servidor
     * 
     * @param {string} url - URL del endpoint de exportación
     * @param {string} defaultFilename - Nombre por defecto si no viene en el header
     * @param {Object} options - Opciones adicionales para fetch
     */
    const handleExport = async (url, defaultFilename = 'export.xlsx', options = {}) => {
        setIsExporting(true);

        try {
            // Realizar fetch con headers para autenticación
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    ...options.headers,
                },
                credentials: 'same-origin',
                ...options,
            });

            // Verificar si la respuesta fue exitosa
            if (!response.ok) {
                // Intentar leer el mensaje de error del servidor
                let errorMessage = 'Error al exportar los datos';
                
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        errorMessage = `Error ${response.status}: ${response.statusText}`;
                    }
                } else {
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }

                toast.error(errorMessage);
                return false;
            }

            // Obtener el blob (archivo Excel)
            const blob = await response.blob();

            // Extraer nombre del archivo desde el header Content-Disposition
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = defaultFilename;
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }

            // Crear URL temporal y descargar
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Limpiar URL temporal
            window.URL.revokeObjectURL(downloadUrl);

            // Mostrar mensaje de éxito
            toast.success('Excel exportado correctamente');
            return true;

        } catch (error) {
            console.error('Error al exportar:', error);
            
            // Mensaje de error personalizado según el tipo
            let errorMessage = 'Ocurrió un error al exportar el archivo.';
            
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
            } else if (error.name === 'AbortError') {
                errorMessage = 'La exportación fue cancelada.';
            }
            
            toast.error(errorMessage);
            return false;

        } finally {
            setIsExporting(false);
        }
    };

    return {
        handleExport,
        isExporting,
    };
}
