import ActionsDropdown from '@/components/ActionsDropdown';
import ButtonCustom from '@/components/ButtonCustom';
import { useDeleteConfirmation } from '@/components/DeleteConfirmationDialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { GripVertical, Images, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs = [
    {
        title: 'Slides',
        href: '/dashboard/slides',
    },
];

export default function Index({ auth, slides, filters = {}, stats }) {
    const lastFlashRef = useRef(null);
    const { confirmDelete, DeleteConfirmationDialog } = useDeleteConfirmation();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    const { handleCrudResponse } = useInertiaResponse();

    // Estado local para drag & drop
    const [localSlides, setLocalSlides] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);

    // Obtener flash messages desde usePage
    const { props } = usePage();

    // Inicializar slides locales
    useEffect(() => {
        const slidesData = slides.data || slides;
        setLocalSlides(slidesData);
    }, [slides]);

    // Interceptar flash messages (para cuando se redirige desde otra página, ej: Show.jsx)
    useEffect(() => {
        const flash = props.flash;
        if (!flash) return;

        // creamos una “firma” del contenido actual del flash
        const signature = JSON.stringify(flash);

        // si es igual al anterior, no mostramos nada
        if (signature === lastFlashRef.current) {
            return;
        }

        // guardamos la firma actual
        lastFlashRef.current = signature;

        const flashSuccess = flash.success;
        const flashError = flash.error;
        const flashWarning = flash.warning;
        const flashInfo = flash.info;

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

    // Handlers de drag & drop
    const handleDragStart = (e, index) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
        // Agregar clase visual al elemento arrastrado
        e.target.classList.add('opacity-50');
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('opacity-50');
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedItem !== index) {
            setDragOverItem(index);
        }
    };

    const handleDragLeave = () => {
        setDragOverItem(null);
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();

        if (draggedItem === null || draggedItem === dropIndex) {
            setDragOverItem(null);
            return;
        }

        // Reordenar localmente
        const newSlides = [...localSlides];
        const draggedSlide = newSlides[draggedItem];

        // Remover el elemento arrastrado
        newSlides.splice(draggedItem, 1);
        // Insertar en la nueva posición
        newSlides.splice(dropIndex, 0, draggedSlide);

        // Actualizar estado local inmediatamente para feedback visual
        setLocalSlides(newSlides);
        setDragOverItem(null);

        // Preparar datos para el backend
        const slidesOrder = newSlides.map((slide, index) => ({
            id: slide.id,
            sort_order: index + 1,
        }));

        // Enviar al backend
        setIsReordering(true);
        router.post(
            route('dashboard.slides.update-order'),
            { slides: slidesOrder },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Orden actualizado correctamente.');
                    setIsReordering(false);
                },
                onError: () => {
                    toast.error('Error al actualizar el orden.');
                    // Revertir cambios locales
                    setLocalSlides(slides.data || slides);
                    setIsReordering(false);
                },
            },
        );
    };

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
                                    <p className="text-sm text-gray-500">Arrastra y suelta los slides para reordenarlos</p>
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

                            {/* Tabla con drag & drop */}
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12"></TableHead>
                                            <TableHead className="w-16">Orden</TableHead>
                                            <TableHead className="w-24">Preview</TableHead>
                                            <TableHead>Título</TableHead>
                                            <TableHead className="hidden md:table-cell">Enlace</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {localSlides.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                                                    No se encontraron slides.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            localSlides.map((slide, index) => (
                                                <TableRow
                                                    key={slide.id}
                                                    draggable={!isReordering}
                                                    onDragStart={(e) => handleDragStart(e, index)}
                                                    onDragEnd={handleDragEnd}
                                                    onDragOver={(e) => handleDragOver(e, index)}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={(e) => handleDrop(e, index)}
                                                    className={`cursor-grab transition-colors active:cursor-grabbing ${dragOverItem === index ? 'border-t-2 border-blue-400 bg-blue-50' : ''} ${isReordering ? 'pointer-events-none opacity-50' : ''} `}
                                                >
                                                    {/* Grip handle */}
                                                    <TableCell className="w-12">
                                                        <div className="flex items-center justify-center text-gray-400 hover:text-gray-600">
                                                            <GripVertical className="h-5 w-5" />
                                                        </div>
                                                    </TableCell>

                                                    {/* Orden */}
                                                    <TableCell>
                                                        <span className="font-mono text-sm text-gray-500">#{slide.sort_order}</span>
                                                    </TableCell>

                                                    {/* Preview */}
                                                    <TableCell>
                                                        {slide.image_desktop_url ? (
                                                            <img
                                                                src={slide.image_desktop_url}
                                                                alt={slide.title}
                                                                className="h-12 w-20 rounded border object-cover"
                                                                draggable={false}
                                                            />
                                                        ) : (
                                                            <div className="flex h-12 w-20 items-center justify-center rounded border bg-gray-100">
                                                                <Images className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </TableCell>

                                                    {/* Título */}
                                                    <TableCell>
                                                        <span className="font-medium">{slide.title}</span>
                                                    </TableCell>

                                                    {/* Enlace */}
                                                    <TableCell className="hidden md:table-cell">
                                                        {slide.link ? (
                                                            <span className="max-w-[200px] truncate text-sm text-blue-600">{slide.link}</span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">Sin enlace</span>
                                                        )}
                                                    </TableCell>

                                                    {/* Estado */}
                                                    <TableCell>
                                                        <Badge variant={slide.is_active ? 'success' : 'secondary'}>
                                                            {slide.is_active ? 'Activo' : 'Inactivo'}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Acciones */}
                                                    <TableCell className="text-center">
                                                        <ActionsDropdown row={slide} actions={actions} isDeleting={isDeleting} />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {isReordering && <div className="mt-2 text-center text-sm text-gray-500">Guardando nuevo orden...</div>}
                        </div>
                    </div>
                </div>
            </div>

            <DeleteConfirmationDialog />
        </AppLayout>
    );
}
