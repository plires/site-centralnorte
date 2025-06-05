import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs = [
    {
        title: 'Roles de Usuarios',
        href: '/dashboard/roles',
    },
];

export default function RolesIndex({ auth, users, filters = {}, roles, permissions }) {
    const { data, setData, post } = useForm({
        name: '',
        permissions: [],
    });

    const togglePermission = (permId) => {
        setData('permissions', data.permissions.includes(permId) ? data.permissions.filter((id) => id !== permId) : [...data.permissions, permId]);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/dashboard/roles');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
            <Head title="Usuarios" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl p-6">
                    <h1 className="mb-4 text-2xl font-bold">Gestión de Roles</h1>

                    <form onSubmit={submit} className="mb-8 space-y-4">
                        <input
                            type="text"
                            className="w-full border p-2"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Nombre del rol"
                        />

                        <div className="grid grid-cols-2 gap-2">
                            {permissions.map((perm) => (
                                <label key={perm.id} className="flex items-center space-x-2">
                                    <input type="checkbox" checked={data.permissions.includes(perm.id)} onChange={() => togglePermission(perm.id)} />
                                    <span>{perm.name}</span>
                                </label>
                            ))}
                        </div>

                        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
                            Crear Rol
                        </button>
                    </form>

                    <h2 className="text-xl font-semibold">Roles existentes</h2>
                    <ul className="mt-4 space-y-2">
                        {roles.map((role) => (
                            <li key={role.id}>
                                <strong>{role.name}</strong>: {role.permissions.map((p) => p.name).join(', ')}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
