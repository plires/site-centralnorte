import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { FiChevronDown, FiFilter, FiGrid, FiX } from 'react-icons/fi';
import styles from './CategorySidebar.module.css';

const CategorySidebar = ({ categories, selectedCategory }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    const selectedCategoryName = selectedCategory?.name || 'Todos los productos';

    return (
        <>
            {/* Botón mobile para abrir filtros */}
            <button className={styles.mobileToggle} onClick={toggleSidebar} aria-label="Filtrar por categorías">
                <FiFilter className={styles.filterIcon} />
                <span className={styles.toggleText}>{selectedCategoryName}</span>
                <FiChevronDown className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
            </button>

            {/* Overlay para cerrar en mobile */}
            {isOpen && <div className={styles.overlay} onClick={closeSidebar} />}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
                {/* Header mobile */}
                <div className={styles.sidebarHeader}>
                    <h3 className={styles.sidebarTitle}>Filtrar por Categorías</h3>
                    <button className={styles.closeButton} onClick={closeSidebar} aria-label="Cerrar filtros">
                        <FiX />
                    </button>
                </div>

                {/* Lista de categorías */}
                <nav className={styles.nav}>
                    {/* Opción "Todos los productos" */}
                    <Link
                        href={route('public.products')}
                        className={`${styles.categoryItem} ${!selectedCategory ? styles.active : ''}`}
                        onClick={closeSidebar}
                    >
                        Todos los productos
                    </Link>

                    {/* Categorías */}
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={route('public.products', { category: category.id })}
                            className={`${styles.categoryItem} ${selectedCategory?.id === category.id ? styles.active : ''}`}
                            onClick={closeSidebar}
                        >
                            {category.icon_url ? (
                                <img src={category.icon_url} alt="" className={styles.categoryIcon} />
                            ) : (
                                <FiGrid className={styles.categoryIcon} strokeWidth={1} />
                            )}
                            <span>{category.name}</span>
                        </Link>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default CategorySidebar;
