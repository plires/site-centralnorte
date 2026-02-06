import { Link } from '@inertiajs/react';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import styles from './Breadcrumbs.module.css';

const Breadcrumbs = ({ category, productName }) => {
    return (
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <ol className={styles.list}>
                <li className={styles.item}>
                    <Link href="/" className={styles.link}>
                        <FiHome className={styles.homeIcon} strokeWidth={1.5} />
                        <span>Home</span>
                    </Link>
                </li>

                <li className={styles.separator}>
                    <FiChevronRight strokeWidth={1.5} />
                </li>

                {category ? (
                    <>
                        <li className={styles.item}>
                            <Link href={`/products?category=${category.id}`} className={styles.link}>
                                {category.name}
                            </Link>
                        </li>
                        <li className={styles.separator}>
                            <FiChevronRight strokeWidth={1.5} />
                        </li>
                    </>
                ) : (
                    <>
                        <li className={styles.item}>
                            <Link href="/products" className={styles.link}>
                                Productos
                            </Link>
                        </li>
                        <li className={styles.separator}>
                            <FiChevronRight strokeWidth={1.5} />
                        </li>
                    </>
                )}

                <li className={styles.item}>
                    <span className={styles.current}>{productName}</span>
                </li>
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
