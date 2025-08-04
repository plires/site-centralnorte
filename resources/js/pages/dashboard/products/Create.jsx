import ProductForm from '@/components/ProductForm';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs = [
    {
        title: 'Productos',
        href: '/dashboard/products',
    },
    {
        title: 'Crear Producto',
        href: '#',
    },
];

export default function Create({ categories }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        sku: '',
        name: '',
        description: '',
        proveedor: '',
        category_id: '',
    });

    const { handleResponse } = useInertiaResponse();

    const handleSubmit = (e) => {
        e.preventDefault();
        post(
            route('dashboard.products.store'),
            handleResponse(() => {
                // Callback de éxito: limpiar formulario
                reset();
            }),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Producto" />
            <ProductForm
                data={data}
                setData={setData}
                handleSubmit={handleSubmit}
                processing={processing}
                errors={errors}
                categories={categories}
                isEditing={false}
            />
        </AppLayout>
    );
}
