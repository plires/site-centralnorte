import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

/**
 * Botones de acción del cliente para aprobar/rechazar presupuesto
 * Se usa en la vista pública del presupuesto
 * 
 * @param {Object} props
 * @param {string} props.token - Token del presupuesto
 * @param {string} props.approveRoute - Nombre de la ruta para aprobar
 * @param {string} props.rejectRoute - Nombre de la ruta para rechazar
 * @param {boolean} [props.allowsAction=true] - Si el presupuesto permite acciones
 */
export function ClientBudgetActions({
    token,
    approveRoute,
    rejectRoute,
    allowsAction = true,
}) {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const handleApprove = () => {
        setIsApproving(true);
        router.post(
            route(approveRoute, token),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsApproving(false);
                    setShowApproveDialog(false);
                },
            }
        );
    };

    const handleReject = () => {
        setIsRejecting(true);
        router.post(
            route(rejectRoute, token),
            { reason: rejectReason },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsRejecting(false);
                    setShowRejectDialog(false);
                    setRejectReason('');
                },
            }
        );
    };

    if (!allowsAction) {
        return null;
    }

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            {/* Botón Aprobar */}
            <Button
                onClick={() => setShowApproveDialog(true)}
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
                disabled={isApproving || isRejecting}
            >
                <CheckCircle className="mr-2 h-5 w-5" />
                Aprobar Presupuesto
            </Button>

            {/* Botón Rechazar */}
            <Button
                onClick={() => setShowRejectDialog(true)}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 flex-1"
                disabled={isApproving || isRejecting}
            >
                <XCircle className="mr-2 h-5 w-5" />
                Rechazar Presupuesto
            </Button>

            {/* Dialog de confirmación para Aprobar */}
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-5 w-5" />
                            ¿Aprobar este presupuesto?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Al aprobar este presupuesto, nos pondremos en contacto contigo
                            para coordinar los siguientes pasos. Esta acción confirmará
                            tu aceptación de los términos y condiciones presentados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isApproving}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleApprove}
                            disabled={isApproving}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isApproving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Aprobando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Sí, aprobar
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog de confirmación para Rechazar */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                            <XCircle className="h-5 w-5" />
                            ¿Rechazar este presupuesto?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            <p className="mb-4">
                                Si este presupuesto no cumple con tus expectativas,
                                puedes rechazarlo. Opcionalmente, puedes indicarnos
                                el motivo para mejorar futuras propuestas.
                            </p>
                            <Textarea
                                placeholder="Motivo del rechazo (opcional)"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={3}
                                className="mt-2"
                            />
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRejecting}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            disabled={isRejecting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isRejecting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Rechazando...
                                </>
                            ) : (
                                <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Confirmar rechazo
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default ClientBudgetActions;
