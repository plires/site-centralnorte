// resources/js/pages/dashboard/picking/Create.jsx

import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import PickingBudgetForm from './components/PickingBudgetForm';

/**
 * Vista para crear un nuevo presupuesto de picking
 * Renderiza el PickingBudgetForm con datos vacíos
 */
export default function Create({ auth, boxes, costScales, clients, componentIncrements, paymentConditions, businessConfig }) {
    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        picking_payment_condition_id: '',
        total_kits: '',
        total_components_per_kit: '',
        boxes: [],
        services: [],
        notes: '',
    });

    const { handleResponse } = useInertiaResponse();

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('dashboard.picking.budgets.store'), handleResponse());
    };

    const breadcrumbs = [
        {
            title: 'Presupuestos de Picking',
            href: '/dashboard/picking',
        },
        {
            title: 'Nuevo Presupuesto',
            href: '#',
        },
    ];

    return (
        <AppLayout user={auth.user} breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Presupuesto de Picking" />

            <PickingBudgetForm
                data={data}
                setData={setData}
                handleSubmit={handleSubmit}
                processing={processing}
                errors={errors}
                clients={clients}
                boxes={boxes}
                costScales={costScales}
                componentIncrements={componentIncrements}
                paymentConditions={paymentConditions}
                businessConfig={businessConfig}
                isEditing={false}
                originalBudget={null}
            />
        </AppLayout>
    );
}
