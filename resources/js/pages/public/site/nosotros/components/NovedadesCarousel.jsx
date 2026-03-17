import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaImage } from 'react-icons/fa6';
import styles from './NovedadesCarousel.module.css';

const NovedadesCarousel = ({ novedades = [] }) => {
    // Loop solo cuando hay suficientes productos para desbordar el viewport en todos los breakpoints
    // (xl muestra 6 por fila → necesitamos más de 6 para garantizar overflow)
    const shouldLoop = novedades.length > 6;

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

    // Si no hay productos, no mostrar el componente
    if (novedades.length === 0) {
        return null;
    }

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>Novedades</h2>

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
                        {novedades.map((product) => (
                            <div key={product.id} className={styles.slide}>
                                <div className={styles.slideContent}>
                                    <a href={`/products/${product.id}`} className={styles.slideLink}>
                                        <div className={styles.imageWrapper}>
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className={styles.image} loading="lazy" decoding="async" />
                                            ) : (
                                                <FaImage className={styles.imageNoProduct} aria-hidden="true" />
                                            )}
                                        </div>
                                        <h3 className={styles.name}>{product.name}</h3>
                                        {product.description && <p className={styles.description}>{product.description}</p>}
                                    </a>
                                </div>
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
        </section>
    );
};

export default NovedadesCarousel;
