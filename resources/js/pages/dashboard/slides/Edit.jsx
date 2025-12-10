import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import SlideForm from './components/SlideForm';

const breadcrumbs = [
    {
        title: 'Slides',
        href: '/dashboard/slides',
    },
    {
        title: 'Editar Slide',
        href: '#',
    },
];

export default function Edit({ slide, canActivate, activeCount, maxActive }) {
    const { data, setData, processing, errors, progress } = useForm({
        title: slide.title || '',
        image_desktop: null, // Solo se envía si hay nueva imagen
        image_mobile: null, // Solo se envía si hay nueva imagen
        link: slide.link || '',
        is_active: slide.is_active ?? false,
        sort_order: slide.sort_order ?? 0,
    });

    const { handleResponse } = useInertiaResponse();

    const handleSubmit = (e) => {
        e.preventDefault();

        // Preparar datos para enviar (excluir imágenes null)
        const formData = {
            _method: 'PUT',
            title: data.title,
            link: data.link || '',
            is_active: data.is_active ? '1' : '0', // Convertir a string que Laravel entiende
            sort_order: data.sort_order,
        };

        // Solo incluir imágenes si se seleccionaron nuevas
        if (data.image_desktop) {
            formData.image_desktop = data.image_desktop;
        }
        if (data.image_mobile) {
            formData.image_mobile = data.image_mobile;
        }

        router.post(route('dashboard.slides.update', slide.id), formData, {
            forceFormData: true,
            ...handleResponse(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Slide - ${slide.title}`} />

            <SlideForm
                data={data}
                setData={setData}
                handleSubmit={handleSubmit}
                processing={processing}
                errors={errors}
                progress={progress}
                isEditing={true}
                slide={slide}
                canActivate={canActivate}
                activeCount={activeCount}
                maxActive={maxActive}
            />
        </AppLayout>
    );
}
