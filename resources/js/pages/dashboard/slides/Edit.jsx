import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
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
        
        // Usar router.post con _method: 'PUT' para soportar archivos
        router.post(
            route('dashboard.slides.update', slide.id),
            {
                _method: 'PUT',
                ...data,
            },
            {
                forceFormData: true,
                ...handleResponse(),
            }
        );
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
