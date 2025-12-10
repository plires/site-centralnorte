import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import SlideForm from './components/SlideForm';

const breadcrumbs = [
    {
        title: 'Slides',
        href: '/dashboard/slides',
    },
    {
        title: 'Nuevo Slide',
        href: '#',
    },
];

export default function Create({ canActivate, activeCount, maxActive }) {
    const { data, setData, post, processing, errors, progress } = useForm({
        title: '',
        image_desktop: null,
        image_mobile: null,
        link: '',
        is_active: canActivate,
    });

    const { handleResponse } = useInertiaResponse();

    const handleSubmit = (e) => {
        e.preventDefault();

        // Preparar datos con is_active como string para FormData
        const formData = {
            ...data,
            is_active: data.is_active ? '1' : '0',
        };

        post(route('dashboard.slides.store'), {
            ...handleResponse(),
            data: formData,
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Slide" />

            <SlideForm
                data={data}
                setData={setData}
                handleSubmit={handleSubmit}
                processing={processing}
                errors={errors}
                progress={progress}
                isEditing={false}
                canActivate={canActivate}
                activeCount={activeCount}
                maxActive={maxActive}
            />
        </AppLayout>
    );
}
