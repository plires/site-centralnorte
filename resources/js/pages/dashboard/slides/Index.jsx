import ButtonCustom from '@/components/ButtonCustom';
import DataTable from '@/components/DataTable';
import { useDeleteConfirmation } from '@/components/DeleteConfirmationDialog';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { slidesColumns } from '@/config/tableColumns';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs = [
    {
        title: 'Slides',
        href: '/dashboard/slides',
    },
];

export default function Index({ auth, slides, filters = {}, stats }) {
    const { props } = usePage();
    const { confirmDelete, DeleteConfirmationDialog } = useDeleteConfirmation();
    const [isDeleting, setIsDeleting] = useState(false);
    const { handleCrudResponse } = useInertiaResponse();

    // useEffect para interceptar flash messages
    useEffect(() => {
        const flashSuccess = props.flash?.success;
        const flashError = props.flash?.error;
        const flashWarning = props.flash?.warning;
        const flashInfo = props.flash?.info;

        if (flashSuccess) {
            toast.success(flashSuccess);
        } else if (flashError) {
            toast.error(flashError);
        } else if (flashWarning) {
            toast.warning(flashWarning);
        } else if (flashInfo) {
            toast.info(flashInfo);
        }
    }, [props.flash]);

    const handleView = (slideId) => {
        router.get(route('dashboard.slides.show', slideId));
    };

    const handleEdit = (slideId) => {
        router.get(route('dashboard.slides.edit', slideId));
    };

    const handleToggleStatus = (slideId) => {
        router.patch(route('dashboard.slides.toggle-status', slideId), {}, handleCrudResponse());
    };

    const handleDelete = async (slideId, slideTitle) => {
        const confirmed = await confirmDelete({
            title: 'Eliminar slide',
            description: 'Esta acción no se puede deshacer. El slide y sus imágenes serán eliminados permanentemente.',
            itemName: slideTitle,
        });

        if (confirmed) {
            setIsDeleting(true);
            router.delete(route('dashboard.slides.destroy', slideId), handleCrudResponse(setIsDeleting));
        }
    };

    const actions = { view: handleView, edit: handleEdit, delete: handleDelete };
    const columns = slidesColumns(actions, isDeleting);

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
            <Head title="Slides del Carrusel" />

            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total de Slides</CardDescription>
                                <CardTitle className="text-3xl">{stats.total}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Slides Activos</CardDescription>
                                <CardTitle className="text-3xl text-green-600">
                                    {stats.active} / {stats.maxActive}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Disponibles para Activar</CardDescription>
                                <CardTitle className="text-3xl">{stats.maxActive - stats.active}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium">Lista de Slides</h3>
                                    <p className="text-sm text-gray-500">Administra los slides del carrusel principal del sitio</p>
                                </div>
                                <ButtonCustom route={route('dashboard.slides.create')} variant="primary" size="md">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo Slide
                                </ButtonCustom>
                            </div>

                            {!stats.canActivateMore && (
                                <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                                    <strong>Atención:</strong> Ya tienes {stats.maxActive} slides activos. Para activar uno nuevo, primero debes
                                    desactivar uno existente.
                                </div>
                            )}

                            <DataTable
                                data={slides.data || slides}
                                columns={columns}
                                pagination={slides.links ? slides : null}
                                filters={filters}
                                searchPlaceholder="Buscar por título..."
                                emptyMessage="No se encontraron slides."
                                stats={stats}
                                onRowClick={(row) => router.visit(route('dashboard.slides.show', row.id))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <DeleteConfirmationDialog />
        </AppLayout>
    );
}
