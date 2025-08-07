import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import RoleForm from './components/RoleForm';

const breadcrumbs = [
    {
        title: 'Roles de Usuarios',
        href: '/dashboard/roles',
    },
    {
        title: 'Crear Rol',
        href: '#',
    },
];

export default function Create({ permissions }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        permissions: [],
    });

    const { handleResponse } = useInertiaResponse();

    const handleSubmit = (e) => {
        e.preventDefault();
        post(
            route('dashboard.roles.store'),
            handleResponse(() => {
                // Callback de éxito: limpiar formulario
                reset();
            }),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Rol" />

            <RoleForm
                data={data}
                setData={setData}
                handleSubmit={handleSubmit}
                processing={processing}
                errors={errors}
                permissions={permissions}
                isEditing={false}
            />
        </AppLayout>
    );
}
