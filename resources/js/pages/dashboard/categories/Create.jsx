import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import CategoryForm from './components/CategoryForm';

const breadcrumbs = [
    {
        title: 'Categorías de Productos',
        href: '/dashboard/productos/categorias',
    },
    {
        title: 'Crear Categoría',
        href: '#',
    },
];

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        show: true,
    });

    const { handleResponse } = useInertiaResponse();

    const handleSubmit = (e) => {
        e.preventDefault();
        post(
            route('dashboard.categories.store'),
            handleResponse(() => {
                // Callback de éxito: limpiar formulario
                reset();
            }),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Categoría" />

            <CategoryForm data={data} setData={setData} handleSubmit={handleSubmit} processing={processing} errors={errors} isEditing={false} />
        </AppLayout>
    );
}
