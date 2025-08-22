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
import { Switch } from '@/components/ui/switch';
import { router } from '@inertiajs/react';
import { AlertTriangle, Copy, Edit, ExternalLink, Mail, Package, Power, Send } from 'lucide-react';
import { useState } from 'react';

export default function BudgetActionsSection({ budget }) {
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);

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
                onSuccess: () => {
                    // El toast se maneja desde Show.jsx con los flash messages
                },
                onError: (errors) => {
                    // El toast se maneja desde Show.jsx con los flash messages
                },
            },
        );
    };

    const handleToggleStatus = (checked) => {
        setIsTogglingStatus(true);

        router.patch(
            route('dashboard.budgets.toggle-status', budget.id),
            {
                is_active: checked,
            },
            {
                onSuccess: () => {
                    // El toast se maneja desde Show.jsx con los flash messages
                },
                onError: (errors) => {
                    // El toast se maneja desde Show.jsx con los flash messages
                },
                onFinish: () => {
                    setIsTogglingStatus(false);
                },
            },
        );
    };

    const handleViewPublic = () => {
        const publicUrl = route('public.budget.show', budget.token);
        window.open(publicUrl, '_blank');
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
                    <div className="flex flex-wrap gap-3">
                        <Button onClick={handleEdit} variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Button>

                        <Button onClick={handleDuplicate} variant="outline" size="sm">
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                        </Button>

                        {/* Botón de reenviar email - solo se muestra si el presupuesto está activo */}
                        {budget.is_active && (
                            <AlertDialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" disabled={!budget.client?.email}>
                                        <Send className="mr-2 h-4 w-4" />
                                        {budget.email_sent ? 'Reenviar Email' : 'Enviar Email'}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2">
                                            <Mail className="h-5 w-5" />
                                            {budget.email_sent ? 'Reenviar Email' : 'Enviar Email'}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {budget.email_sent ? (
                                                <>
                                                    ¿Estás seguro de que quieres reenviar el email del presupuesto a{' '}
                                                    <strong>{budget.client?.email}</strong>?
                                                    <br />
                                                    <br />
                                                    El cliente recibirá nuevamente el link para visualizar el presupuesto.
                                                </>
                                            ) : (
                                                <>
                                                    ¿Estás seguro de que quieres enviar el email del presupuesto a{' '}
                                                    <strong>{budget.client?.email}</strong>?
                                                    <br />
                                                    <br />
                                                    El cliente recibirá un link para visualizar el presupuesto online.
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
                                        <AlertDialogAction onClick={handleSendEmailConfirm}>
                                            {budget.email_sent ? 'Reenviar' : 'Enviar'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}

                        <Button onClick={handleViewPublic} variant="outline" size="sm">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver Público
                        </Button>
                    </div>

                    {/* Separador visual */}
                    <div className="border-t pt-6">
                        {/* Switch para activar/desactivar presupuesto */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label htmlFor="budget-status" className="text-sm font-medium">
                                    Estado del Presupuesto
                                </Label>
                                <p className="text-muted-foreground text-sm">
                                    {budget.is_active
                                        ? 'El presupuesto está activo y visible para el cliente'
                                        : 'El presupuesto está inactivo y no se puede enviar por email'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Power className={`h-4 w-4 ${budget.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                                    <span className={`text-sm font-medium ${budget.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                                        {budget.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <Switch
                                    id="budget-status"
                                    checked={budget.is_active}
                                    onCheckedChange={handleToggleStatus}
                                    disabled={isTogglingStatus}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
