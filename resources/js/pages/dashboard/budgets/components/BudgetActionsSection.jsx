// resources/js/pages/dashboard/budgets/components/BudgetActionsSection.jsx

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { router } from '@inertiajs/react';
import { 
    AlertTriangle, 
    Copy, 
    Edit, 
    ExternalLink, 
    Mail, 
    Package, 
    Send,
    FileEdit,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Loader2
} from 'lucide-react';
import { useState } from 'react';
import BudgetStatusBadge, { budgetStatusOptions, isEditableStatus, canSendStatus, isPubliclyVisibleStatus } from '@/components/BudgetStatusBadge';

export default function BudgetActionsSection({ budget, statuses = [] }) {
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);

    const handleEdit = () => {
        router.visit(route('dashboard.budgets.edit', budget.id));
    };

    const handleDuplicate = () => {
        router.visit(route('dashboard.budgets.duplicate', budget.id));
    };

    const handleSendEmailConfirm = () => {
        setIsEmailDialogOpen(false);

        router.post(
            route('dashboard.budgets.send-email', budget.id),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const handleStatusChange = (newStatus) => {
        if (newStatus === budget.status) return;
        setPendingStatus(newStatus);
        setShowStatusConfirm(true);
    };

    const confirmStatusChange = () => {
        setIsUpdatingStatus(true);
        setShowStatusConfirm(false);

        router.patch(
            route('dashboard.budgets.update-status', budget.id),
            { status: pendingStatus },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsUpdatingStatus(false);
                    setPendingStatus(null);
                },
            },
        );
    };

    const handleViewPublic = () => {
        const publicUrl = route('public.budget.show', budget.token);
        window.open(publicUrl, '_blank');
    };

    // Verificar si se puede enviar email
    const canSendEmail = canSendStatus(budget.status) || budget.status === 'sent';
    const isEditable = isEditableStatus(budget.status);
    const isPubliclyVisible = isPubliclyVisibleStatus(budget.status);

    // Obtener etiqueta del estado
    const getStatusLabel = (status) => {
        const option = budgetStatusOptions.find(o => o.value === status);
        return option?.label || status;
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Acciones
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Botones de acción principales */}
                    <div className="flex flex-wrap gap-2">
                        {/* Editar - Solo si es editable */}
                        <Button 
                            onClick={handleEdit} 
                            variant={isEditable ? "default" : "outline"} 
                            size="sm"
                            disabled={!isEditable}
                            title={!isEditable ? "Solo se pueden editar presupuestos sin enviar o en borrador" : ""}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Button>

                        {/* Duplicar - Siempre disponible */}
                        <Button onClick={handleDuplicate} variant="outline" size="sm">
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                        </Button>

                        {/* Enviar/Reenviar Email */}
                        {canSendEmail && (
                            <AlertDialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        {budget.email_sent ? (
                                            <>
                                                <Mail className="mr-2 h-4 w-4" />
                                                Reenviar Email
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Enviar Email
                                            </>
                                        )}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            {budget.email_sent ? 'Reenviar presupuesto' : 'Enviar presupuesto'}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {budget.email_sent ? (
                                                <>
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
                                                    . ¿Deseas reenviar a <strong>{budget.client?.email}</strong>?
                                                </>
                                            ) : (
                                                <>
                                                    ¿Estás seguro de que quieres enviar el email del presupuesto a{' '}
                                                    <strong>{budget.client?.email}</strong>?
                                                    <br />
                                                    <br />
                                                    El cliente recibirá un link para visualizar el presupuesto online.
                                                    {budget.status !== 'sent' && (
                                                        <span className="block mt-2 text-blue-600">
                                                            El estado del presupuesto cambiará a "Enviado".
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                            {!budget.client?.email && (
                                                <div className="mt-3 flex items-center gap-2 text-amber-600">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    El cliente no tiene email configurado.
                                                </div>
                                            )}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction 
                                            onClick={handleSendEmailConfirm}
                                            disabled={!budget.client?.email}
                                        >
                                            {budget.email_sent ? 'Reenviar' : 'Enviar'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}

                        {/* Ver público - Solo si está enviado */}
                        <Button 
                            onClick={handleViewPublic} 
                            variant="outline" 
                            size="sm"
                            disabled={!isPubliclyVisible}
                            title={!isPubliclyVisible ? "El presupuesto debe estar enviado para ser visible públicamente" : ""}
                        >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver Público
                        </Button>
                    </div>

                    <Separator />

                    {/* Control de Estado */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-sm font-medium">
                                    Estado del Presupuesto
                                </Label>
                                <p className="text-muted-foreground text-sm">
                                    Cambia el estado para controlar la visibilidad y acciones disponibles
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Select
                                    value={budget.status}
                                    onValueChange={handleStatusChange}
                                    disabled={isUpdatingStatus}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        {isUpdatingStatus ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Actualizando...</span>
                                            </div>
                                        ) : (
                                            <SelectValue>
                                                <BudgetStatusBadge status={budget.status} size="sm" />
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
                            </div>
                        </div>

                        {/* Información contextual según el estado */}
                        <div className="rounded-lg bg-gray-50 p-3 text-sm">
                            {budget.status === 'unsent' && (
                                <p className="text-gray-600">
                                    <FileEdit className="inline h-4 w-4 mr-1" />
                                    El presupuesto aún no ha sido enviado al cliente. Puedes editarlo libremente.
                                </p>
                            )}
                            {budget.status === 'draft' && (
                                <p className="text-gray-600">
                                    <FileText className="inline h-4 w-4 mr-1" />
                                    Este es un borrador (copia de otro presupuesto). Puedes editarlo antes de enviarlo.
                                </p>
                            )}
                            {budget.status === 'sent' && (
                                <p className="text-blue-600">
                                    <Send className="inline h-4 w-4 mr-1" />
                                    El presupuesto está visible para el cliente. Puede aprobarlo o rechazarlo.
                                </p>
                            )}
                            {budget.status === 'approved' && (
                                <p className="text-green-600">
                                    <CheckCircle className="inline h-4 w-4 mr-1" />
                                    ¡El cliente aprobó este presupuesto! Coordina los siguientes pasos.
                                </p>
                            )}
                            {budget.status === 'rejected' && (
                                <p className="text-red-600">
                                    <XCircle className="inline h-4 w-4 mr-1" />
                                    El cliente rechazó este presupuesto. Puedes duplicarlo y hacer una nueva propuesta.
                                </p>
                            )}
                            {budget.status === 'expired' && (
                                <p className="text-orange-600">
                                    <Clock className="inline h-4 w-4 mr-1" />
                                    Este presupuesto venció. Puedes duplicarlo para crear uno nuevo con fechas actualizadas.
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog de confirmación de cambio de estado */}
            <AlertDialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Cambiar estado del presupuesto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás por cambiar el estado de{' '}
                            <strong>{getStatusLabel(budget.status)}</strong> a{' '}
                            <strong>{getStatusLabel(pendingStatus)}</strong>.
                            {pendingStatus === 'sent' && (
                                <span className="block mt-2 text-blue-600">
                                    Esto hará el presupuesto visible para el cliente.
                                </span>
                            )}
                            {pendingStatus === 'expired' && (
                                <span className="block mt-2 text-orange-600">
                                    El cliente ya no podrá ver el presupuesto.
                                </span>
                            )}
                            {pendingStatus === 'approved' && (
                                <span className="block mt-2 text-green-600">
                                    Esto marcará el presupuesto como aprobado manualmente.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUpdatingStatus}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmStatusChange}
                            disabled={isUpdatingStatus}
                        >
                            {isUpdatingStatus ? (
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
