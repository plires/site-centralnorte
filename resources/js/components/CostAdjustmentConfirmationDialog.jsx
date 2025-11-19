import ButtonCustom from '@/components/ButtonCustom';
import { Button } from '@/components/ui/button';
import { Percent, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';

// Hook simple sin dependencias externas
export function useCostAdjustmentConfirmation() {
    const [isOpen, setIsOpen] = useState(false);
    const [adjustmentData, setAdjustmentData] = useState(null);

    const confirmAdjustment = (data) => {
        return new Promise((resolve) => {
            setAdjustmentData({ ...data, resolve });
            setIsOpen(true);
        });
    };

    const handleConfirm = () => {
        if (adjustmentData?.resolve) {
            adjustmentData.resolve(true);
        }
        setIsOpen(false);
        setAdjustmentData(null);
    };

    const handleCancel = () => {
        if (adjustmentData?.resolve) {
            adjustmentData.resolve(false);
        }
        setIsOpen(false);
        setAdjustmentData(null);
    };

    const CostAdjustmentConfirmationDialog = () => {
        const isIncrease = adjustmentData?.isIncrease;
        const IconComponent = isIncrease ? TrendingUp : TrendingDown;
        const actionColor = isIncrease ? 'text-green-600' : 'text-red-600';
        const buttonColor = isIncrease ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';
        const actionText = isIncrease ? 'incrementar' : 'decrementar';

        return (
            <>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Overlay */}
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancel} />

                        {/* Modal */}
                        <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Percent className={`h-5 w-5 ${actionColor}`} />
                                    <h3 className="text-lg font-semibold">{adjustmentData?.title || `¿Confirmar ${actionText}?`}</h3>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleCancel} className="h-6 w-6 p-0">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="mb-6">
                                {adjustmentData?.percentage && (
                                    <div className="mb-4 rounded-lg bg-gray-100 p-4">
                                        <p className="text-center text-2xl font-bold text-gray-800">
                                            {isIncrease ? '+' : '-'}
                                            {adjustmentData.percentage}%
                                        </p>
                                    </div>
                                )}
                                <p className="mb-3 text-gray-800">
                                    {adjustmentData?.description || `Esta acción ${actionText}á todos los costos en ${adjustmentData?.percentage}%.`}
                                </p>
                                {adjustmentData?.affectedItems && (
                                    <p className="mb-2 text-sm text-gray-600">
                                        <strong>Items afectados:</strong> {adjustmentData.affectedItems}
                                    </p>
                                )}
                                <div className="rounded-md bg-amber-50 p-3">
                                    <p className="text-xs text-amber-800">
                                        ⚠️ <strong>Importante:</strong> Los cambios se guardarán automáticamente al confirmar.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <ButtonCustom onClick={handleCancel} variant="secondary" size="lg">
                                    Cancelar
                                </ButtonCustom>

                                <Button onClick={handleConfirm} className={`flex items-center gap-2 ${buttonColor}`} size="lg">
                                    <IconComponent className="h-4 w-4" />
                                    {isIncrease ? 'Incrementar' : 'Decrementar'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    };

    return { confirmAdjustment, CostAdjustmentConfirmationDialog };
}
