import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BudgetStatusBadge, budgetStatusOptions } from './BudgetStatusBadge';
import { Loader2 } from 'lucide-react';

/**
 * Selector de estado para presupuestos (uso del vendedor/admin en dashboard)
 * 
 * @param {Object} props
 * @param {number} props.budgetId - ID del presupuesto
 * @param {string} props.currentStatus - Estado actual
 * @param {string} props.routeName - Nombre de la ruta para actualizar (ej: 'dashboard.budgets.update-status')
 * @param {boolean} [props.confirmChange=true] - Mostrar confirmación antes de cambiar
 * @param {function} [props.onStatusChange] - Callback después de cambiar estado
 */
export function BudgetStatusSelector({
    budgetId,
    currentStatus,
    routeName,
    confirmChange = true,
    onStatusChange,
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleStatusChange = (newStatus) => {
        if (newStatus === currentStatus) return;

        if (confirmChange) {
            setPendingStatus(newStatus);
            setShowConfirm(true);
        } else {
            submitStatusChange(newStatus);
        }
    };

    const submitStatusChange = (newStatus) => {
        setIsLoading(true);
        
        router.patch(
            route(routeName, budgetId),
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsLoading(false);
                    setShowConfirm(false);
                    setPendingStatus(null);
                    if (onStatusChange) {
                        onStatusChange(newStatus);
                    }
                },
                onError: () => {
                    setIsLoading(false);
                    setShowConfirm(false);
                    setPendingStatus(null);
                },
            }
        );
    };

    const getStatusLabel = (status) => {
        const option = budgetStatusOptions.find(o => o.value === status);
        return option?.label || status;
    };

    return (
        <>
            <Select
                value={currentStatus}
                onValueChange={handleStatusChange}
                disabled={isLoading}
            >
                <SelectTrigger className="w-[180px]">
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Actualizando...</span>
                        </div>
                    ) : (
                        <SelectValue>
                            <BudgetStatusBadge status={currentStatus} size="sm" />
                        </SelectValue>
                    )}
                </SelectTrigger>
                <SelectContent>
                    {budgetStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            <BudgetStatusBadge status={option.value} size="sm" />
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Cambiar estado del presupuesto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás por cambiar el estado de{' '}
                            <strong>{getStatusLabel(currentStatus)}</strong> a{' '}
                            <strong>{getStatusLabel(pendingStatus)}</strong>.
                            {pendingStatus === 'sent' && (
                                <span className="block mt-2 text-blue-600">
                                    Nota: Esto hará el presupuesto visible para el cliente.
                                </span>
                            )}
                            {pendingStatus === 'expired' && (
                                <span className="block mt-2 text-orange-600">
                                    Nota: El cliente ya no podrá ver el presupuesto.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => submitStatusChange(pendingStatus)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Actualizando...
                                </>
                            ) : (
                                'Confirmar cambio'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default BudgetStatusSelector;
