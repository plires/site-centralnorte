// resources/js/pages/dashboard/budgets/Edit.jsx

import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import BudgetForm from './components/BudgetForm';
import BudgetStatusSwitch from './components/BudgetStatusSwitch';

export default function Edit({ budget, clients, products, paymentConditions, user, businessConfig }) {
    const { flash } = usePage().props;

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

    // Construir objeto de condición de pago para BudgetTotalsSection
    const paymentConditionInfo = budget.payment_condition_description
        ? {
              description: budget.payment_condition_description,
              percentage: budget.payment_condition_percentage,
          }
        : null;

    // Usar directamente los accessors del modelo para fechas ISO
    const { data, setData, put, processing, errors } = useForm({
        title: budget.title,
        picking_payment_condition: paymentConditionInfo || null,
        client_id: budget.client_id.toString(),
        issue_date: budget.issue_date, // Ya viene en formato ISO desde el controlador
        expiry_date: budget.expiry_date, // Ya viene en formato ISO desde el controlador
        send_email_to_client: budget.send_email_to_client,
        footer_comments: budget.footer_comments || '',
        items: budget.items || [],
        picking_payment_condition_id: budget.picking_payment_condition_id || null,
        user_id: budget.user_id,
    });

    const { handleResponse } = useInertiaResponse();

    // Manejar los flash messages para el toast
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

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

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Switch de estado */}
                    <BudgetStatusSwitch className="mb-5" budget={budget} />

                    {/* Formulario */}
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
                        isEditing={true}
                        originalBudget={budget}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
