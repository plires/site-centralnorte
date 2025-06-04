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
        title: 'Crear Usuario',
        href: '/dashboard/users/create',
    },
];

export default function Create({ roles }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
    });

    const { handleResponse } = useInertiaResponse();

    const handleSubmit = (e) => {
        e.preventDefault();

        post(
            route('dashboard.users.store'),
            handleResponse(() => {
                // Callback de éxito: limpiar formulario
                reset();
            }),
        );
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl leading-tight font-semibold text-gray-800">Crear Nuevo Usuario</h2>
                </div>
            }
        >
            <Head title="Crear Usuario" />

            <UserForm
                data={data}
                setData={setData}
                handleSubmit={handleSubmit}
                processing={processing}
                errors={errors}
                roles={roles}
                isEditing={false}
            />
        </AppLayout>
    );
}
