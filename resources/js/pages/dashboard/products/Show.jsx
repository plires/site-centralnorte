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
import SyncProductButton from './components/SyncProductButton';
import SystemInfoCard from './components/SystemInfoCard';

const breadcrumbs = [
    { title: 'Productos', href: '/dashboard/products' },
    { title: 'Detalles del Producto', href: '#' },
];

export default function Show({ product, is_readonly, last_sync_info }) {
    const { is_external } = product.origin_config;

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
        const { is_external } = category.origin_config;

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
                            {!is_external && (
                                <div className="mt-6">
                                    <ProductActionsCard productId={product.id} />
                                </div>
                            )}

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

                            {/* Sincronizacion de producto individual */}
                            {is_external && (
                                <SyncProductButton sku={product.sku} isExternal={product.origin_config?.is_external} productName={product.name} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de vista previa de imagen */}
            <ImagePreviewDialog selectedImage={selectedImage} onClose={() => setSelectedImage(null)} />
        </AppLayout>
    );
}
