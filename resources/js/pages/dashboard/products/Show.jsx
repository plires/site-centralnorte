import { ReadOnlyProductsAlert } from '@/components/dashboard/ReadOnlyProductsAlert';
import PageHeader from '@/components/PageHeader';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

// Componentes extraídos
import ImagePreviewDialog from './components/ImagePreviewDialog';
import ProductActionsCard from './components/ProductActionsCard';
import ProductImagesSection from './components/ProductImagesSection';
import ProductInfoCard from './components/ProductInfoCard';
import SystemInfoCard from './components/SystemInfoCard';

const breadcrumbs = [
    { title: 'Productos', href: '/dashboard/products' },
    { title: 'Detalles del Producto', href: '#' },
];

export default function Show({ product }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        image: '',
        product: product?.toString() || '',
    });

    const { handleResponse } = useInertiaResponse();

    // Funciones de utilidad
    const resetFile = () => {
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    const handleImageChange = (file) => {
        if (file) {
            setPreview(URL.createObjectURL(file));
            setFile(file);
        }
    };

    // Handlers de acciones
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('dashboard.products.images.store', product), {
            ...handleResponse(() => {
                reset();
                resetFile();
            }),
            forceFormData: true,
        });
    };

    const handleDeleteImage = (productId, imageId) => {
        router.delete(
            route('dashboard.products.images.destroy', { product: productId, image: imageId }),
            handleResponse(() => {
                // callback si es necesario
            }),
        );
    };

    const handleSetFeaturedImage = (productId, imageId) => {
        router.patch(
            route('dashboard.products.images.set-featured', { product: productId, image: imageId }),
            {},
            handleResponse(() => {
                // callback si es necesario
            }),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Producto - ${product.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {is_readonly && <ReadOnlyProductsAlert lastSyncInfo={last_sync_info} />}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {/* Header con botón volver */}
                        <PageHeader backRoute={route('dashboard.products.index')} backText="Volver" />

                        <div className="p-6">
                            {/* Grid principal con información del producto */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <ProductInfoCard product={product} />
                                <SystemInfoCard product={product} />
                            </div>

                            {/* Acciones del producto */}
                            <div className="mt-6">
                                <ProductActionsCard productId={product.id} />
                            </div>
                            <Button variant="outline" size="sm" onClick={() => router.post(route('dashboard.products.sync.one', product.sku))}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Sincronizar producto
                            </Button>

                            {/* Sección de imágenes */}
                            <div className="mt-6">
                                <ProductImagesSection
                                    product={product}
                                    onImageClick={setSelectedImage}
                                    onDeleteImage={handleDeleteImage}
                                    onSetFeaturedImage={handleSetFeaturedImage}
                                    setData={setData}
                                    handleSubmit={handleSubmit}
                                    processing={processing}
                                    errors={errors}
                                    preview={preview}
                                    handleImageChange={handleImageChange}
                                    fileInputRef={fileInputRef}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de vista previa de imagen */}
            <ImagePreviewDialog selectedImage={selectedImage} onClose={() => setSelectedImage(null)} />
        </AppLayout>
    );
}
