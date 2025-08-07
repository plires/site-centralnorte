import PageHeader from '@/components/PageHeader';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

// Componentes extraídos
import RoleActionsCard from './components/RoleActionsCard';
import RoleInfoCard from './components/RoleInfoCard';
import RoleUsersCard from './components/RoleUsersCard';

const breadcrumbs = [
    {
        title: 'Roles',
        href: '/dashboard/roles',
    },
    {
        title: 'Detalles del Rol',
        href: '#',
    },
];

export default function Show({ role }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rol - ${role.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {/* Header con botón volver */}
                        <PageHeader backRoute={route('dashboard.roles.index')} backText="Volver" />

                        <div className="p-6">
                            {/* Grid principal con información del rol */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <RoleInfoCard role={role} />
                                <RoleUsersCard users={role.users} />
                            </div>

                            {/* Acciones del rol */}
                            <div className="mt-6">
                                <RoleActionsCard roleId={role.id} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
