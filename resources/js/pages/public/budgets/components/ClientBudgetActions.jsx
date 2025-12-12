// resources/js/pages/public/budgets/components/ClientBudgetActions.jsx

import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { CheckCircle, XCircle, Loader2, ThumbsUp, MessageSquare } from 'lucide-react';

/**
 * Botones de acción del cliente para aprobar/rechazar presupuesto
 * Se usa en la vista pública del presupuesto
 * 
 * @param {Object} props
 * @param {string} props.token - Token del presupuesto
 * @param {string} props.approveRoute - Nombre de la ruta para aprobar
 * @param {string} props.rejectRoute - Nombre de la ruta para rechazar
 */
export default function ClientBudgetActions({
    token,
    approveRoute,
    rejectRoute,
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

    return (
        <Card className="border-2 border-blue-100 bg-blue-50/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    ¿Qué te parece este presupuesto?
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4 text-sm text-gray-600">
                    Revisa los detalles del presupuesto y selecciona una opción. 
                    Tu respuesta nos ayudará a procesar tu solicitud más rápidamente.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Botón Aprobar */}
                    <Button
                        onClick={() => setShowApproveDialog(true)}
                        className="bg-green-600 hover:bg-green-700 text-white flex-1 h-12"
                        disabled={isApproving || isRejecting}
                    >
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Aprobar Presupuesto
                    </Button>

                    {/* Botón Rechazar */}
                    <Button
                        onClick={() => setShowRejectDialog(true)}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 flex-1 h-12"
                        disabled={isApproving || isRejecting}
                    >
                        <XCircle className="mr-2 h-5 w-5" />
                        Rechazar Presupuesto
                    </Button>
                </div>

                {/* Dialog de confirmación para Aprobar */}
                <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-green-700">
                                <ThumbsUp className="h-5 w-5" />
                                ¿Aprobar este presupuesto?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-3">
                                <p>
                                    Al aprobar este presupuesto, confirmas tu interés en proceder con la propuesta.
                                </p>
                                <p>
                                    Nuestro equipo se pondrá en contacto contigo para coordinar los siguientes pasos,
                                    incluyendo formas de pago y plazos de entrega.
                                </p>
                                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                                    <strong>Nota:</strong> Esta acción no genera ningún compromiso de pago inmediato.
                                </div>
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
                                        Sí, aprobar presupuesto
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
                            <AlertDialogDescription asChild>
                                <div className="space-y-4">
                                    <p>
                                        Si este presupuesto no cumple con tus expectativas,
                                        puedes rechazarlo. Opcionalmente, puedes indicarnos
                                        el motivo para mejorar futuras propuestas.
                                    </p>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                                            Motivo del rechazo (opcional)
                                        </label>
                                        <Textarea
                                            placeholder="Ej: El precio está fuera de mi presupuesto, necesito otras cantidades, etc."
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            rows={3}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                                        <strong>Tip:</strong> Si tienes dudas o necesitas modificaciones,
                                        puedes contactar al vendedor antes de rechazar.
                                    </div>
                                </div>
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
            </CardContent>
        </Card>
    );
}
