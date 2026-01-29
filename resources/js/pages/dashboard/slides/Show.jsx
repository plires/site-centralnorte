import PageHeader from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ExternalLink, Monitor, Smartphone } from 'lucide-react';
import SlideActionsCard from './components/SlideActionsCard';

const breadcrumbs = [
    {
        title: 'Slides',
        href: '/dashboard/slides',
    },
    {
        title: 'Detalles del Slide',
        href: '#',
    },
];

export default function Show({ slide }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Slide - ${slide.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <PageHeader backRoute={route('dashboard.slides.index')} backText="Volver" />

                        <div className="p-6">
                            {/* Header con título y acciones */}
                            <div className="mb-6 flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{slide.title}</h2>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Badge variant={slide.is_active ? 'success' : 'secondary'}>{slide.is_active ? 'Activo' : 'Inactivo'}</Badge>
                                        <span className="text-sm text-gray-500">Orden: #{slide.sort_order}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Enlace si existe */}
                            {slide.link && (
                                <div className="mb-6">
                                    <span className="text-sm font-medium text-gray-500">Enlace:</span>
                                    <a
                                        href={slide.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 inline-flex items-center text-blue-600 hover:underline"
                                    >
                                        {slide.link}
                                        <ExternalLink className="ml-1 h-4 w-4" />
                                    </a>
                                </div>
                            )}

                            {/* Grid de imágenes */}
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Imagen Desktop */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Monitor className="h-5 w-5" />
                                            Imagen Desktop
                                        </CardTitle>
                                        <CardDescription>Tamaño: 1920 x 850 px</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {slide.image_desktop_url ? (
                                            <div className="overflow-hidden rounded-lg border">
                                                <img
                                                    src={slide.image_desktop_url}
                                                    alt={`${slide.title} - Desktop`}
                                                    className="h-auto w-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-48 items-center justify-center rounded-lg border bg-gray-100">
                                                <span className="text-gray-400">Sin imagen</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Imagen Mobile */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Smartphone className="h-5 w-5" />
                                            Imagen Mobile
                                        </CardTitle>
                                        <CardDescription>Tamaño: 580 x 630 px</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {slide.image_mobile_url ? (
                                            <div className="mx-auto max-w-xs overflow-hidden rounded-lg border">
                                                <img
                                                    src={slide.image_mobile_url}
                                                    alt={`${slide.title} - Mobile`}
                                                    className="h-auto w-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="mx-auto flex h-48 max-w-xs items-center justify-center rounded-lg border bg-gray-100">
                                                <span className="text-gray-400">Sin imagen</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Metadata */}
                            <Card className="mt-6 mb-5">
                                <CardHeader>
                                    <CardTitle>Información adicional</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <dl className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <dt className="font-medium text-gray-500">ID</dt>
                                            <dd className="mt-1 text-gray-900">{slide.id}</dd>
                                        </div>
                                        <div>
                                            <dt className="font-medium text-gray-500">Orden</dt>
                                            <dd className="mt-1 text-gray-900">{slide.sort_order}</dd>
                                        </div>
                                        <div>
                                            <dt className="font-medium text-gray-500">Creado</dt>
                                            <dd className="mt-1 text-gray-900">{new Date(slide.created_at).toLocaleString('es-AR')}</dd>
                                        </div>
                                        <div>
                                            <dt className="font-medium text-gray-500">Actualizado</dt>
                                            <dd className="mt-1 text-gray-900">{new Date(slide.updated_at).toLocaleString('es-AR')}</dd>
                                        </div>
                                    </dl>
                                </CardContent>
                            </Card>

                            {/* Acciones del slide */}
                            <SlideActionsCard slide={slide} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
