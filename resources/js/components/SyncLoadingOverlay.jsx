import { Loader2 } from 'lucide-react';

export function SyncLoadingOverlay({ isLoading, title, subtitle, detail }) {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="mx-4 max-w-md rounded-lg bg-white p-8 shadow-2xl">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900">{title || 'Sincronizando...'}</h3>
                        {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
                        {detail && <p className="mt-1 text-sm text-gray-500">{detail}</p>}
                        <p className="mt-3 text-sm font-medium text-orange-600">Por favor, no cierre ni actualice esta página.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
