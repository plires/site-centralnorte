// resources/js/components/budgets/StatusChangeDialog.jsx

import { Loader2 } from 'lucide-react';
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
import { budgetStatusOptions } from '@/components/BudgetStatusBadge';

function getStatusLabel(status) {
    const option = budgetStatusOptions.find((o) => o.value === status);
    return option?.label || status;
}

/**
 * Dialog de confirmación de cambio de estado, compartido entre presupuestos
 * de merch y picking.
 *
 * Props:
 * - open: bool
 * - onOpenChange: fn(bool)
 * - onConfirm: fn — acción al confirmar
 * - currentStatus: string — estado actual del presupuesto
 * - pendingStatus: string — nuevo estado a aplicar
 * - isLoading: bool
 */
export function StatusChangeDialog({ open, onOpenChange, onConfirm, currentStatus, pendingStatus, isLoading = false }) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Cambiar estado del presupuesto?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div>
                            <p>
                                Estás por cambiar el estado de <strong>{getStatusLabel(currentStatus)}</strong> a{' '}
                                <strong>{getStatusLabel(pendingStatus)}</strong>.
                            </p>
                            {pendingStatus === 'sent' && (
                                <p className="mt-2 text-blue-600">Esto hará el presupuesto visible para el cliente.</p>
                            )}
                            {pendingStatus === 'expired' && (
                                <p className="mt-2 text-orange-600">El cliente ya no podrá ver el presupuesto.</p>
                            )}
                            {pendingStatus === 'approved' && (
                                <p className="mt-2 text-green-600">Esto marcará el presupuesto como aprobado manualmente.</p>
                            )}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
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
    );
}
