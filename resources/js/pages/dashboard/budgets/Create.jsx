import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { getDatePlusDaysISO, getTodayISO } from '@/utils/dateUtils';
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

export default function Create({ clients, products, paymentConditions, user, businessConfig, budget = null, vendors = [] }) {
    const isEditing = !!budget;

    // Obtener días de validez desde la configuración del backend
    const validityDays = businessConfig?.default_validity_days || 30;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: budget?.title || '',
        client_id: budget?.client_id?.toString() || '',
        picking_payment_condition_id: budget?.picking_payment_condition_id || null,
        // Usar la función que respeta la zona horaria local
        issue_date: budget?.issue_date || getTodayISO(),
        // Usar configuración de días de validez desde el backend
        expiry_date: budget?.expiry_date || getDatePlusDaysISO(validityDays),
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
                paymentConditions={paymentConditions}
                user={user}
                businessConfig={businessConfig}
                isEditing={isEditing}
                originalBudget={budget}
                vendors={vendors}
            />
        </AppLayout>
    );
}
