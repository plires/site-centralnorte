import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './ProductGallery.module.css';

const ProductGallery = forwardRef(({ images, productName }, ref) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isZooming, setIsZooming] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
    const mainImageRef = useRef(null);

    const currentImage = images[currentIndex];

    // Exponer método para cambiar a una imagen específica por ID
    useImperativeHandle(ref, () => ({
        goToImage: (imageId) => {
            const index = images.findIndex((img) => img.id === imageId);
            if (index !== -1) {
                setCurrentIndex(index);
            }
        },
    }));

    const handleThumbnailClick = (index) => {
        setCurrentIndex(index);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleMouseEnter = () => {
        setIsZooming(true);
    };

    const handleMouseLeave = () => {
        setIsZooming(false);
        setZoomPosition({ x: 50, y: 50 });
    };

    const handleMouseMove = useCallback((e) => {
        if (!mainImageRef.current) return;

        const rect = mainImageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setZoomPosition({
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y)),
        });
    }, []);

    return (
        <div className={styles.gallery}>
            {/* Main Image Container */}
            <div
                className={styles.mainImageContainer}
                ref={mainImageRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
            >
                <div
                    className={`${styles.mainImage} ${isZooming ? styles.zooming : ''}`}
                    style={{
                        backgroundImage: `url(${currentImage.url})`,
                        backgroundPosition: isZooming ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center',
                    }}
                >
                    <img src={currentImage.url} alt={productName} className={styles.mainImagePlaceholder} />
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            className={`${styles.navButton} ${styles.prevButton}`}
                            onClick={handlePrev}
                            onMouseEnter={() => setIsZooming(false)}
                            onMouseLeave={() => setIsZooming(true)}
                            aria-label="Imagen anterior"
                        >
                            <FiChevronLeft strokeWidth={1.5} />
                        </button>
                        <button
                            className={`${styles.navButton} ${styles.nextButton}`}
                            onClick={handleNext}
                            onMouseEnter={() => setIsZooming(false)}
                            onMouseLeave={() => setIsZooming(true)}
                            aria-label="Siguiente imagen"
                        >
                            <FiChevronRight strokeWidth={1.5} />
                        </button>
                    </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                    <div className={styles.imageCounter}>
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className={styles.thumbnailsContainer}>
                    <div className={styles.thumbnails}>
                        {images.map((image, index) => (
                            <button
                                key={image.id}
                                className={`${styles.thumbnail} ${index === currentIndex ? styles.active : ''}`}
                                onClick={() => handleThumbnailClick(index)}
                                aria-label={`Ver imagen ${index + 1}`}
                            >
                                <img src={image.url} alt={`${productName} - ${index + 1}`} />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

ProductGallery.displayName = 'ProductGallery';

export default ProductGallery;
