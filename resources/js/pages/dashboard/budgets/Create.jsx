import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import BudgetForm from './components/BudgetForm';

const breadcrumbs = [
    {
        title: 'Presupuestos',
        href: '/dashboard/budgets',
    },
    {
        title: 'Crear Presupuesto',
        href: '#',
    },
];

export default function Create({ clients, products, user, businessConfig, budget = null }) {
    const isEditing = !!budget;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: budget?.title || '',
        client_id: budget?.client_id?.toString() || '',
        issue_date: budget?.issue_date || new Date().toISOString().split('T')[0],
        expiry_date: budget?.expiry_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        send_email_to_client: budget?.send_email_to_client || false,
        footer_comments: budget?.footer_comments || '',
        items: budget?.items || [],
    });

    const { handleResponse } = useInertiaResponse();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(
                route('dashboard.budgets.update', budget.id),
                handleResponse(() => {
                    // Callback de éxito para edición
                }),
            );
        } else {
            post(
                route('dashboard.budgets.store'),
                handleResponse(() => {
                    // Callback de éxito para creación
                    reset();
                }),
            );
        }
    };

    const updatedBreadcrumbs = isEditing
        ? [
              ...breadcrumbs.slice(0, -1),
              {
                  title: `Editar - ${budget.title}`,
                  href: '#',
              },
          ]
        : breadcrumbs;

    return (
        <AppLayout breadcrumbs={updatedBreadcrumbs}>
            <Head title={isEditing ? `Editar Presupuesto - ${budget.title}` : 'Crear Presupuesto'} />

            <BudgetForm
                data={data}
                setData={setData}
                handleSubmit={handleSubmit}
                processing={processing}
                errors={errors}
                clients={clients}
                products={products}
                user={user}
                businessConfig={businessConfig}
                isEditing={isEditing}
                originalBudget={budget}
            />
        </AppLayout>
    );
}
