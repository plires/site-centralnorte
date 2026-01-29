import { Link } from '@inertiajs/react';
import styles from './Button.module.css';

/**
 * Button - Componente de botón reutilizable para el sitio público
 *
 * @param {string} children - Contenido del botón
 * @param {string} href - URL del enlace (interno o externo)
 * @param {boolean} external - Si es true, abre en nueva pestaña (default: false)
 * @param {string} variant - Variante de color: 'primary' | 'secondary' | 'tertiary' | 'white' | 'outline-primary' | 'outline-secondary' | 'outline-tertiary' (default: 'outline-tertiary')
 * @param {string} size - Tamaño: 'sm' | 'md' | 'lg' (default: 'md')
 * @param {string} className - Clases CSS adicionales
 * @param {function} onClick - Handler para click (solo para botones sin href)
 * @param {string} type - Tipo de botón: 'button' | 'submit' (default: 'button')
 * @param {boolean} disabled - Si el botón está deshabilitado
 */
const Button = ({
    children,
    href,
    external = false,
    variant = 'outline-tertiary',
    size = 'md',
    className = '',
    onClick,
    type = 'button',
    disabled = false,
    ...props
}) => {
    const classNames = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ');

    // Si tiene href, es un enlace
    if (href) {
        // Enlace externo
        if (external) {
            return (
                <a href={href} target="_blank" rel="noopener noreferrer" className={classNames} {...props}>
                    {children}
                </a>
            );
        }

        // Enlace interno con Inertia
        return (
            <Link href={href} className={classNames} {...props}>
                {children}
            </Link>
        );
    }

    // Si no tiene href, es un botón
    return (
        <button type={type} className={classNames} onClick={onClick} disabled={disabled} {...props}>
            {children}
        </button>
    );
};

export default Button;
