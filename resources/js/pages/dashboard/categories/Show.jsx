import PageHeader from '@/components/PageHeader';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

// Componentes extraídos
import CategoryActionsCard from './components/CategoryActionsCard';
import CategoryInfoCard from './components/CategoryInfoCard';
import CategoryProductsCard from './components/CategoryProductsCard';

const breadcrumbs = [
    {
        title: 'Categorías',
        href: '/dashboard/categorias',
    },
    {
        title: 'Detalles de la Categoría',
        href: '#',
    },
];

export default function Show({ category }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rol - ${category.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {/* Header con botón volver */}
                        <PageHeader backRoute={route('dashboard.categories.index')} backText="Volver" />

                        <div className="p-6">
                            {/* Grid principal con información del rol */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <CategoryInfoCard category={category} />
                                <CategoryProductsCard products={category.products} />
                            </div>

                            {/* Acciones del rol */}
                            <div className="mt-6">
                                <CategoryActionsCard categoryId={category.id} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
