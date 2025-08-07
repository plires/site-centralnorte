import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import UserForm from './components/UserForm';

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
        <AppLayout breadcrumbs={breadcrumbs}>
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
