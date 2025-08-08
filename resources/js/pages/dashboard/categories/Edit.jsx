import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import CategoryForm from './components/CategoryForm';

const breadcrumbs = [
    {
        title: 'Categorías',
        href: '/dashboard/categorias',
    },
    {
        title: 'Editar Categoría',
        href: '/dashboard/categorias/edit',
    },
];

export default function Edit({ category }) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name || '',
        description: category.description || '',
    });

    const { handleResponse } = useInertiaResponse();

    const handleSubmit = (e) => {
        e.preventDefault();

        put(route('dashboard.categories.update', category.id), handleResponse());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Categoría - ${category.name}`} />

            <CategoryForm data={data} setData={setData} handleSubmit={handleSubmit} processing={processing} errors={errors} isEditing={true} />
        </AppLayout>
    );
}
