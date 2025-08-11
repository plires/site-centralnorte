import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import BudgetForm from './components/BudgetForm';

const breadcrumbs = [
    { title: 'Presupuestos', href: '/dashboard/budgets' },
    { title: 'Editar Presupuesto', href: '#' },
];

export default function Edit({ budget }) {
    const { data, setData, put, processing, errors } = useForm({
        title: budget.title || '',
        client_id: budget.client_id?.toString() || '',
        issue_date: budget.issue_date || '',
        expiry_date: budget.expiry_date || '',
        footer_comments: budget.footer_comments || '',
        is_active: budget.is_active ?? true,
        items:
            budget.items?.map((item) => ({
                id: item.id,
                product_id: item.product_id?.toString(),
                quantity: item.quantity,
                unit_price: item.unit_price,
                production_time_days: item.production_time_days || '',
                logo_printing: item.logo_printing || '',
                is_variant: item.is_variant || false,
                variant_group: item.variant_group || '',
                // Datos del producto para mostrar en el formulario
                product: item.product
                    ? {
                          id: item.product.id,
                          name: item.product.name,
                          sku: item.product.sku,
                          last_price: item.product.last_price,
                          category: item.product.category?.name || 'Sin categoría',
                          featured_image: item.product.featured_image?.full_url || null,
                      }
                    : null,
            })) || [],
    });

    const { handleResponse } = useInertiaResponse();

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar que haya al menos un item
        if (data.items.length === 0) {
            alert('Debe agregar al menos un producto al presupuesto');
            return;
        }

        put(route('dashboard.budgets.update', budget.id), handleResponse());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Presupuesto - ${budget.title}`} />
            <BudgetForm
                data={data}
                setData={setData}
                handleSubmit={handleSubmit}
                processing={processing}
                errors={errors}
                isEditing={true}
                budget={budget}
            />
        </AppLayout>
    );
}
