import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { AlertTriangle, Copy, Edit, ExternalLink, Mail, Package, Send, Trash2 } from 'lucide-react';

export default function BudgetActionsSection({ budget }) {
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date));
    };

    const handleEdit = () => {
        router.visit(route('dashboard.budgets.edit', budget.id));
    };

    const handleDuplicate = () => {
        router.visit(route('dashboard.budgets.duplicate', budget.id));
    };

    const handleSendEmail = () => {
        if (confirm('¿Estás seguro de que quieres enviar este presupuesto por email al cliente?')) {
            router.post(
                route('dashboard.budgets.send-email', budget.id),
                {},
                {
                    onSuccess: () => {
                        alert('Email enviado exitosamente');
                    },
                    onError: (errors) => {
                        alert('Error al enviar el email: ' + (errors.message || 'Error desconocido'));
                    },
                },
            );
        }
    };

    const handleDelete = () => {
        if (confirm('¿Estás seguro de que quieres eliminar este presupuesto? Esta acción no se puede deshacer.')) {
            router.delete(route('dashboard.budgets.destroy', budget.id), {
                onSuccess: () => {
                    router.visit(route('dashboard.budgets.index'));
                },
            });
        }
    };

    const handleViewPublic = () => {
        const publicUrl = route('public.budget.show', budget.id);
        window.open(publicUrl, '_blank');
    };

    return (
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

                    <Button onClick={handleSendEmail} variant="outline" size="sm" disabled={!budget.client?.email}>
                        <Send className="mr-2 h-4 w-4" />
                        {budget.email_sent ? 'Reenviar Email' : 'Enviar Email'}
                    </Button>

                    <Button onClick={handleViewPublic} variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver Vista Pública
                    </Button>

                    <Button onClick={handleDelete} variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                    </Button>
                </div>

                {budget.email_sent && (
                    <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3">
                        <p className="text-sm text-green-800">
                            <Mail className="mr-1 inline h-4 w-4" />
                            Email enviado el {formatDate(budget.email_sent_at)}
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
    );
}
