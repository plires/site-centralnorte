import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import RoleForm from './components/RoleForm';

const breadcrumbs = [
    {
        title: 'Roles',
        href: '/dashboard/roles',
    },
    {
        title: 'Editar Rol',
        href: '/dashboard/roles/edit',
    },
];

export default function Edit({ role, permissions }) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name || '',
        is_system: role.is_system || false,
        permissions: role.permissions?.map((p) => p.id) || [],
    });

    const { handleResponse } = useInertiaResponse();

    const handleSubmit = (e) => {
        e.preventDefault();

        put(route('dashboard.roles.update', role.id), handleResponse());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Rol - ${role.name}`} />

            <RoleForm
                data={data}
                setData={setData}
                handleSubmit={handleSubmit}
                processing={processing}
                errors={errors}
                permissions={permissions}
                isEditing={true}
            />
        </AppLayout>
    );
}
