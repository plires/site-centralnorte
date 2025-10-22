import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Info, RefreshCw } from 'lucide-react';

export function ReadOnlyProductsAlert({ lastSyncInfo, showSyncButton = true }) {
    const handleSync = () => {
        router.post(
            route('dashboard.products.sync'),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    // El mensaje de éxito se maneja automáticamente por flash messages
                },
            },
        );
    };

    return (
        <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Productos sincronizados desde API externa</AlertTitle>
            <AlertDescription className="mt-2 flex items-center justify-between">
                <div className="text-sm">
                    <p className="mb-1">Los productos se obtienen de una API externa y no se pueden editar directamente desde esta interfaz.</p>
                    {lastSyncInfo && (
                        <p className="text-xs text-muted-foreground">
                            Última sincronización: <strong>{lastSyncInfo.last_sync_human}</strong>
                        </p>
                    )}
                </div>
                {showSyncButton && (
                    <Button onClick={handleSync} variant="outline" size="sm" className="ml-4 whitespace-nowrap">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sincronizar ahora
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    );
}
