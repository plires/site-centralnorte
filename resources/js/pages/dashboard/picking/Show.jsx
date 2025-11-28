// resources/js/pages/dashboard/picking/Show.jsx

import ButtonCustom from '@/components/ButtonCustom';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
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
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { 
    FileText, 
    Mail, 
    Download, 
    Copy, 
    Edit, 
    Trash2,
    Package,
    User,
    Calendar,
    DollarSign,
    Clock,
    Box
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs = [
    {
        title: 'Presupuestos de Picking',
        href: '/dashboard/picking',
    },
    {
        title: 'Detalles del Presupuesto',
        href: '#',
    },
];

// Badge de estado
const StatusBadge = ({ status }) => {
    const variants = {
        draft: { label: 'Borrador', class: 'bg-gray-100 text-gray-800' },
        sent: { label: 'Enviado', class: 'bg-blue-100 text-blue-800' },
        approved: { label: 'Aprobado', class: 'bg-green-100 text-green-800' },
        rejected: { label: 'Rechazado', class: 'bg-red-100 text-red-800' },
        expired: { label: 'Vencido', class: 'bg-orange-100 text-orange-800' },
    };

    const variant = variants[status] || variants.draft;

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${variant.class}`}>
            {variant.label}
        </span>
    );
};

export default function Show({ auth, budget }) {
    const { props } = usePage();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showSendDialog, setShowSendDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
        if (props.flash?.error) {
            toast.error(props.flash.error);
        }
    }, [props.flash]);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('dashboard.picking.budgets.destroy', budget.id), {
            onSuccess: () => {
                toast.success('Presupuesto eliminado correctamente');
                router.visit(route('dashboard.picking.budgets.index'));
            },
            onError: () => {
                toast.error('Error al eliminar el presupuesto');
                setIsDeleting(false);
            },
            onFinish: () => {
                setShowDeleteDialog(false);
                setIsDeleting(false);
            },
        });
    };

    const handleSend = () => {
        if (!budget.client_email) {
            toast.error('El presupuesto no tiene un email de cliente asociado');
            setShowSendDialog(false);
            return;
        }

        setIsSending(true);
        router.post(route('dashboard.picking.budgets.send', budget.id), {}, {
            onSuccess: () => {
                toast.success('Presupuesto enviado correctamente');
            },
            onError: () => {
                toast.error('Error al enviar el presupuesto');
            },
            onFinish: () => {
                setShowSendDialog(false);
                setIsSending(false);
            },
        });
    };

    const handleDownload = () => {
        window.location.href = route('dashboard.picking.budgets.pdf', budget.id);
    };

    const handleDuplicate = () => {
        router.post(route('dashboard.picking.budgets.duplicate', budget.id));
    };

    const canEdit = budget.status === 'draft';
    const canDelete = budget.status === 'draft';

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
            <Head title={`Presupuesto ${budget.budget_number}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header con acciones */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Presupuesto {budget.budget_number}
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Detalles del presupuesto de picking / armado de kits
                            </p>
                        </div>
                        <StatusBadge status={budget.status} />
                    </div>

                    {/* Botones de acción */}
                    <div className="mb-6 flex flex-wrap gap-2">
                        {canEdit && (
                            <ButtonCustom
                                variant="primary"
                                size="sm"
                                onClick={() => router.visit(route('dashboard.picking.budgets.edit', budget.id))}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </ButtonCustom>
                        )}
                        
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar PDF
                        </Button>

                        {budget.client_email && (
                            <Button variant="outline" size="sm" onClick={() => setShowSendDialog(true)}>
                                <Mail className="mr-2 h-4 w-4" />
                                Enviar por Email
                            </Button>
                        )}

                        <Button variant="outline" size="sm" onClick={handleDuplicate}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                        </Button>

                        {canDelete && (
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </Button>
                        )}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Información del cliente */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <User className="mr-2 h-5 w-5 text-gray-500" />
                                    Información del Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Nombre</p>
                                    <p className="text-gray-900">{budget.client_name}</p>
                                </div>
                                {budget.client_email && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email</p>
                                        <p className="text-gray-900">{budget.client_email}</p>
                                    </div>
                                )}
                                {budget.client_phone && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Teléfono</p>
                                        <p className="text-gray-900">{budget.client_phone}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Vendedor</p>
                                    <p className="text-gray-900">{budget.vendor.name}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Información del presupuesto */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <FileText className="mr-2 h-5 w-5 text-gray-500" />
                                    Información del Presupuesto
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Fecha de creación</p>
                                    <p className="text-gray-900">
                                        {new Date(budget.created_at).toLocaleDateString('es-AR')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Válido hasta</p>
                                    <p className="text-gray-900">
                                        {new Date(budget.valid_until).toLocaleDateString('es-AR')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Tiempo de producción</p>
                                    <p className="text-gray-900">{budget.production_time}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cantidades */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <Package className="mr-2 h-5 w-5 text-gray-500" />
                                    Cantidades
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total de kits</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {budget.total_kits.toLocaleString('es-AR')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Componentes por kit</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {budget.total_components_per_kit}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Incremento por componentes</p>
                                    <p className="text-gray-900">
                                        {budget.component_increment_description} - {' '}
                                        {(budget.component_increment_percentage * 100).toFixed(0)}%
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Caja seleccionada */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <Box className="mr-2 h-5 w-5 text-gray-500" />
                                    Caja Seleccionada
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Dimensiones</p>
                                    <p className="text-gray-900">{budget.box_dimensions}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Costo unitario</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {new Intl.NumberFormat('es-AR', {
                                            style: 'currency',
                                            currency: 'ARS',
                                        }).format(budget.box_cost)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Servicios */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Servicios Incluidos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-gray-50 text-xs uppercase text-gray-700">
                                        <tr>
                                            <th className="px-4 py-3">Servicio</th>
                                            <th className="px-4 py-3 text-right">Cant.</th>
                                            <th className="px-4 py-3 text-right">Costo Unit.</th>
                                            <th className="px-4 py-3 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {budget.services.map((service, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3">{service.service_description}</td>
                                                <td className="px-4 py-3 text-right">{service.quantity}</td>
                                                <td className="px-4 py-3 text-right">
                                                    {new Intl.NumberFormat('es-AR', {
                                                        style: 'currency',
                                                        currency: 'ARS',
                                                    }).format(service.unit_cost)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    {new Intl.NumberFormat('es-AR', {
                                                        style: 'currency',
                                                        currency: 'ARS',
                                                    }).format(service.subtotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Totales */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                                <DollarSign className="mr-2 h-5 w-5 text-gray-500" />
                                Totales
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <p className="text-gray-600">Subtotal de servicios:</p>
                                <p className="font-medium">
                                    {new Intl.NumberFormat('es-AR', {
                                        style: 'currency',
                                        currency: 'ARS',
                                    }).format(budget.services_subtotal)}
                                </p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-gray-600">
                                    Incremento por componentes ({(budget.component_increment_percentage * 100).toFixed(0)}%):
                                </p>
                                <p className="font-medium">
                                    {new Intl.NumberFormat('es-AR', {
                                        style: 'currency',
                                        currency: 'ARS',
                                    }).format(budget.component_increment_amount)}
                                </p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-gray-600">Subtotal con incremento:</p>
                                <p className="font-medium">
                                    {new Intl.NumberFormat('es-AR', {
                                        style: 'currency',
                                        currency: 'ARS',
                                    }).format(budget.subtotal_with_increment)}
                                </p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-gray-600">Caja:</p>
                                <p className="font-medium">
                                    {new Intl.NumberFormat('es-AR', {
                                        style: 'currency',
                                        currency: 'ARS',
                                    }).format(budget.box_total)}
                                </p>
                            </div>
                            <div className="flex justify-between border-t pt-3">
                                <p className="text-xl font-bold text-gray-900">Total:</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {new Intl.NumberFormat('es-AR', {
                                        style: 'currency',
                                        currency: 'ARS',
                                    }).format(budget.total)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notas */}
                    {budget.notes && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Notas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-gray-700">{budget.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Dialog de confirmación de envío */}
            <AlertDialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Enviar presupuesto por email</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se enviará el presupuesto a <strong>{budget.client_email}</strong> con un PDF adjunto.
                            ¿Deseas continuar?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSend} disabled={isSending}>
                            {isSending ? 'Enviando...' : 'Enviar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog de confirmación de eliminación */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El presupuesto {budget.budget_number} será eliminado
                            permanentemente del sistema.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600">
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
