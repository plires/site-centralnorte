import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import ClientForm from './components/ClientForm';

const breadcrumbs = [
    {
        title: 'Editar Cliente',
        href: '/dashboard/cliente/edit',
    },
];

export default function Edit({ client }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: client.name || '',
        company: client.company || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
    });

    const { handleResponse } = useInertiaResponse();

    const handleSubmit = (e) => {
        e.preventDefault();

        put(route('dashboard.clients.update', client.id), handleResponse());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Cliente - ${client.name}`} />

            <ClientForm data={data} setData={setData} handleSubmit={handleSubmit} processing={processing} errors={errors} isEditing={true} />
        </AppLayout>
    );
}
