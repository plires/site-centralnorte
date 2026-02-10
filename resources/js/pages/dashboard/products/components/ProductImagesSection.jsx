import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ImageItem from './ImageItem';
import UploadProductImagesForm from './UploadProductImagesForm';

export default function ProductImagesSection({
    product,
    onImageClick,
    onDeleteImage,
    onSetFeaturedImage,
    // Props del form de upload
    data,
    setData,
    handleSubmit,
    processing,
    errors,
    preview,
    handleImageChange,
    fileInputRef,
    variantOptions,
    usedVariants,
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Imágenes</CardTitle>
                <CardDescription>{product.images.length > 0 ? 'Imágenes del producto' : 'El Producto aún no tiene imágenes'}</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Listado de imágenes */}
                {product.images.length > 0 && (
                    <div className="mb-5">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {product.images.map((img) => {
                                const isFeatured = product.featured_image && product.featured_image.id === img.id;

                                return (
                                    <ImageItem
                                        key={img.id}
                                        image={img}
                                        product={product}
                                        isFeatured={isFeatured}
                                        onImageClick={onImageClick}
                                        onDeleteImage={onDeleteImage}
                                        onSetFeaturedImage={onSetFeaturedImage}
                                    />
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
                    handleImageChange={handleImageChange}
                    fileInputRef={fileInputRef}
                    variantOptions={variantOptions}
                    usedVariants={usedVariants}
                />
            </CardContent>
        </Card>
    );
}
