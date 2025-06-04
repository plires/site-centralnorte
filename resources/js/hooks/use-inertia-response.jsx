import { toast } from 'sonner';

export function useInertiaResponse() {
    const handleResponse = (onSuccessCallback = null, onErrorCallback = null) => ({
        onSuccess: (page) => {
            const flashSuccess = page.props.flash?.success;
            const flashError = page.props.flash?.error;

            if (flashSuccess) {
                toast.success(flashSuccess);
                // Ejecutar callback personalizado si existe
                if (onSuccessCallback && typeof onSuccessCallback === 'function') {
                    onSuccessCallback(page);
                }
            } else if (flashError) {
                toast.error(flashError);
                // Ejecutar callback de error si existe
                if (onErrorCallback && typeof onErrorCallback === 'function') {
                    onErrorCallback(page);
                }
            }
        },
        onError: (errors) => {
            // Manejar errores de validación u otros errores
            const errorMessage = typeof errors === 'string' ? errors : 'Ocurrió un error al procesar la solicitud';

            toast.error(errorMessage);

            if (onErrorCallback && typeof onErrorCallback === 'function') {
                onErrorCallback(errors);
            }
        },
    });

    // Método específico para operaciones CRUD con estados de loading
    const handleCrudResponse = (setLoadingState = null, onSuccessCallback = null, onErrorCallback = null) => ({
        ...handleResponse(onSuccessCallback, onErrorCallback),
        onFinish: () => {
            if (setLoadingState && typeof setLoadingState === 'function') {
                setLoadingState(false);
            }
        },
    });

    return {
        handleResponse,
        handleCrudResponse,
    };
}
