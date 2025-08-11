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

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        client_id: '',
        issue_date: new Date().toISOString().split('T')[0], // Fecha actual
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días
        footer_comments: `• A estos precios habrá que adicionarles el IVA.
• Los plazos de entrega comienzan a regir luego de la aprobación del boceto digital.
• Forma de pago: a convenir.
• Sujeto a disponibilidad de stock disponible al momento de la confirmación.
• Validez del presupuesto: 30 días.
• Incluye envío y entrega a domicilio según la dirección especificada dentro del ámbito de CABA y GBA hasta 30 kms.`,
        send_email_to_client: false,
        items: [],
    });

    const { handleResponse } = useInertiaResponse();

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar que haya al menos un item
        if (data.items.length === 0) {
            alert('Debe agregar al menos un producto al presupuesto');
            return;
        }

        post(
            route('dashboard.budgets.store'),
            handleResponse(() => {
                // Callback de éxito: limpiar formulario
                reset();
            }),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Presupuesto" />
            <BudgetForm data={data} setData={setData} handleSubmit={handleSubmit} processing={processing} errors={errors} isEditing={false} />
        </AppLayout>
    );
}
