import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import ProductForm from './components/ProductForm';

const breadcrumbs = [
    { title: 'Productos', href: '/dashboard/products' },
    { title: 'Editar Producto', href: '#' },
];

export default function Edit({ product, categories, selected_category_ids }) {
    const { data, setData, put, processing, errors } = useForm({
        sku: product.sku || '',
        name: product.name || '',
        description: product.description || '',
        proveedor: product.proveedor || '',
        category_ids: selected_category_ids || [],
        attributes: product.attributes || [],
        variants: product.variants || [],
    });

    const { handleResponse } = useInertiaResponse();

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('dashboard.products.update', product.id), handleResponse());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Producto - ${product.name}`} />
            <ProductForm
                data={data}
                setData={setData}
                handleSubmit={handleSubmit}
                processing={processing}
                errors={errors}
                categories={categories}
                isEditing={true}
            />
        </AppLayout>
    );
}
