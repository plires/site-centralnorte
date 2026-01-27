import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './HeroSlider.module.css';

const AUTOPLAY_INTERVAL = 5000;

const HeroSlider = ({ slides = [] }) => {
    const [current, setCurrent] = useState(0);
    const timerRef = useRef(null);

    const total = slides.length;

    const startAutoplay = useCallback(() => {
        if (total <= 1) return;
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrent((prev) => (prev + 1) % total);
        }, AUTOPLAY_INTERVAL);
    }, [total]);

    const goTo = (index) => {
        setCurrent(index);
        startAutoplay();
    };

    useEffect(() => {
        startAutoplay();
        return () => clearInterval(timerRef.current);
    }, [startAutoplay]);

    if (total === 0) return null;

    return (
        <div className={styles.slider}>
            {slides.map((slide, index) => (
                <div key={slide.id} className={`${styles.slide} ${index === current ? styles.active : ''}`}>
                    {/* Desktop image */}
                    <img className={styles.slideImageDesktop} src={slide.image_desktop_url} alt={slide.title} />

                    {/* Mobile image */}
                    <img className={styles.slideImageMobile} src={slide.image_mobile_url} alt={slide.title} />

                    {/* Overlay: title + CTA */}
                    <div className={styles.slideOverlay}>
                        <div className="container">
                            <div className="row">
                                <div className="col-6">
                                    <div className={styles.slideContent}>
                                        <h2 className={styles.slideTitle}>{slide.title}</h2>
                                        {slide.link && (
                                            <a href={slide.link} className={styles.slideLink}>
                                                Consultanos
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            ))}

            {/* Indicators */}
            {total > 1 && (
                <ul className={styles.indicators}>
                    {slides.map((_, index) => (
                        <li key={index}>
                            <button
                                className={`${styles.indicator} ${index === current ? styles.active : ''}`}
                                onClick={() => goTo(index)}
                                aria-label={`Slide ${index + 1}`}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default HeroSlider;
