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

    const renderInactiveMessage = () => (
        <div className="mt-6 overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">Presupuesto Inactivo</h3>
                <p className="mx-auto max-w-sm text-sm text-gray-600">
                    Este presupuesto está desactivado. Para poder editarlo, primero debes activarlo usando el switch superior.
                </p>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Presupuesto - ${budget.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Switch de estado */}
                    <BudgetStatusSwitch budget={budget} />

                    {/* Formulario o mensaje de inactivo */}
                    {budget.is_active ? (
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
                    ) : (
                        renderInactiveMessage()
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
