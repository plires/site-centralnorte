import ButtonCustom from '@/components/ButtonCustom';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

// Hook simple sin dependencias externas
export function useSyncConfirmation() {
    const [isOpen, setIsOpen] = useState(false);
    const [syncData, setSyncData] = useState(null);

    const confirmSync = (data) => {
        return new Promise((resolve) => {
            setSyncData({ ...data, resolve });
            setIsOpen(true);
        });
    };

    const handleConfirm = () => {
        if (syncData?.resolve) {
            syncData.resolve(true);
        }
        setIsOpen(false);
        setSyncData(null);
    };

    const handleCancel = () => {
        if (syncData?.resolve) {
            syncData.resolve(false);
        }
        setIsOpen(false);
        setSyncData(null);
    };

    const SyncConfirmationDialog = () => (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Overlay */}
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancel} />

                    {/* Modal */}
                    <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <RefreshCw className="h-5 w-5 text-orange-500" />
                                <h3 className="text-lg font-semibold">{syncData?.title || '¿Confirmar sincronización?'}</h3>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleCancel} className="h-6 w-6 p-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="mb-6">
                            {syncData?.productName && (
                                <p className="mb-2 font-medium text-gray-800">
                                    Producto: <span className="text-gray-900">"{syncData.productName}"</span>
                                </p>
                            )}
                            {syncData?.sku && (
                                <p className="mb-3 text-sm text-gray-600">
                                    SKU: <span className="font-mono">{syncData.sku}</span>
                                </p>
                            )}
                            <p className="text-gray-600">
                                {syncData?.description ||
                                    'Se sincronizará este producto con la API externa, sobrescribiendo los datos locales. ¿Deseas continuar?'}
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <ButtonCustom onClick={handleCancel} variant="secondary" size="md">
                                Cancelar
                            </ButtonCustom>

                            <ButtonCustom className="flex items-center gap-2" onClick={handleConfirm} variant="destructive" size="md">
                                <RefreshCw className="h-4 w-4" />
                                Sincronizar
                            </ButtonCustom>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    return { confirmSync, SyncConfirmationDialog };
}
