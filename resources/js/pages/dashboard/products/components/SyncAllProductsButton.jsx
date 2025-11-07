import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import { router } from '@inertiajs/react';
import { Info, Loader2, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function SyncAllProductsButton({ lastSyncInfo, showSyncButton = true }) {
    const { handleResponse } = useInertiaResponse();
    const [loading, setLoading] = useState(false);

    const handleSync = () => {
        const url = route('dashboard.products.sync');

        router.post(
            url,
            {},
            {
                preserveScroll: true,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
                ...handleResponse(), // ← Este hook maneja automáticamente los toasts
            },
        );
    };

    return (
        <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Algunos productos se sincronizan desde una API externa</AlertTitle>
            <AlertDescription className="mt-2 flex items-center justify-between">
                <div className="text-sm">
                    <p className="mb-1">Se pueden sincronizar para traer los últimos cambios. Usar solo si es imperativo.</p>
                    {lastSyncInfo && (
                        <p className="text-muted-foreground text-xs">
                            Última sincronización: <strong>{lastSyncInfo.last_sync_human}</strong>
                        </p>
                    )}
                </div>
                {showSyncButton && (
                    <Button onClick={handleSync} variant="destructive" size="sm" className="ml-4 whitespace-nowrap">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        {loading ? 'Sincronizando...' : 'Sincronizar productos'}
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    );
}
