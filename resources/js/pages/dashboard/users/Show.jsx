import PageHeader from '@/components/PageHeader';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

// Componentes extraídos
import UserActionsCard from './components/UserActionsCard';
import UserPersonalInfoCard from './components/UserPersonalInfoCard';
import UserSystemInfoCard from './components/UserSystemInfoCard';

const breadcrumbs = [
    {
        title: 'Usuarios',
        href: '/dashboard/users',
    },
    {
        title: 'Detalles del Usuario',
        href: '#',
    },
];

export default function Show({ user }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Usuario - ${user.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {/* Header con botón volver */}
                        <PageHeader backRoute={route('dashboard.users.index')} backText="Volver" />

                        <div className="p-6">
                            {/* Grid principal con información del usuario */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <UserPersonalInfoCard user={user} />
                                <UserSystemInfoCard user={user} />
                            </div>

                            {/* Acciones del usuario */}
                            <div className="mt-6">
                                <UserActionsCard userId={user.id} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
