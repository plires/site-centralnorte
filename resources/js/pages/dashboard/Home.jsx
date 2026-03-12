import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs = [
    {
        title: 'Inicio',
        href: '/dashboard',
    },
];

export default function Home() {
    const { auth, quote } = usePage().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inicio" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-8">
                            <h1 className="text-2xl font-semibold text-gray-800">
                                Bienvenido/a, {auth.user.name}
                            </h1>
                            {auth.user.role && (
                                <p className="mt-1 text-sm text-gray-500">
                                    Rol: {auth.user.role.name}
                                </p>
                            )}

                            {quote?.message && (
                                <blockquote className="mt-8 border-l-4 border-gray-200 pl-4 text-gray-500 italic">
                                    <p>"{quote.message}"</p>
                                    {quote.author && (
                                        <footer className="mt-1 text-sm">— {quote.author}</footer>
                                    )}
                                </blockquote>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
