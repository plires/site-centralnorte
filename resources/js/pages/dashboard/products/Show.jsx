import ButtonCustom from '@/components/ButtonCustom';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import UploadProductImagesForm from '@/components/UploadProductImagesForm';
import { useInertiaResponse } from '@/hooks/use-inertia-response'; // ajustá la ruta si cambia
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, FileText, Hash, Package, ShoppingCart, Star, StarOff, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const breadcrumbs = [
    { title: 'Productos', href: '/dashboard/products' },
    { title: 'Detalles del Producto', href: '#' },
];

export default function Show({ product }) {
    const [imageToDelete, setImageToDelete] = useState(null); // estado para almacenar la imagen a eliminar
    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState(null); // maneja el preview de la imagen antes de cargarse
    const [file, setFile] = useState(null); // maneja el archivo de la imagen antes de cargarse

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const { data, setData, post, processing, errors, reset } = useForm({
        image: '',
        product: product?.toString() || '',
    });

    const { handleResponse } = useInertiaResponse();

    const handleImageChange = (file) => {
        if (file) {
            setPreview(URL.createObjectURL(file));
            setFile(file);
        } else {
            setPreview(null);
            setFile(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('dashboard.products.images.store', product), {
            ...handleResponse(() => {
                reset();
                setPreview(null); // limpiar preview
                setFile(null); // limpiar archivo
            }),
            forceFormData: true,
        });
    };

    const handleDeleteImage = (productId, imageId) => {
        router.delete(
            route('dashboard.products.images.destroy', { product: productId, image: imageId }),
            handleResponse(() => {
                //if (refreshCallback) refreshCallback(); // recargar imágenes
            }),
        );
    };

    const handleSetFeaturedImage = (productId, imageId) => {
        router.patch(
            route('dashboard.products.images.set-featured', { product: productId, image: imageId }),
            {}, // sin datos adicionales
            handleResponse(() => {
                //if (refreshCallback) refreshCallback(); // recargar imágenes
            }),
        );
    };

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

                        <div className="p-6">
                            <div className="grid gap-6 md:grid-cols-2">
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
                            <Card className="mt-6">
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

                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Imágenes</CardTitle>
                                    <CardDescription>
                                        {product.images.length > 0 ? 'Imágenes del producto' : 'El Producto aún no tiene imágenes'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {/* Listado de imágenes */}

                                    {product.images.length > 0 && (
                                        <div className="mb-5">
                                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                                {product.images.map((img) => {
                                                    const isFeatured = product.featured_image && product.featured_image.id === img.id;

                                                    return (
                                                        <div
                                                            key={img.id}
                                                            className={cn(
                                                                'group relative rounded-md border p-1 transition-all duration-200',
                                                                isFeatured
                                                                    ? 'bg-primary/10 scale-[1.02] shadow-md ring-3 ring-green-600'
                                                                    : 'hover:ring-muted hover:ring-1',
                                                            )}
                                                        >
                                                            <img
                                                                src={img.full_url}
                                                                width={300}
                                                                height={300}
                                                                alt={`Imagen del producto ${product.name}`}
                                                                className="h-auto w-full cursor-pointer rounded-md object-cover transition hover:scale-105 hover:shadow-lg"
                                                                onClick={() => setSelectedImage(img.full_url)}
                                                            />

                                                            {/* Botón Eliminar con AlertDialog */}
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="absolute top-2 right-2 cursor-pointer bg-white/80 transition hover:bg-red-500 hover:text-white"
                                                                        onClick={() => setImageToDelete(img.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>

                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>¿Eliminar esta imagen?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Esta acción no se puede deshacer. La imagen será eliminada permanentemente
                                                                            del producto.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => {
                                                                                handleDeleteImage(product.id, imageToDelete);
                                                                                setImageToDelete(null);
                                                                            }}
                                                                        >
                                                                            Eliminar
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>

                                                            {/* Botón Destacar */}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={`absolute top-2 left-2 cursor-pointer bg-white/80 transition hover:bg-green-600 hover:text-white ${isFeatured && 'cursor-default bg-green-600 text-white'}`}
                                                                onClick={!isFeatured ? () => handleSetFeaturedImage(product.id, img.id) : undefined}
                                                            >
                                                                {isFeatured ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    <UploadProductImagesForm
                                        data={data}
                                        setData={setData}
                                        handleSubmit={handleSubmit}
                                        processing={processing}
                                        errors={errors}
                                        preview={preview}
                                        setPreview={setPreview}
                                        handleImageChange={handleImageChange}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {selectedImage && (
                <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                    <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <DialogTitle>Vista previa de la imágen</DialogTitle>
                        <img src={selectedImage} alt="Vista previa" className="mx-auto max-h-[80vh] w-full rounded-md object-contain" />
                    </DialogContent>
                </Dialog>
            )}
        </AppLayout>
    );
}
