import { Link } from '@inertiajs/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './Pagination.module.css';

const Pagination = ({ links, currentPage, lastPage }) => {
    if (lastPage <= 1) return null;

    // Filtrar links de navegación (excluir Previous y Next)
    const pageLinks = links.filter((link) => !link.label.includes('Previous') && !link.label.includes('Next'));

    // Obtener links de Previous y Next
    const prevLink = links.find((link) => link.label.includes('Previous'));
    const nextLink = links.find((link) => link.label.includes('Next'));

    return (
        <nav className={styles.pagination} aria-label="Paginación de productos">
            {/* Botón anterior */}
            {prevLink?.url ? (
                <Link href={prevLink.url} className={styles.navButton} aria-label="Página anterior">
                    <FiChevronLeft />
                </Link>
            ) : (
                <span className={`${styles.navButton} ${styles.disabled}`} aria-disabled="true">
                    <FiChevronLeft />
                </span>
            )}

            {/* Indicador mobile: Página X de Y */}
            <span className={styles.mobileIndicator}>
                {currentPage} / {lastPage}
            </span>

            {/* Números de página (solo desktop) */}
            <div className={styles.pages}>
                {pageLinks.map((link, index) => {
                    // Manejar elipsis
                    if (link.label === '...') {
                        return (
                            <span key={index} className={styles.ellipsis}>
                                ···
                            </span>
                        );
                    }

                    if (link.active) {
                        return (
                            <span key={index} className={`${styles.pageLink} ${styles.active}`} aria-current="page">
                                {link.label}
                            </span>
                        );
                    }

                    return (
                        <Link key={index} href={link.url} className={styles.pageLink}>
                            {link.label}
                        </Link>
                    );
                })}
            </div>

            {/* Botón siguiente */}
            {nextLink?.url ? (
                <Link href={nextLink.url} className={styles.navButton} aria-label="Página siguiente">
                    <FiChevronRight />
                </Link>
            ) : (
                <span className={`${styles.navButton} ${styles.disabled}`} aria-disabled="true">
                    <FiChevronRight />
                </span>
            )}
        </nav>
    );
};

export default Pagination;
