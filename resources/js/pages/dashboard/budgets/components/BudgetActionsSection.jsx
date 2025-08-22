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
import { router } from '@inertiajs/react';
import { AlertTriangle, Copy, Edit, ExternalLink, Mail, Package, Send } from 'lucide-react';
import { useState } from 'react';

export default function BudgetActionsSection({ budget }) {
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

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
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button onClick={handleEdit} variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Button>

                        <Button onClick={handleDuplicate} variant="outline" size="sm">
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                        </Button>

                        {/* AlertDialog para envío de email */}
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
                                        <Mail className="h-5 w-5 text-blue-600" />
                                        {budget.email_sent ? 'Reenviar Email' : 'Enviar Email'}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {budget.email_sent
                                            ? `¿Estás seguro de que quieres reenviar este presupuesto por email a ${budget.client?.name}?`
                                            : `¿Estás seguro de que quieres enviar este presupuesto por email a ${budget.client?.name}?`}
                                        <br />
                                        <span className="text-sm text-gray-600">Email: {budget.client?.email}</span>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleSendEmailConfirm} className="bg-blue-600 hover:bg-blue-700">
                                        <Send className="mr-2 h-4 w-4" />
                                        {budget.email_sent ? 'Reenviar' : 'Enviar'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button onClick={handleViewPublic} variant="outline" size="sm">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver Vista Pública
                        </Button>
                    </div>

                    {budget.email_sent && budget.email_sent_at_formatted && (
                        <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3">
                            <p className="text-sm text-green-800">
                                <Mail className="mr-1 inline h-4 w-4" />
                                Email enviado el {budget.email_sent_at_formatted}
                            </p>
                        </div>
                    )}

                    {!budget.client?.email && (
                        <div className="mt-3 rounded-md border border-yellow-200 bg-yellow-50 p-3">
                            <p className="text-sm text-yellow-800">
                                <AlertTriangle className="mr-1 inline h-4 w-4" />
                                El cliente no tiene email configurado
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
