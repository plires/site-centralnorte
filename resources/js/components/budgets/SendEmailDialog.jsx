// resources/js/components/budgets/SendEmailDialog.jsx

import { AlertTriangle } from 'lucide-react';
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

/**
 * Dialog de confirmación de envío/reenvío de presupuesto por email.
 *
 * Props:
 * - open: bool
 * - onOpenChange: fn(bool)
 * - onConfirm: fn — acción al confirmar
 * - budget: objeto con { email_sent, email_sent_at, status, client: { email } }
 * - budgetNumber: string — número del presupuesto (ej: "P-001" o "PK-012")
 * - isLoading: bool — muestra "Enviando..." en el botón de confirmar
 */
export function SendEmailDialog({ open, onOpenChange, onConfirm, budget, budgetNumber, isLoading = false }) {
    const clientEmail = budget?.client?.email;
    const emailSent = budget?.email_sent;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{emailSent ? 'Reenviar presupuesto' : 'Enviar presupuesto'}</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div>
                            {emailSent ? (
                                <p>
                                    Este presupuesto ya fue enviado previamente el{' '}
                                    <strong>
                                        {new Date(budget.email_sent_at).toLocaleString('es-AR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </strong>
                                    . ¿Deseas reenviar a <strong>{clientEmail}</strong>?
                                </p>
                            ) : (
                                <div>
                                    <p>
                                        ¿Estás seguro de que quieres enviar el email del presupuesto {budgetNumber} a{' '}
                                        <strong>{clientEmail}</strong>?
                                    </p>
                                    <p className="mt-2">El cliente recibirá un link para visualizar el presupuesto online.</p>
                                    {budget.status !== 'sent' && (
                                        <p className="mt-2 text-blue-600">El estado del presupuesto cambiará a "Enviado".</p>
                                    )}
                                </div>
                            )}

                            {!clientEmail && (
                                <div className="mt-3 flex items-center gap-2 text-amber-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    El cliente no tiene email configurado.
                                </div>
                            )}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} disabled={!clientEmail || isLoading}>
                        {isLoading ? 'Enviando...' : emailSent ? 'Reenviar' : 'Enviar'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
