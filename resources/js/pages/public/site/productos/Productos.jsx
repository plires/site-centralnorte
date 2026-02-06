import LayoutPublic from '@/layouts/public/public-layout';
import CategorySidebar from './components/CategorySidebar';
import Pagination from './components/Pagination';
import ProductCard from './components/ProductCard';
import styles from './Productos.module.css';

const Productos = ({ products, categories, selectedCategory }) => {
    const { data, links, current_page, last_page, total } = products;

    const pageTitle = selectedCategory ? selectedCategory.name : 'Todos los productos';
    const selectedCategoryDescription = selectedCategory?.description || null;

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.layout}>
                    {/* Sidebar de categorías */}
                    <div className={styles.sidebarColumn}>
                        <CategorySidebar categories={categories} selectedCategory={selectedCategory} />
                    </div>

                    {/* Grid de productos */}
                    <div className={styles.contentColumn}>
                        {/* Título de la página */}
                        <div className={styles.pageHeader}>
                            <h1 className={styles.pageTitle}>{pageTitle}</h1>
                            <p className={styles.productCount}>
                                {total} producto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
                            </p>
                            <p className={styles.categoryDescription}>{selectedCategoryDescription}</p>
                        </div>

                        {data.length > 0 ? (
                            <>
                                <div className={styles.productsGrid}>
                                    {data.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {/* Paginación */}
                                <Pagination links={links} currentPage={current_page} lastPage={last_page} />
                            </>
                        ) : (
                            <div className={styles.emptyState}>
                                <p className={styles.emptyText}>No se encontraron productos en esta categoría.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

Productos.layout = (page) => <LayoutPublic children={page} />;

export default Productos;
