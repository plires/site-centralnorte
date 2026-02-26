import ondaImg from '@/../images/commons/onda.webp';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaImage } from 'react-icons/fa6';
import styles from './ProductCarousel.module.css';

/**
 * ProductCarousel - Carrusel de productos reutilizable para el sitio público.
 *
 * @param {string} title     - Título de la sección
 * @param {Array}  products  - Lista de productos: [{ id, name, image, description }]
 */
const ProductCarousel = ({ title, products = [] }) => {
    // Loop solo cuando hay suficientes productos para desbordar el viewport en todos los breakpoints
    // (xxl muestra 5 por fila → necesitamos más de 5 para garantizar overflow)
    const shouldLoop = products.length > 5;

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: shouldLoop,
            align: 'start',
            slidesToScroll: 1,
        },
        [
            Autoplay({
                delay: 3000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
            }),
        ],
    );

    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    // No renderizar si hay menos de 6 productos: con pocos productos el carrusel
    // no desborda el viewport en pantallas grandes y el espaciado queda desigual
    if (products.length < 6) {
        return null;
    }

    return (
        <>
            <section className={styles.section}>
                <div className={styles.contentWave}>
                    <img src={ondaImg} alt="onda" aria-hidden="true" className={styles.wave} />
                    <div className="container">
                        <h3 className={styles.title}>{title}</h3>
                    </div>
                </div>
                <div className="container">
                    <div className={styles.carouselContainer}>
                        <button
                            className={`${styles.navButton} ${styles.navButtonPrev}`}
                            onClick={scrollPrev}
                            disabled={!prevBtnEnabled}
                            aria-label="Anterior"
                        >
                            <FaChevronLeft />
                        </button>

                        <div className={styles.carouselWrapper} ref={emblaRef}>
                            <div className={styles.track}>
                                {products.map((product) => (
                                    <div key={product.id} className={styles.slide}>
                                        <a href={`/products/${product.id}`} className={styles.slideLink}>
                                            <div className={styles.imageWrapper}>
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className={styles.image}
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                ) : (
                                                    <FaImage className={styles.imageNoProduct} aria-hidden="true" />
                                                )}
                                            </div>
                                            <h3 className={styles.name}>{product.name}</h3>
                                            {product.description && <p className={styles.description}>{product.description}</p>}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            className={`${styles.navButton} ${styles.navButtonNext}`}
                            onClick={scrollNext}
                            disabled={!nextBtnEnabled}
                            aria-label="Siguiente"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProductCarousel;
