import { useEffect, useRef, useState } from 'react';
import styles from './ColorCircle.module.css';

const ColorCircle = ({ primaryColor, secondaryColor, title, stock, isActive, onClick }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState('center'); // 'left', 'center', 'right'
    const wrapperRef = useRef(null);
    const tooltipRef = useRef(null);

    // Sanitizar el título para el tooltip: eliminar "." y "..." y limpiar separadores vacíos
    const sanitizedTitle = title
        ?.split(' / ')
        .map((part) => part.trim())
        .filter((part) => part && part !== '.' && part !== '...')
        .join(' / ') || '';

    const isSameColor = primaryColor === secondaryColor || !secondaryColor;

    const circleStyle = isSameColor
        ? { backgroundColor: primaryColor || '#ccc' }
        : {
              background: `linear-gradient(90deg, ${primaryColor || '#ccc'} 0%, ${primaryColor || '#ccc'} 50%, ${secondaryColor || '#ccc'} 50%, ${secondaryColor || '#ccc'} 100%)`,
          };

    const classNames = [styles.circle, isActive ? styles.active : ''].filter(Boolean).join(' ');

    // Calcular posición del tooltip cuando se muestra
    useEffect(() => {
        if (showTooltip && wrapperRef.current && tooltipRef.current) {
            const wrapperRect = wrapperRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            // Calcular si el tooltip se sale por la izquierda o derecha
            const tooltipLeft = wrapperRect.left + wrapperRect.width / 2 - tooltipRect.width / 2;
            const tooltipRight = tooltipLeft + tooltipRect.width;

            if (tooltipLeft < 8) {
                setTooltipPosition('left');
            } else if (tooltipRight > viewportWidth - 8) {
                setTooltipPosition('right');
            } else {
                setTooltipPosition('center');
            }
        }
    }, [showTooltip]);

    const tooltipClasses = [styles.tooltip, styles[`tooltip${tooltipPosition.charAt(0).toUpperCase() + tooltipPosition.slice(1)}`]]
        .filter(Boolean)
        .join(' ');

    return (
        <div ref={wrapperRef} className={styles.wrapper} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
            <button type="button" className={classNames} style={circleStyle} onClick={onClick} aria-label={`Ver color ${title}`} />

            {/* Tooltip personalizado */}
            {showTooltip && (
                <div ref={tooltipRef} className={tooltipClasses}>
                    <span className={styles.tooltipTitle}>{sanitizedTitle}</span>
                    {stock !== undefined && <span className={styles.tooltipStock}>Disponible: {stock}</span>}
                </div>
            )}
        </div>
    );
};

export default ColorCircle;
