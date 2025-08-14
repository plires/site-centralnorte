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
        title: 'Editar Presupuesto',
        href: '#',
    },
];

export default function Edit({ budget, clients, products, user }) {
    const { data, setData, put, processing, errors } = useForm({
        title: budget.title,
        client_id: budget.client_id.toString(),
        issue_date: budget.issue_date,
        expiry_date: budget.expiry_date,
        send_email_to_client: budget.send_email_to_client,
        footer_comments: budget.footer_comments,
        items: budget.items,
    });

    const { handleResponse } = useInertiaResponse();

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('dashboard.budgets.update', budget.id), handleResponse());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar - ${budget.title}`} />

            <BudgetForm
                data={data}
                setData={setData}
                handleSubmit={handleSubmit}
                processing={processing}
                errors={errors}
                clients={clients}
                products={products}
                user={user}
                isEditing={true}
            />
        </AppLayout>
    );
}
