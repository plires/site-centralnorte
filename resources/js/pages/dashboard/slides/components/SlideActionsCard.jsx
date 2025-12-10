import ButtonCustom from '@/components/ButtonCustom';
import { useDeleteConfirmation } from '@/components/DeleteConfirmationDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import { router } from '@inertiajs/react';
import { Edit, Power, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function SlideActionsCard({ slide }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { confirmDelete, DeleteConfirmationDialog } = useDeleteConfirmation();

    const handleDelete = async () => {
        const confirmed = await confirmDelete({
            title: 'Eliminar slide',
            description: 'Esta acción no se puede deshacer. El slide y sus imágenes serán eliminados permanentemente.',
            itemName: slide.title,
        });

        if (confirmed) {
            setIsDeleting(true);
            router.delete(route('dashboard.slides.destroy', slide.id), handleCrudResponse(setIsDeleting));
        }
    };

    const { handleCrudResponse } = useInertiaResponse();

    const handleToggleStatus = () => {
        router.patch(route('dashboard.slides.toggle-status', slide.id), {}, handleCrudResponse());
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Acciones</CardTitle>
                    <CardDescription>Operaciones disponibles</CardDescription>
                </CardHeader>
                <CardContent>
                    <ButtonCustom route={route('dashboard.slides.edit', slide.id)} variant="primary" size="md">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Slide
                    </ButtonCustom>

                    <ButtonCustom className="mx-5" onClick={handleToggleStatus} variant="outline" size="md">
                        <Power className="mr-2 h-4 w-4" />
                        {slide.is_active ? 'Desactivar' : 'Activar'}
                    </ButtonCustom>

                    <ButtonCustom onClick={handleDelete} variant="destructive" size="md" disabled={isDeleting}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                    </ButtonCustom>
                </CardContent>
            </Card>
            <DeleteConfirmationDialog />
        </>
    );
}
