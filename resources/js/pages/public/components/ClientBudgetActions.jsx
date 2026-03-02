// resources/js/pages/public/components/ClientBudgetActions.jsx

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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { CheckCircle, Clock, Loader2, MessageSquare } from 'lucide-react';
import { useState } from 'react';

/**
 * Botones de acción del cliente para aprobar o poner en evaluación un presupuesto
 * Se usa en la vista pública del presupuesto
 *
 * @param {Object} props
 * @param {string} props.token - Token del presupuesto
 * @param {string} props.approveRoute - Nombre de la ruta para aprobar
 * @param {string} props.inReviewRoute - Nombre de la ruta para poner en evaluación
 * @param {string} props.currentStatus - Estado actual del presupuesto
 */
export default function ClientBudgetActions({ token, approveRoute, inReviewRoute, currentStatus = 'sent' }) {
    const [isApproving, setIsApproving] = useState(false);
    const [isSettingReview, setIsSettingReview] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showReviewDialog, setShowReviewDialog] = useState(false);

    // Determinar si está en evaluación
    const isInReview = currentStatus === 'in_review';

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
            },
        );
    };

    const handleInReview = () => {
        setIsSettingReview(true);
        router.post(
            route(inReviewRoute, token),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsSettingReview(false);
                    setShowReviewDialog(false);
                },
            },
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
                {isInReview ? (
                    <>
                        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                            <p className="mb-2 text-sm font-medium text-yellow-800">📋 Este presupuesto está en evaluación</p>
                            <p className="text-sm text-yellow-700">
                                Ya marcaste este presupuesto como "En Evaluación". Cuando estés listo, puedes aprobarlo directamente desde aquí.
                            </p>
                        </div>
                    </>
                ) : (
                    <p className="mb-4 text-sm text-gray-600">
                        Revisa los detalles del presupuesto y selecciona una opción. Tu respuesta nos ayudará a procesar tu solicitud más rápidamente.
                    </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                    {isInReview ? (
                        /* Si está en evaluación, solo mostrar botón de aprobar */
                        <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                            <Button
                                onClick={() => setShowApproveDialog(true)}
                                disabled={isApproving}
                                className="w-full bg-green-600 hover:bg-green-700"
                                size="lg"
                            >
                                {isApproving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-5 w-5" />
                                        Aprobar Presupuesto
                                    </>
                                )}
                            </Button>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2 text-green-600">
                                        <CheckCircle className="h-5 w-5" />
                                        Aprobar Presupuesto
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-base">
                                        ¿Estás seguro de que deseas aprobar este presupuesto?
                                        <br />
                                        <br />
                                        Al confirmar, notificaremos al vendedor que has aceptado la propuesta y nos pondremos en contacto contigo para
                                        coordinar los siguientes pasos.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                                        Sí, aprobar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    ) : (
                        /* Si está en SENT, mostrar ambos botones */
                        <>
                            {/* Botón Aprobar */}
                            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                                <Button
                                    onClick={() => setShowApproveDialog(true)}
                                    disabled={isApproving || isSettingReview}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    size="lg"
                                >
                                    {isApproving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="mr-2 h-5 w-5" />
                                            Aprobar Presupuesto
                                        </>
                                    )}
                                </Button>

                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2 text-green-600">
                                            <CheckCircle className="h-5 w-5" />
                                            Aprobar Presupuesto
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-base">
                                            ¿Estás seguro de que deseas aprobar este presupuesto?
                                            <br />
                                            <br />
                                            Al confirmar, notificaremos al vendedor que has aceptado la propuesta y nos pondremos en contacto contigo
                                            para coordinar los siguientes pasos.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                                            Sí, aprobar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            {/* Botón En Evaluación */}
                            <AlertDialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                                <Button
                                    onClick={() => setShowReviewDialog(true)}
                                    disabled={isApproving || isSettingReview}
                                    variant="outline"
                                    className="flex-1 border-yellow-600 text-yellow-700 hover:bg-yellow-50"
                                    size="lg"
                                >
                                    {isSettingReview ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="mr-2 h-5 w-5" />
                                            Poner en Evaluación
                                        </>
                                    )}
                                </Button>

                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2 text-yellow-600">
                                            <Clock className="h-5 w-5" />
                                            Poner en Evaluación
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-base">
                                            ¿Necesitas más tiempo para revisar este presupuesto?
                                            <br />
                                            <br />
                                            Al marcar como "En Evaluación", el vendedor sabrá que estás considerando la propuesta y nos comunicaremos
                                            contigo para resolver cualquier duda.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleInReview} className="bg-yellow-600 hover:bg-yellow-700">
                                            Sí, poner en evaluación
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </div>

                {!isInReview && (
                    <p className="mt-4 text-center text-xs text-gray-500">
                        Si tienes dudas o necesitas hacer modificaciones, contáctanos directamente.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
