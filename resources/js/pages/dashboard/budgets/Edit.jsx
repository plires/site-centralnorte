import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import BudgetForm from './components/BudgetForm';

export default function Edit({ budget, clients, products, user, businessConfig }) {
    const breadcrumbs = [
        {
            title: 'Presupuestos',
            href: '/dashboard/budgets',
        },
        {
            title: `Editar - ${budget.title}`,
            href: '#',
        },
    ];

    // Formatear fechas para inputs de tipo date (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const { data, setData, put, processing, errors } = useForm({
        title: budget.title,
        client_id: budget.client_id.toString(),
        issue_date: formatDateForInput(budget.issue_date),
        expiry_date: formatDateForInput(budget.expiry_date),
        send_email_to_client: budget.send_email_to_client,
        footer_comments: budget.footer_comments || '',
        items: budget.items || [],
    });

    const { handleResponse } = useInertiaResponse();

    const handleSubmit = (e) => {
        e.preventDefault();
        put(
            route('dashboard.budgets.update', budget.id),
            handleResponse(() => {
                // Callback de éxito para edición
                console.log('Presupuesto actualizado exitosamente');
            }),
        );
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
                clients={clients}
                products={products}
                user={user}
                businessConfig={businessConfig}
                isEditing={true}
                originalBudget={budget}
            />
        </AppLayout>
    );
}
