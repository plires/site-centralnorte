import { Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FiGrid, FiSearch, FiX } from 'react-icons/fi';
import styles from './SearchBar.module.css';

const SearchBar = ({ onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ products: [], categories: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const debounceRef = useRef(null);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && isOpen) {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        setQuery('');
        setResults({ products: [], categories: [] });
        onClose?.();
    }, [onClose]);

    const searchProducts = useCallback(async (searchQuery) => {
        if (searchQuery.length < 2) {
            setResults({ products: [], categories: [] });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`/products/search?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Error searching products:', error);
            setResults({ products: [], categories: [] });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        // Debounce search
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            searchProducts(value);
        }, 300);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim().length >= 2) {
            handleClose();
            router.visit(`/products?search=${encodeURIComponent(query.trim())}`);
        }
    };

    const handleResultClick = () => {
        handleClose();
    };

    const handleOpen = () => {
        setIsOpen(true);
        // Focus inmediato con pequeño delay para que el elemento sea visible
        setTimeout(() => {
            inputRef.current?.focus();
        }, 50);
    };

    const hasResults = results.products.length > 0 || results.categories.length > 0;
    const showDropdown = isOpen && (query.length >= 2 || isLoading);

    return (
        <div className={styles.searchContainer} ref={containerRef}>
            {/* Botón de búsqueda (cerrado) */}
            <button className={`${styles.searchButton}`} onClick={handleOpen} aria-label="Buscar productos" tabIndex={isOpen ? -1 : 0}>
                <FiSearch className={styles.searchIcon} strokeWidth={1.5} />
            </button>

            {/* Input de búsqueda (con transición) */}
            <div className={`${styles.searchWrapper} ${isOpen ? styles.searchWrapperOpen : ''}`}>
                <form onSubmit={handleSubmit} className={styles.searchForm}>
                    <FiSearch className={styles.inputIcon} strokeWidth={1.5} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        placeholder="Buscar productos..."
                        className={styles.searchInput}
                        autoComplete="off"
                    />
                    {query && (
                        <button
                            type="button"
                            className={styles.clearButton}
                            onClick={() => {
                                setQuery('');
                                setResults({ products: [], categories: [] });
                                inputRef.current?.focus();
                            }}
                            aria-label="Limpiar búsqueda"
                        >
                            <FiX strokeWidth={1.5} />
                        </button>
                    )}
                    <button type="button" className={styles.closeButton} onClick={handleClose} aria-label="Cerrar búsqueda">
                        <FiX strokeWidth={1.5} />
                    </button>
                </form>

                {/* Dropdown de resultados */}
                {showDropdown && (
                    <div className={styles.dropdown}>
                        {isLoading ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner}></div>
                                <span>Buscando...</span>
                            </div>
                        ) : hasResults ? (
                            <>
                                {/* Categorías */}
                                {results.categories.length > 0 && (
                                    <div className={styles.section}>
                                        <h4 className={styles.sectionTitle}>Categorías</h4>
                                        {results.categories.map((category) => (
                                            <Link
                                                key={`cat-${category.id}`}
                                                href={`/products?category=${category.id}`}
                                                className={styles.categoryItem}
                                                onClick={handleResultClick}
                                            >
                                                {category.icon_url ? (
                                                    <img src={category.icon_url} alt="" className={styles.categoryIcon} />
                                                ) : (
                                                    <FiGrid className={styles.categoryIcon} strokeWidth={1} />
                                                )}
                                                <span>{category.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* Productos */}
                                {results.products.length > 0 && (
                                    <div className={styles.section}>
                                        <h4 className={styles.sectionTitle}>Productos</h4>
                                        {results.products.map((product) => (
                                            <Link key={`prod-${product.id}`} href="#" className={styles.productItem} onClick={handleResultClick}>
                                                <div className={styles.productImage}>
                                                    <img src={product.image} alt={product.name} />
                                                </div>
                                                <div className={styles.productInfo}>
                                                    <span className={styles.productName}>{product.name}</span>
                                                    {product.category && <span className={styles.productCategory}>{product.category}</span>}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* Ver todos los resultados */}
                                <div className={styles.viewAll}>
                                    <Link
                                        href={`/products?search=${encodeURIComponent(query)}`}
                                        onClick={handleResultClick}
                                        className={styles.viewAllLink}
                                    >
                                        Ver todos los resultados para "{query}"
                                    </Link>
                                </div>
                            </>
                        ) : query.length >= 2 ? (
                            <div className={styles.noResults}>
                                <p>No encontramos resultados para "{query}"</p>
                                <span>Intentá con otro término de búsqueda</span>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
