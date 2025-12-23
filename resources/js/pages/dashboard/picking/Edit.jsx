// resources/js/pages/dashboard/picking/Edit.jsx

import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import PickingBudgetForm from './components/PickingBudgetForm';

/**
 * Vista para editar un presupuesto de picking existente
 * Renderiza el PickingBudgetForm con datos del presupuesto
 */
export default function Edit({ auth, budget, boxes, costScales, clients, componentIncrements, paymentConditions, businessConfig }) {
    const { flash } = usePage().props;

    // Inicializar formulario con datos del presupuesto existente
    const { data, setData, put, processing, errors } = useForm({
        client_id: budget.client_id.toString(),
        picking_payment_condition_id: budget.picking_payment_condition_id || '',
        total_kits: budget.total_kits,
        total_components_per_kit: budget.total_components_per_kit,
        boxes:
            budget.boxes?.map((box) => ({
                box_id: box.picking_box_id?.toString() || '',
                box_dimensions: box.box_dimensions || '',
                box_unit_cost: box.box_unit_cost || '',
                quantity: box.quantity || 1,
            })) || [],
        services: budget.services || [],
        notes: budget.notes || '',
    });

    const { handleResponse } = useInertiaResponse();

    // Manejo de flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('dashboard.picking.budgets.update', budget.id), handleResponse());
    };

    const breadcrumbs = [
        {
            title: 'Presupuestos de Picking',
            href: '/dashboard/picking',
        },
        {
            title: `Editar - ${budget.budget_number}`,
            href: '#',
        },
    ];

    return (
        <AppLayout user={auth.user} breadcrumbs={breadcrumbs}>
            <Head title={`Editar - ${budget.budget_number}`} />

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
                isEditing={true}
                originalBudget={budget}
            />
        </AppLayout>
    );
}
