import ButtonCustom from '@/components/ButtonCustom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, FileText, Hash, Package, ShoppingCart, Tag } from 'lucide-react';

const breadcrumbs = [
    { title: 'Productos', href: '/dashboard/products' },
    { title: 'Detalles del Producto', href: '#' },
];

export default function Show({ product }) {
    const formatDate = (date) =>
        new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Producto - ${product.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="text-end">
                            <ButtonCustom className="mt-6 mr-6" route={route('dashboard.products.index')} variant="secondary" size="md">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </ButtonCustom>
                        </div>

                        <div className="grid gap-6 p-6 md:grid-cols-2">
                            {/* Info del producto */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Package className="mr-2 h-5 w-5" />
                                        Información del Producto
                                    </CardTitle>
                                    <CardDescription>Datos generales</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">SKU</span>
                                        </div>
                                        <p className="text-lg text-gray-900">{product.sku}</p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">Nombre</span>
                                        </div>
                                        <p className="text-lg text-gray-900">{product.name}</p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">Descripción</span>
                                        </div>
                                        <p className="text-sm text-gray-900">{product.description || 'Sin descripción'}</p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <ShoppingCart className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">Proveedor</span>
                                        </div>
                                        <p className="text-sm text-gray-900">{product.proveedor || 'No especificado'}</p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">Categoría</span>
                                        </div>
                                        <Badge variant="outline" className="text-sm">
                                            {product.category?.name || 'Sin categoría'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Fechas y sistema */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Calendar className="mr-2 h-5 w-5" />
                                        Información del Sistema
                                    </CardTitle>
                                    <CardDescription>Control de registro</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* <div>
                                        <div className="mb-1 text-sm font-medium text-gray-700">Precio Último</div>
                                        <p className="text-lg text-gray-900">${product.last_price.toFixed(2)}</p>
                                    </div>

                                    <Separator /> */}

                                    <div>
                                        <div className="mb-1 text-sm font-medium text-gray-700">Creado</div>
                                        <p className="text-sm text-gray-900">{formatDate(product.created_at)}</p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <div className="mb-1 text-sm font-medium text-gray-700">Última modificación</div>
                                        <p className="text-sm text-gray-900">{formatDate(product.updated_at)}</p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <span className="text-sm font-medium text-gray-700">ID del Producto</span>
                                        <Badge variant="secondary" className="mt-1 block font-mono">
                                            #{product.id}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Acciones */}
                        <Card className="mx-6 mt-6">
                            <CardHeader>
                                <CardTitle>Acciones</CardTitle>
                                <CardDescription>Operaciones disponibles</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ButtonCustom route={route('dashboard.products.edit', product.id)} variant="primary" size="md">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar Producto
                                </ButtonCustom>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
