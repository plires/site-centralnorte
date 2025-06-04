import UserForm from '@/components/UserForm';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs = [
    {
        title: 'Usuarios',
        href: '/dashboard/users',
    },
    {
        title: 'Editar Usuario',
        href: '/dashboard/users/edit',
    },
];

export default function Edit({ user, roles }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: user.name || '',
        email: user.email || '',
        email_verified_at: user.email_verified_at || '',
        password: '',
        password_confirmation: '',
        role_id: user.role_id?.toString() || '',
    });

    const { handleResponse } = useInertiaResponse();

    const handleSubmit = (e) => {
        e.preventDefault();

        put(
            route('dashboard.users.update', user.id),
            handleResponse(() => {
                // Callback de éxito: limpiar solo las contraseñas
                setData((prevData) => ({
                    ...prevData,
                    password: '',
                    password_confirmation: '',
                    manual_verification: false, // También resetear esto
                }));
            }),
        );
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl leading-tight font-semibold text-gray-800">Editar Usuario: {user.name}</h2>
                </div>
            }
        >
            <Head title={`Editar Usuario - ${user.name}`} />

            <UserForm
                data={data}
                setData={setData}
                handleSubmit={handleSubmit}
                processing={processing}
                errors={errors}
                roles={roles}
                isEditing={true}
            />
        </AppLayout>
    );
}
