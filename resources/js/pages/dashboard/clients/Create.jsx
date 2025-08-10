import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import ClientForm from './components/ClientForm';

const breadcrumbs = [
    {
        title: 'Clientes',
        href: '/dashboard/clientes',
    },
    {
        title: 'Crear Cliente',
        href: '/dashboard/clients/create',
    },
];

export default function Create({ roles }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
    });

    const { handleResponse } = useInertiaResponse();

    const handleSubmit = (e) => {
        e.preventDefault();

        post(
            route('dashboard.clients.store'),
            handleResponse(() => {
                // Callback de éxito: limpiar formulario
                reset();
            }),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Cliente" />

            <ClientForm data={data} setData={setData} handleSubmit={handleSubmit} processing={processing} errors={errors} isEditing={false} />
        </AppLayout>
    );
}
