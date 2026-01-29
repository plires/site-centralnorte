import styles from './ImageCarousel.module.css';

// Importar imágenes del carrusel
import imagen1 from '@/../images/home/carrusel/carrusel-1.webp';
import imagen2 from '@/../images/home/carrusel/carrusel-2.webp';
import imagen3 from '@/../images/home/carrusel/carrusel-3.webp';
import imagen4 from '@/../images/home/carrusel/carrusel-4.webp';
import imagen5 from '@/../images/home/carrusel/carrusel-5.webp';
import imagen6 from '@/../images/home/carrusel/carrusel-6.webp';

const images = [
    { url: imagen1, alt: 'Producto 1' },
    { url: imagen2, alt: 'Producto 2' },
    { url: imagen3, alt: 'Producto 3' },
    { url: imagen4, alt: 'Producto 4' },
    { url: imagen5, alt: 'Producto 5' },
    { url: imagen6, alt: 'Producto 6' },
];

const ImageCarousel = () => {
    // Duplicamos las imágenes para crear el efecto de loop infinito
    const duplicatedImages = [...images, ...images];

    return (
        <section className={styles.carouselSection}>
            <div className={styles.carouselTrack}>
                {duplicatedImages.map((image, index) => (
                    <div key={index} className={styles.carouselSlide}>
                        <img src={image.url} alt={image.alt || `Slide ${(index % images.length) + 1}`} className={styles.carouselImage} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ImageCarousel;
