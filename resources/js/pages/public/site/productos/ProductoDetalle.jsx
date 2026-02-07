import LayoutPublic from '@/layouts/public/public-layout';
import { useRef } from 'react';
import Breadcrumbs from './components/Breadcrumbs';
import ProductAttributes from './components/ProductAttributes';
import ProductGallery from './components/ProductGallery';
import VariantSelector from './components/VariantSelector';
import styles from './ProductoDetalle.module.css';

const ProductoDetalle = ({ product, mainCategory }) => {
    const galleryRef = useRef(null);

    const handleVariantSelect = (variant, matchingImage) => {
        if (matchingImage && galleryRef.current) {
            galleryRef.current.goToImage(matchingImage.id);
        }
    };

    return (
        <section className={styles.section}>
            <div className="container">
                {/* Breadcrumbs */}
                <Breadcrumbs category={mainCategory} productName={product.name} />

                {/* Main content */}
                <div className={styles.mainContent}>
                    {/* Gallery */}
                    <div className={styles.galleryColumn}>
                        <ProductGallery ref={galleryRef} images={product.images} productName={product.name} />
                    </div>

                    {/* Product Info */}
                    <div className={styles.infoColumn}>
                        <div className={styles.contentInfo}>
                            <h1 className={styles.productName}>{product.name}</h1>

                            {product.sku && <p className={styles.sku}>SKU: {product.sku}</p>}

                            {/* Variant Selector */}
                            <VariantSelector product={product} variants={product.variants} images={product.images} onVariantSelect={handleVariantSelect} />
                        </div>
                    </div>
                </div>

                {/* Product Details Section */}
                <div className={styles.detailsSection}>
                    {/* Description */}
                    {product.description && (
                        <div className={styles.descriptionBlock}>
                            <h2 className={styles.sectionTitle}>Detalle del producto</h2>
                            <div className={styles.description} dangerouslySetInnerHTML={{ __html: product.description }} />
                        </div>
                    )}

                    {/* Attributes */}
                    {Object.keys(product.attributes).length > 0 && (
                        <div className={styles.attributesBlock}>
                            <h2 className={styles.sectionTitle}>Información complementaria</h2>
                            <ProductAttributes attributes={product.attributes} />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

ProductoDetalle.layout = (page) => <LayoutPublic children={page} />;

export default ProductoDetalle;
