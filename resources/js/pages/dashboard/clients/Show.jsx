import PageHeader from '@/components/PageHeader';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

// Componentes extraídos
import ClientActionsCard from './components/ClientActionsCard';
import ClientPersonalInfoCard from './components/ClientPersonalInfoCard';
import ClientSystemInfoCard from './components/ClientSystemInfoCard';

const breadcrumbs = [
    {
        title: 'Clientes',
        href: '/dashboard/clients',
    },
    {
        title: 'Detalles del Cliente',
        href: '#',
    },
];

export default function Show({ client }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Cliente - ${client.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {/* Header con botón volver */}
                        <PageHeader backRoute={route('dashboard.clients.index')} backText="Volver" />

                        <div className="p-6">
                            {/* Grid principal con información del cliente */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <ClientPersonalInfoCard client={client} />
                                <ClientSystemInfoCard client={client} />
                            </div>

                            {/* Acciones del cliente */}
                            <div className="mt-6">
                                <ClientActionsCard clientId={client.id} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
